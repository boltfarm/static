Bolt Farm Treehouse — Static Pages Site
What This Is
A GitHub repo that hosts HTML pages built from Claude Cowork sessions. Drop an HTML file into pages/, push, and a GitHub Action regenerates the index and Cloudflare Pages deploys it. That's it.
Repo Structure
bft-pages/
  .github/
    workflows/
      build-index.yml
  index.html            ← auto-generated, DO NOT edit manually
  style.css             ← minimal shared stylesheet for the index page
  pages/                ← drop HTML files here
    example.html
  scripts/
    build-index.js      ← Node script the Action runs to regenerate index.html
How It Works

Someone drops an .html file into pages/ and pushes (or merges a PR).
The GitHub Action runs scripts/build-index.js.
That script scans every .html file in pages/, reads the <title> tag from each, and generates index.html — a simple linked list of all pages sorted newest-first by git commit date.
The Action commits the updated index.html back to main.
Cloudflare Pages auto-deploys from main.

GitHub Action — .github/workflows/build-index.yml
yamlname: Build Index

on:
  push:
    branches: [main]
    paths:
      - 'pages/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build index
        run: node scripts/build-index.js

      - name: Commit updated index
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add index.html
          git diff --cached --quiet || git commit -m "Update index"
          git push
Index Builder — scripts/build-index.js
jsconst fs = require('fs');
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
Shared Stylesheet — style.css
css* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fafafa;
  color: #1a1a1a;
  padding: 3rem 1.5rem;
}

.container {
  max-width: 640px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #888;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

ul { list-style: none; }

li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.625rem 0;
  border-bottom: 1px solid #eee;
}

a {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
}

a:hover { color: #2563eb; }

.date {
  color: #999;
  font-size: 0.8rem;
  white-space: nowrap;
  margin-left: 1rem;
}
Sample Page — pages/example.html
html<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example Page</title>
</head>
<body>
  <h1>Hello from Bolt Farm Treehouse</h1>
  <p>This is a sample page. Replace it with real work.</p>
</body>
</html>
Setup Steps

Create a GitHub repo called bft-pages (or whatever you want).
Push this file structure to main.
Go to Cloudflare Pages → Create a project → Connect to the GitHub repo.
Set the build output directory to / (root). No build command needed — Cloudflare just serves the static files.
Deploy. You'll get a URL like bft-pages.pages.dev.
Optional: add a custom domain in Cloudflare Pages settings.

Usage
To add a page from Cowork:

Save your HTML file.
Add it to the pages/ folder in the repo.
Push to main.
The Action rebuilds the index, Cloudflare deploys, and it's live.

That's it. No config, no frontmatter, no build tools. Just HTML files and a link list.
