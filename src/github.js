const fs = require('fs').promises;

const createComment = async (body) => {
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.repository.name;
    const issue_number = github.context.payload.pull_request.number;

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

const createCommit = async (changedFiles) => {
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.repository.name;
    const headRef = github.context.payload.pull_request.head.ref;
    const headSHA = github.context.payload.pull_request.head.sha;

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

module.exports = {
    createComment,
    createCommit
};
