const { Configuration, OpenAIApi } = require('openai-api');
const Settings = require('./settings');

const getModelResponse = async (prompt) => {
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

module.exports = {
    getModelResponse,
};