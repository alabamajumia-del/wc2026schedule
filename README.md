# World Cup 2026 Schedule

A public World Cup 2026 schedule planning site with the full 104-match table, PDF downloads, Excel and CSV files, host city guides, bracket routes, TV schedule context, ticket planning notes, match detail pages and schedule news updates.

Website: https://worldcup2026schedule.net/world-cup-2026-schedule/

## What This Site Provides

- Full World Cup 2026 schedule table with match numbers, dates, teams, stages, groups, host cities, stadiums and kickoff windows.
- Downloadable schedule files, including PDF, Excel and CSV formats.
- Host city planning pages for venue, travel and match-density comparison.
- Bracket and knockout route pages for final-week planning.
- TV schedule and where-to-watch planning pages.
- Ticket planning pages that point users back to official sources for final decisions.
- News pages for source summaries, planning updates and schedule-related articles.

## Core Pages

| Page | URL |
| --- | --- |
| Schedule hub | https://worldcup2026schedule.net/world-cup-2026-schedule/ |
| News hub | https://worldcup2026schedule.net/world-cup-2026-schedule-news/ |
| PDF downloads | https://worldcup2026schedule.net/world-cup-2026-schedule-pdf/ |
| Excel and CSV downloads | https://worldcup2026schedule.net/world-cup-2026-schedule-excel/ |
| Bracket hub | https://worldcup2026schedule.net/world-cup-2026-schedule-bracket/ |
| Host cities hub | https://worldcup2026schedule.net/world-cup-2026-schedule-host-cities/ |
| TV schedule | https://worldcup2026schedule.net/world-cup-2026-tv-schedule/ |
| Tickets guide | https://worldcup2026schedule.net/world-cup-2026-tickets/ |

## Local Development

Install dependencies:

```bash
npm install
```

Build the static site:

```bash
npm run build
```

Run the local preview server:

```bash
npm run dev
```

Default local preview:

```text
http://localhost:3000
```

Production build output:

```text
dist/
```

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/content.mjs` | Site metadata, page content, SEO fields, FAQs and internal links |
| `src/matches.mjs` | Structured match schedule data |
| `src/styles.css` | Global site styles |
| `scripts/generate-site.mjs` | Static HTML, sitemap, robots, downloads and redirects generator |
| `scripts/serve-site.mjs` | Local preview server |
| `scripts/post-deploy-verify.mjs` | Production deployment verification script |

## Deployment

The site is deployed to Cloudflare Pages.

Production domain:

```text
https://worldcup2026schedule.net
```

Post-deploy verification:

```bash
npm run verify:post-deploy
```

## Disclaimer

World Cup 2026 Schedule is an independent planning guide. It is not an official FIFA, tournament organizer, ticketing, stadium, host city, broadcaster or team website. Always confirm match, ticket, travel and broadcast details with official sources before making paid or time-sensitive decisions.
