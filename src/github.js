import { promises as fs } from 'fs';
import path from 'path';
import { context, getOctokit } from '@actions/github';
import { GITHUB_TOKEN } from './settings';

export const createComment = async (body) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const issue_number = context.payload.pull_request.number;

    return client.issues.createComment({ owner, repo, issue_number, body });
};

const createBlobs = async ({ owner, repo, filePaths }) => {
    return await Promise.all(filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, { encoding: 'base64' });
        const blob = client.git.createBlob({ owner, repo, content, encoding: 'base64' });
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

    const lastCommit = await client.git.getCommit({ owner, repo, commit_sha: headSHA });

    const baseTree = lastCommit.data.tree.sha;
    const blobs = await createBlobs({ owner, repo, filePaths: changedFiles });
    const tree = await client.git.createTree({ owner, repo, base_tree: baseTree, tree: blobs });
    const commit = await client.git.createCommit({
        owner,
        repo,
        message: 'Generated descriptions',
        tree: tree.data.sha,
        parents: [headSHA]
    });

    await client.git.updateRef({ owner, repo, ref: `heads/${headRef}`, sha: commit.data.sha });
};

export const getChangedFiles = async () => {
    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
        return [];
    }

    const client = getOctokit(GITHUB_TOKEN);
    const changedFiles = await client.rest.pulls.listFiles({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pullRequest.number
    });

    const markdownFiles = changedFiles.data
        .map(file => file.filename)
        .filter(f => !f.match(/\node_modules\//))
        .filter(f => f.match(/\.(md|markdown)$/i))
        .map(f => path.resolve(f));

    return markdownFiles; 
};
