## Build

```
npm run build
```

## Setup workflow in repository

1. Add the following to your repository's `.github/workflows/main.yml` file:

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
      - name: Generate content for Jekyll Pages
        uses: AlphaGit/jekyll-seo-ai-action
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

2. Setup the following configuration variables in your repo:

- `OPENAI_API_KEY`: Your OpenAI API key.

There's no need to set up a GITHUB_TOKEN variable (although you can if you want to). The action will automatically create a token for you.
