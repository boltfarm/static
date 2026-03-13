const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PAGES_DIR = path.join(__dirname, '..', 'pages');
const OUTPUT = path.join(__dirname, '..', 'index.html');
const SITE_TITLE = 'Bolt Farm Treehouse';

// Get all HTML files in pages/
const files = fs.readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('.html'));

// Extract title and git date for each file
const pages = files.map(file => {
  const filePath = path.join(PAGES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Pull <title> tag, fall back to filename
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : file.replace('.html', '');

  // Get the date this file was last committed
  let date;
  try {
    const gitDate = execSync(
      `git log -1 --format=%cI -- "pages/${file}"`,
      { encoding: 'utf-8' }
    ).trim();
    date = gitDate ? new Date(gitDate) : new Date();
  } catch {
    date = new Date();
  }

  return { file, title, date };
});

// Sort newest first
pages.sort((a, b) => b.date - a.date);

// Build the index HTML
const listItems = pages.map(p => {
  const dateStr = p.date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  return `      <li><a href="pages/${p.file}">${p.title}</a><span class="date">${dateStr}</span></li>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_TITLE}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>${SITE_TITLE}</h1>
    <p class="subtitle">${pages.length} page${pages.length !== 1 ? 's' : ''}</p>
    <ul>
${listItems}
    </ul>
  </div>
</body>
</html>`;

fs.writeFileSync(OUTPUT, html);
console.log(`Built index with ${pages.length} pages.`);
