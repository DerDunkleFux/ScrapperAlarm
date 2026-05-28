# Google Search Scraper

Minimal TypeScript Playwright scraper using pnpm.

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env
```

Edit `.env`:

```env
SEARCH_QUERY=playwright typescript tutorial
```

## Run the scraper

```bash
pnpm scrape
```

The scraper opens Google, searches the query, extracts result titles, and writes:

```txt
data/google-results.json
```

## Open Playwright Codegen

Use this to discover selectors visually:

```bash
pnpm codegen https://www.google.com
```

Or:

```bash
pnpm exec playwright codegen https://www.google.com
```
So kannst du easy codegeneration haben mit der UI into ts code sehr praktisch und vermutlich die meiste Zeit login,zur richtigen seite navigiern wird alles gespeichert wenn du den knopf mit den play ding drückst in der UI.
## Build TypeScript

```bash
pnpm build
```

## Run compiled JavaScript

```bash
pnpm start
```
