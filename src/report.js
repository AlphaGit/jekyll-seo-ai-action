    export const generateReport = (results) => {
        const lines = [];
        if (results.length === 0) {
            lines.push(`No files to generate SEO content were detected in this pull request.`);
            lines.push(`-- [Jekyll SEO AI Action](https://github.com/AlphaGit/jekyll-seo-ai-action)`);
        } else {
            lines.push(``);
            lines.push(`# Updated files`);
            lines.push(`| File | Generated description | Status | Error Description |`);
            lines.push(`| :--- | :--- | :--- | :--- |`);
            results.forEach(r => {
                lines.push(`| \`${r.page}\` | ${r.description} | ${r.status} | ${r.errorDescription} |`);
            });
            lines.push(``);
        }
        lines.push(`These changes were automatically generated by [Jekyll SEO AI Action](https://github.com/AlphaGit/jekyll-seo-ai-action).`);
        return lines.join(`\n`);
    };
