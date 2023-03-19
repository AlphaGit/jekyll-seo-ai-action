const fs = require('fs').promises;
const yaml = require('js-yaml');

const settings = require('./settings');
const openaiClient = require('./openai-client');

const FRONT_MATTER_REGEX = /---(.*)---/s;
const PAGE_ENCODING = 'utf-8';

class DescriptionResult {
    constructor(page, description) {
        this.page = page;
        this.description = description;
    }
}

const generateDescription = async (page) => {
    const pageContents = await fs.read(page, PAGE_ENCODING);
    const rawFrontMatter = pageContents.match(FRONT_MATTER_REGEX)[1];
    const fronMatter = yaml.load(rawFrontMatter);

    const body = pageContents.replace(FRONT_MATTER_REGEX, '');

    const prompt = settings.OPENAI_PROMPT.replace('{body}', body);
    const description = await openaiClient.getModelResponse(prompt);

    fronMatter.description = description;
    const newPageContents = `---\n${yaml.dump(fronMatter)}---\n${body}`;
    await fs.write(page, newPageContents, PAGE_ENCODING);

    return new DescriptionResult(page, description);
};

const generateDescriptions = async (pages) => {
    const resultTasks = pages.map(async (page) =>
        await generateDescription(page)
    );
    return await Promise.all(resultTasks);
};

module.exports = {
    generateDescriptions,
};