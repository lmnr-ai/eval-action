import { getInput } from '@actions/core'
import { getOctokit, context } from '@actions/github'
import { Output } from './types'
import { Context } from '@actions/github/lib/context'
import { GitHub } from '@actions/github/lib/utils'

export const addComment = async (outputs: Output[]) => {
  if (outputs.length === 0) {
    return
  }
  const token = getInput('github-token')
  const octokit = getOctokit(token)

  const issueNumbers = await getIssueNumbers(octokit, context)
  console.log('issueNumbers', issueNumbers)
  for (const issueNumber of issueNumbers) {
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNumber,
      body: `
        # Laminar Evaluation Results
        
        ${outputs.map(formatOutput).join('\n\n')}

        <!-- We can add any id/lookup metadata here in comment -->
      `
    })
  }
}

const getIssueNumbers = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context
): Promise<number[]> => {
  const issueNumbers: number[] = []
  if (Number.isSafeInteger(context.issue.number)) {
    issueNumbers.push(context.issue.number)
  }

  if (Number.isSafeInteger(context.payload.pull_request?.number)) {
    issueNumbers.push(context.payload.pull_request!.number)
  }

  if (Number.isSafeInteger(context.payload.issue?.number)) {
    issueNumbers.push(context.payload.issue!.number)
  }

  if (issueNumbers.length > 0) {
    return Array.from(new Set(issueNumbers))
  }

  const pulls = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: context.sha
  })

  return pulls.data.map((pull) => pull.number)
}

const formatOutput = (output: Output) => {
  return `
    ## ${output.filename ?? 'Evaluation file'}
    
    ${output.resultUrl ? `[View results](${output.resultUrl})` : ''}
    
    ### Average Scores
    ${Object.entries(output.scores.average)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}
  `
}
