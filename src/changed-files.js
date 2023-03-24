import github from '@actions/github';
import path from 'path';

export const getChangedFiles = async () => {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return [];
    }

    const client = new github.GitHub(github.token);
    const listFilesResponse = await client.pulls.listFiles({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pullRequest.number
    });

    const changedFilePaths = listFilesResponse.data
        .map(file => file.filename)
        .filter(f => !f.match(/\node_modules\//))
        .filter(f => f.match(/\.(md|markdown)$/i))
        .map(f => path.resolve(f));

    return changedFilePaths; 
};
