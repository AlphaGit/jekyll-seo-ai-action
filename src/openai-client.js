import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from './settings';
import { encode } from 'gpt-3-encoder';

const tokensForCompletion = 256;

const isTokenCountBeyondLimit = (text) => {
    const encoded = encode(text);
    return encoded.length + tokensForCompletion >= 4097;
};

export const getModelResponse = async (prompt) => {
    if (isTokenCountBeyondLimit(prompt)) {
        throw new Error('Prompt is too long');
    }

    try {
        const configuration = new Configuration({
            apiKey: OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            temperature: 0.7,
            max_tokens: tokensForCompletion,
        });

        const generatedContent = response.data.choices[0].text;
        return (generatedContent || "").trim();
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
        }

        throw error;
    }
};
