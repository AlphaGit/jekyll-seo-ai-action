import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from './settings';

export const getModelResponse = async (prompt) => {
    try {
        const configuration = new Configuration({
            apiKey: OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            temperature: 0.7,
            max_tokens: 256,
        });

        return response.data.choices[0].text;
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
        }

        throw error;
    }
};
