# Jekyll SEO AI Action

This GitHub action will use Open AI's API to generate SEO content for your Jekyll pages as you modify them.

So far it generates `description` tags for modified posts/pages based on the content. It's integrated with the pull request pipeline so that you can review the changes and merge them all together.

## Setup workflow in 2 steps

1. **Setup workflow action**

Commit to your repository a `.github/workflows/main.yml` file with these contents:

```yaml
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    name: Test Content Generator for Jekyll Pages
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Run SEO Content AI Generator
        uses: AlphaGit/jekyll-seo-ai-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Note that the permissions will grant read/write permissions for the whole job executing. This is neede for the bot to write back the updated Jekyll files. However, if this is a security concern for your pipeline, consider separating your pipeline into multiple jobs.

2. **Setup configuration variables**:

Set these configuration variables in your repository's settings:

- `OPENAI_API_KEY`: Your OpenAI API key. You can get an OpenAI API key by signing up to their [developer program](https://platform.openai.com/).

There's no need to set up a GITHUB_TOKEN variable (although you can if you want to). GitHub will automatically create a token for you and inject it in the action.

**That's it!** The action will run on every pull request and will update the Jekyll files with the generated content. You can then review the changes and merge them or apply changes of your own.