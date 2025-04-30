import { exportVariable, getInput, getState, setOutput } from '@actions/core'
import { getExecOutput } from '@actions/exec'
import stripAnsi from 'strip-ansi'
import { Output } from './types'
import { addComment } from './comments'
const IsPost = !!getState('isPost')

const getOrDefaultLanguage = (language: string) => {
  if (
    ['javascript', 'typescript', 'node', 'nodejs'].includes(
      language.toLowerCase()
    )
  ) {
    return 'javascript'
  }
  if (['python', 'py'].includes(language.toLowerCase())) {
    return 'python'
  }
  return 'javascript'
}

const main = async () => {
  const lmnrProjectApiKey = getInput('lmnr-project-api-key')
  exportVariable('LMNR_PROJECT_API_KEY', lmnrProjectApiKey)
  const language = getOrDefaultLanguage(getInput('language'))
  const outputs: Output[] = []
  const command =
    language === 'javascript'
      ? 'npx lmnr eval'
      : `lmnr eval --language ${language}`
  const execOutput = await getExecOutput(command)
  const stdout = execOutput.stdout
  const lines = stdout.split('\n').map(stripAnsi)
  const evalFileNameRegex =
    language === 'javascript'
      ? /INFO \(\d+\): Loading (.*\.(?:ts|js))...$/
      : /INFO: Running evaluation from (.*\.py) \(/
  const resultUrlRegex =
    language === 'javascript'
      ? /Check results at (.*)$/
      : /Check the results at (.*)$/
  let output: Partial<Output> | undefined
  let inResults = false
  for (const line of lines) {
    if (line.length === 0) {
      if (inResults) {
        inResults = false
        outputs.push(output as Output)
        output = undefined
      }
      continue
    }
    const evalFileNameMatch = line.match(evalFileNameRegex)
    if (evalFileNameMatch) {
      if (output) {
        outputs.push(output as Output)
        output = undefined
      }
      const evalFileName = evalFileNameMatch[1]
      output = {
        filename: evalFileName,
        ...(output || {})
      }
    }
    const resultUrlMatch = line.match(resultUrlRegex)
    if (resultUrlMatch) {
      output = {
        resultUrl: resultUrlMatch[1],
        ...(output || {})
      }
    }
    if (line.startsWith('Average scores:')) {
      inResults = true
      continue
    }
    if (inResults) {
      const scores = line.split(':').map((score) => score.trim())
      const newScores = {
        average: {
          ...(output?.scores?.average || {}),
          [scores[0]]: parseFloat(scores[1])
        }
      }
      output = {
        ...(output || {}),
        scores: newScores
      }
    }
  }
  if (output) {
    outputs.push(output as Output)
  }
  const stderr = execOutput.stderr
  const stderrFileNames = stderr
    .split('\n')
    .map((line) => stripAnsi(line).match(evalFileNameRegex))
    .filter((m) => m != null)
    .map((m) => m[1])
  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i]
    if (i < stderrFileNames.length) {
      output.filename = stderrFileNames[i]
    } else {
      break
    }
  }

  setOutput('outputs', outputs)
  addComment(outputs)
}

if (IsPost) {
  console.log('performing post action')
} else {
  console.log('performing main action')
  main()
}
