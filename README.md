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
```

2. Setup the following configuration variables in your repo:

- `OPENAI_API_KEY`: Your OpenAI API key.
