# Nuxt Alarms Display for Interactions Spreadsheet

Nuxt page using Playwright scrraping to read data from google spreadsheet

need .evn file with the current spreadsheets url as SPREASDSHEET_URL = 'link_to_spreadsheet'

#  Scraper

Minimal TypeScript Playwright scraper using pnpm.

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env
```

Edit `.env`:

```bash
pnpm exec playwright codegen https://www.google.com
```

## Build TypeScript

```bash
pnpm build
```

## Run compiled JavaScript

```bash
pnpm start
```

# NUXT
To start local NUXT server after creating .env and installing dependencies
```bash
cd app
pnpm install
pnpm run dev
```
