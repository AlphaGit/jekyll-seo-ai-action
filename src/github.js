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
        author: {
            name: 'Jekyll SEO AI Action',
            email: 'jekyll-seo-action+github-actions[bot]@users.noreply.github.com'
        },
        message: 'Generated descriptions',
        tree: tree.data.sha,
        parents: [headSHA]
    });

    await gitClient.updateRef({ owner, repo, ref: `heads/${headRef}`, sha: commit.data.sha });
};

const listAllPullRequestFiles = async (owner, repo, pull_number, page=1) => {
    const response = await client.rest.pulls.listFiles({
        owner,
        repo,
        pull_number,
        per_page: 100,
        page
    });

    const files = response.data;
    if (files.length < 100) {
        return files;
    }

    const followingFiles = await listAllPullRequestFiles(owner, repo, pull_number, page + 1);
    return [...files, ...followingFiles];
};

export const getChangedFiles = async () => {
    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
        return [];
    }

    const changedFiles = await listAllPullRequestFiles(
        context.repo.owner,
        context.repo.repo,
        pullRequest.number
    );

    const markdownFiles = changedFiles
        .map(file => file.filename)
        .filter(f => !f.match(/\node_modules\//))
        .filter(f => f.match(/\.(md|markdown)$/i));

    return markdownFiles; 
};
