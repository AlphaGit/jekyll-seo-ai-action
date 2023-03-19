require('dotenv').config();

const Settings = {
    OPENAI_PROMPT: process.env.OPENAI_PROMPT,
    OPENAI_KEY: process.env.OPENAI_KEY,
};

module.exports = Settings;
