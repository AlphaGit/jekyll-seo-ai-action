import { getInput } from '@actions/core';

export const OPENAI_PROMPT = `Generate a single-paragraph description to be used in the SEO meta tag for a page. Do not include any kind of code or titles in the response, just plain text. Keep it under 160 characters. Make it a summarized version of a blog post, in the same language the blog post has. The blog post will be present in markdown format. 

---BLOG POST BEGIN---
{body}
---BLOG POST END---
`;
export const OPENAI_API_KEY = getInput('openai-api-key');
export const GITHUB_TOKEN = getInput('github-token');