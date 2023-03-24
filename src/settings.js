import * as dotenv from 'dotenv';

dotenv.config();

export const OPENAI_PROMPT = process.env.OPENAI_PROMPT;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;