import { Configuration, OpenAIApi } from 'openai-api';
import Settings from './settings';

export const getModelResponse = async (prompt) => {
    const configuration = new Configuration({
        apiKey: Settings.OPENAI_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.complete({
        model: 'text-davinci-003',
        prompt,
        temperature: 0.7,
        maxTokens: 256,
    });

    return response.data.choices[0].text;
};
