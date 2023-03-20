const core = require('@actions/core');

const files = require('./src/changed-files.js');
const report = require('./src/report.js');
const gitHub = require('./src/github.js');
const generator = require('./src/generator.js');

const run = async () => {
    try {
        const changedFiles = await files.getChangedFiles();
        const results = await generator.generateDescriptions(changedFiles);
        const reportContent = await report.generateReport(results);

        await gitHub.createCommit(changedFiles);
        await gitHub.createComment(reportContent);
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
