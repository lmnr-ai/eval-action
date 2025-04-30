import { getInput } from '@actions/core'
import { getOctokit, context } from '@actions/github'
import { Output } from './types'

export const addComment = async (outputs: Output[]) => {
  if (outputs.length === 0) {
    return
  }
  const token = getInput('github_token')
  const octokit = getOctokit(token)

  const pulls = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: context.sha
  })

  for (const pull of pulls.data) {
    octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pull.number,
      body: `
        # Laminar Evaluation Results
        
        ${outputs.map(formatOutput).join('\n\n')}

        <!-- We can add any id/lookup metadata here in comment -->
      `
    })
  }
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
