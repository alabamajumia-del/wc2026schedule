# Phase Launch Readiness B: Static 404 Page and Error-State UX

Date: 2026-05-25
Status: Completed

## Purpose

Create a static `404.html` page and update local preview fallback behavior so missing URLs show a clear error page instead of sending users to the homepage. The page should help users recover quickly, avoid indexing, and keep trust-page access visible.

## Implementation

Files changed:

```text
scripts/generate-site.mjs
scripts/serve-site.mjs
src/styles.css
```

Generated output:

```text
dist/404.html
```

## 404 Page UX

The new page includes:

```text
404 error label
H1: Page Not Found
Short explanation for moved, mistyped or outdated URLs
Primary link to /world-cup-2026-schedule/
Secondary link to /contact/
Core planning links:
  /world-cup-2026-schedule/
  /world-cup-2026-schedule-pdf/
  /world-cup-2026-schedule-excel/
  /world-cup-2026-schedule-host-cities/
  /world-cup-2026-schedule-groups/
  /world-cup-2026-schedule-standings/
Trust links:
  /about/
  /contact/
  /privacy-policy/
  /disclaimer/
Footer trust navigation
```

## SEO and Indexing

```text
404 page title: Page Not Found | wc26schedule
Canonical: https://worldcup2026schedule.net/404.html
Robots meta: noindex
Sitemap inclusion: false
AdSense meta/script in default build: false
```

The 404 page is intentionally not included in `sitemap.xml`.

## Preview Server Behavior

Updated local preview fallback:

```text
Before: unknown URLs returned dist/index.html with HTTP 404.
After: unknown URLs return dist/404.html with HTTP 404.
```

This helps local testing match expected production error-state behavior more closely.

## Validation

Build:

```text
npm run build
```

Static output checks:

```text
dist/404.html exists: true
noindex present: true
canonical: https://worldcup2026schedule.net/404.html
H1: Page Not Found
footer trust links present: true
core route links present: true
sitemap includes /404.html: false
AdSense meta present: false
AdSense script present: false
```

Browser checks:

```text
/404.html desktop:
  HTTP status: 200
  overflowX: 0
  noindex: true

/404.html mobile:
  HTTP status: 200
  overflowX: 0
  noindex: true

Unknown URL on fresh local preview server:
  HTTP status: 404
  title: Page Not Found | wc26schedule
  H1: Page Not Found
  noindex: true
  overflowX: 0
```

## Remaining Notes

```text
[ ] Confirm the production hosting platform uses /404.html for unknown static routes.
[ ] After deployment, test a real unknown production URL and confirm HTTP 404 response.
[ ] Keep 404.html out of sitemap.
```

