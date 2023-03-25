import { promises as fs } from 'fs';
import { context, getOctokit } from '@actions/github';
import { GITHUB_TOKEN } from './settings';

const client = getOctokit(GITHUB_TOKEN);
const { rest: { git: gitClient } } = client;

export const createComment = async (body) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const issue_number = context.payload.pull_request.number;

    return client.rest.issues.createComment({ owner, repo, issue_number, body });
};

const createBlobs = async ({ owner, repo, filePaths }) => {
    return await Promise.all(filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, { encoding: 'base64' });
        const blob = await gitClient.createBlob({ owner, repo, content, encoding: 'base64' });
        return {
            path: filePath,
            type: 'blob',
            mode: '100644',
            sha: blob.data.sha
        };
    }));
};

export const createCommit = async (changedFiles) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const headRef = context.payload.pull_request.head.ref;
    const headSHA = context.payload.pull_request.head.sha;

    const lastCommit = await gitClient.getCommit({ owner, repo, commit_sha: headSHA });

    const baseTree = lastCommit.data.tree.sha;
    const blobs = await createBlobs({ owner, repo, filePaths: changedFiles });
    const tree = await gitClient.createTree({ owner, repo, base_tree: baseTree, tree: blobs });
    const commit = await gitClient.createCommit({
        owner,
        repo,
        message: 'Generated descriptions',
        tree: tree.data.sha,
        parents: [headSHA]
    });

    await gitClient.updateRef({ owner, repo, ref: `heads/${headRef}`, sha: commit.data.sha });
};

export const getChangedFiles = async () => {
    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
        return [];
    }

    const changedFiles = await client.rest.pulls.listFiles({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pullRequest.number
    });

    const markdownFiles = changedFiles.data
        .map(file => file.filename)
        .filter(f => !f.match(/\node_modules\//))
        .filter(f => f.match(/\.(md|markdown)$/i));

    return markdownFiles; 
};
