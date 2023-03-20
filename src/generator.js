import { promises as fs } from 'fs';
import { load, dump } from 'js-yaml';

import { OPENAI_PROMPT } from './settings';
import { getModelResponse } from './openai-client';

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
    const fronMatter = load(rawFrontMatter);

    const body = pageContents.replace(FRONT_MATTER_REGEX, '');

    const prompt = OPENAI_PROMPT.replace('{body}', body);
    const description = await getModelResponse(prompt);

    fronMatter.description = description;
    const newPageContents = `---\n${dump(fronMatter)}---\n${body}`;
    await fs.write(page, newPageContents, PAGE_ENCODING);

    return new DescriptionResult(page, description);
};

export const generateDescriptions = async (pages) => {
    const resultTasks = pages.map(async (page) =>
        await generateDescription(page)
    );
    return await Promise.all(resultTasks);
};
