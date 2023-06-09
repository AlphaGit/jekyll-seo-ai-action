import { readFile, writeFile } from 'fs/promises';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

import { OPENAI_PROMPT } from './settings';
import { getModelResponse } from './openai-client';

const FRONT_MATTER_REGEX = /---(.+?)---/su;
const PAGE_ENCODING = 'utf-8';

class DescriptionResult {
    constructor(page, description) {
        this.page = page;
        this.description = description;
    }
}

const generateDescription = async (page) => {
    const pageContents = await readFile(page, PAGE_ENCODING);
    const regexMatch = pageContents.match(FRONT_MATTER_REGEX);
    if (!regexMatch || regexMatch.length < 2) {
        console.warn(`No front matter found for ${page} -- is it really a blog post?`);
        return null;
    }
    const rawFrontMatter = regexMatch[1];
    const fronMatter = yamlLoad(rawFrontMatter);

    if (!fronMatter) {
        console.warn(`No front matter found for ${page} -- is it really a blog post?`);
        return null;
    }
    if (fronMatter && fronMatter.description) {
        console.info(`Front matter already contains a description for ${page} -- skipping`);
        return null;
    }

    const body = pageContents.replace(FRONT_MATTER_REGEX, '');
    const prompt = OPENAI_PROMPT.replace('{body}', body);
    const description = await getModelResponse(prompt);

    fronMatter.description = description;
    const newPageContents = `---\n${yamlDump(fronMatter)}---\n${body}`;
    await writeFile(page, newPageContents, PAGE_ENCODING);

    return new DescriptionResult(page, description);
};

export const generateDescriptions = async (pages) => {
    const resultTasks = pages.map(async (page) => {
        try {
            return await generateDescription(page)
        } catch (error) {
            console.error(`Error generating description for ${page}: ${error}`);
            return null;
        }
    });
    const descriptionResults = await Promise.allSettled(resultTasks);
    const fulfilledPromises = descriptionResults.filter((result) => result.status === 'fulfilled');
    return fulfilledPromises.map((result) => result.value).filter((result) => result !== null);
};
