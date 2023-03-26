import { getInput } from '@actions/core';

export const OPENAI_PROMPT = `Provide exactly 10 words summarizing a blog post provided in markdown format, in the same language as the post. Keep the response without formatting of any kind. 

---BLOG POST BEGIN---
{body}
---BLOG POST END---

10 word summary:
`;
export const OPENAI_API_KEY = getInput('openai-api-key');
export const GITHUB_TOKEN = getInput('github-token');