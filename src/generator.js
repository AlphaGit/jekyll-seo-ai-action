import { readFile, writeFile } from 'fs/promises';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

import { OPENAI_PROMPT } from './settings';
import { getModelResponse } from './openai-client';

const FRONT_MATTER_REGEX = /---(.+?)---/su;
const PAGE_ENCODING = 'utf-8';

export const GenerationStatus = Object.freeze({
    GENERATED: 'Generated',
    SKIPPED: 'Description already present (skipped)',
    FILE_TOO_BIG: 'File too big',
    UNKNOWN_ERROR: 'Unknown error'
});

export class DescriptionResult {
    constructor(page, description, status, errorDescription = '') {
        this.page = page;
        this.description = description;
        this.status = status;
        this.errorDescription = errorDescription;
    }
}

const generateDescription = async (page) => {
    const pageContents = await readFile(page, PAGE_ENCODING);
    const regexMatch = pageContents.match(FRONT_MATTER_REGEX);
    if (!regexMatch || regexMatch.length < 2) {
        console.warn(`No front matter found for ${page} -- is it really a blog post?`);
        return new DescriptionResult(page, null, GenerationStatus.UNKNOWN_ERROR, 'No front matter found');
    }
    const rawFrontMatter = regexMatch[1];
    const fronMatter = yamlLoad(rawFrontMatter);

    if (!fronMatter) {
        console.warn(`No front matter found for ${page} -- is it really a blog post?`);
        return new DescriptionResult(page, null, GenerationStatus.UNKNOWN_ERROR, 'No front matter found');
    }
    if (fronMatter && fronMatter.description) {
        console.info(`Front matter already contains a description for ${page} -- skipping`);
        return new DescriptionResult(page, fronMatter.description, GenerationStatus.SKIPPED);
    }

    const body = pageContents.replace(FRONT_MATTER_REGEX, '');
    const prompt = OPENAI_PROMPT.replace('{body}', body);
    const description = await getModelResponse(prompt);

    fronMatter.description = description;
    const newPageContents = `---\n${yamlDump(fronMatter)}---\n${body}`;
    await writeFile(page, newPageContents, PAGE_ENCODING);

    return new DescriptionResult(page, description, GenerationStatus.GENERATED);
};

export const generateDescriptions = async (pages) => {
    const resultTasks = pages.map(async (page) => {
        try {
            return await generateDescription(page)
        } catch (error) {
            console.error(`Error generating description for ${page}: ${error}`);
            return new DescriptionResult(page, null, GenerationStatus.UNKNOWN_ERROR, error.message);
        }
    });
    const descriptionResults = await Promise.allSettled(resultTasks);
    const fulfilledPromises = descriptionResults.filter((result) => result.status === 'fulfilled');
    return fulfilledPromises.map((result) => result.value).filter((result) => result !== null);
};
