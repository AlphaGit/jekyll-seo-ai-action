export const generateReport = async (results) => {
    const lines = [];

    lines.push(`# Updated files`);
    lines.push(``);
    lines.push(`| File | Generated description |`);
    lines.push(`| --- | :--- |`);
    results.forEach(r => {
        lines.push(`| \`${r.page}\` | ${r.description} |`);
    });

    return lines.join(`\n\r`);
};
