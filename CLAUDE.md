# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A static HTML pages site for Bolt Farm Treehouse. HTML files go in `pages/`, a GitHub Action regenerates `index.html`, and GitHub Pages deploys from `main`.

Live at: https://boltfarm.github.io/static/

## Architecture

- `pages/` — Drop standalone HTML files here. Each is a self-contained page (inline styles, no external dependencies besides fonts).
- `scripts/build-index.js` — Node script that scans `pages/*.html`, reads each `<title>` tag, gets git commit dates, and generates `index.html` as a sorted link list.
- `index.html` — **Auto-generated. Do not edit manually.** Rebuilt by the GitHub Action on every push to `pages/`.
- `style.css` — Shared stylesheet for the index page only (not used by individual pages).
- `.github/workflows/build-index.yml` — Triggers on push to `main` when `pages/**` changes. Runs the build script and commits the updated index.

## Stale files (safe to delete)

- `wrangler.jsonc` — Cloudflare Workers config, not used (deploying via GitHub Pages)
- `spec.md` — Original bootstrap spec, now fully implemented and outdated (references Cloudflare)

## Commands

```bash
# Rebuild the index locally
node scripts/build-index.js

# Preview — just open index.html in a browser (no dev server needed)
```

## Adding a Page

1. Save an HTML file to `pages/`.
2. Ensure it has a `<title>` tag (used for the index listing).
3. Push to `main`. The Action rebuilds the index and GitHub Pages deploys.

## Key Conventions

- Pages are fully self-contained HTML with inline `<style>` blocks — no shared CSS framework.
