# Phase Launch Readiness C: Production Deployment Checklist

Date: 2026-05-25
Status: Deployment checklist prepared; production execution pending

## Purpose

Prepare a practical deployment checklist for publishing wc26schedule to the production domain:

```text
https://worldcup2026schedule.net
```

This checklist separates what is technically ready now from what still depends on owner-provided information, DNS/hosting setup and Google AdSense/Search Console account actions.

## Production Identity

Current source configuration:

```text
Brand: wc26schedule
Domain: worldcup2026schedule.net
Production URL: https://worldcup2026schedule.net
```

Source location:

```text
src/content.mjs
```

Canonical target:

```text
All generated canonical URLs should use https://worldcup2026schedule.net
```

## Deployment Inputs

Required before deployment:

```text
[ ] Choose production hosting platform.
[ ] Connect repository/branch to deployment platform.
[ ] Confirm build command: npm run build
[ ] Confirm output directory: dist
[ ] Configure domain: worldcup2026schedule.net
[ ] Configure www behavior: redirect www to apex or apex to www.
[ ] Enable HTTPS.
[ ] Confirm HTTP redirects to HTTPS.
[ ] Confirm production server can serve clean trailing-slash URLs.
[ ] Confirm unknown routes return /404.html with HTTP 404.
```

Recommended domain behavior:

```text
Primary domain: https://worldcup2026schedule.net
Redirect target: https://www.worldcup2026schedule.net -> https://worldcup2026schedule.net
```

## Environment Variables

Default safe local settings:

```text
ADSENSE_PUBLISHER_ID=
ADSENSE_VERIFICATION_METHOD=off
ADSENSE_ENABLE_SCRIPT=false
ADSENSE_ENABLE_ADS_TXT=false
```

Before AdSense verification:

```text
[ ] Get real AdSense publisher ID from Google AdSense.
[ ] Choose the exact verification method shown in AdSense.
[ ] Configure production environment variables only on the hosting platform.
[ ] Do not commit the real publisher ID to the repo unless deliberately choosing a public config path.
```

Common AdSense verification options:

```text
Meta tag only:
ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
ADSENSE_VERIFICATION_METHOD=meta
ADSENSE_ENABLE_SCRIPT=false
ADSENSE_ENABLE_ADS_TXT=false

Code snippet:
ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
ADSENSE_VERIFICATION_METHOD=code
ADSENSE_ENABLE_SCRIPT=true
ADSENSE_ENABLE_ADS_TXT=false

Both meta and code:
ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
ADSENSE_VERIFICATION_METHOD=both
ADSENSE_ENABLE_SCRIPT=true
ADSENSE_ENABLE_ADS_TXT=false
```

ads.txt after AdSense provides the line:

```text
ADSENSE_ENABLE_ADS_TXT=true
```

Expected production ads.txt format:

```text
google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
```

Important:

```text
Do not enable ads.txt with a fake publisher ID.
Do not enable AdSense scripts before the account/domain setup is ready.
Do not place display ads above core schedule/download tools before UX review.
```

## Pre-Deployment Checklist

Run locally before production deployment:

```text
[ ] npm run build
[ ] Confirm dist/index.html exists.
[ ] Confirm dist/404.html exists.
[ ] Confirm dist/sitemap.xml exists.
[ ] Confirm dist/robots.txt exists.
[ ] Confirm dist/ads.txt exists.
[ ] Confirm dist/downloads/ contains PDF, XLS and CSV files.
[ ] Confirm dist/assets/ contains banner, city and preview images.
```

SEO checks:

```text
[ ] Canonical URLs use https://worldcup2026schedule.net.
[ ] Core pages do not contain noindex.
[ ] Old redirect pages are noindex and excluded from sitemap.
[ ] 404 page is noindex and excluded from sitemap.
[ ] sitemap.xml includes key indexable pages.
[ ] robots.txt points to https://worldcup2026schedule.net/sitemap.xml.
```

Trust and compliance checks:

```text
[ ] Complete launch-checklists/trust-pages-prelaunch-info-checklist.md.
[ ] Confirm /about/ owner/operator wording is final.
[ ] Confirm /contact/ public mailbox is active and tested.
[ ] Confirm /privacy-policy/ matches actual hosting, analytics, cookies, email and AdSense setup.
[ ] Confirm /disclaimer/ language is owner-approved.
[ ] Confirm footer trust links appear on core pages.
```

## Production Deployment Steps

Generic static hosting workflow:

```text
1. Push latest main branch to GitHub.
2. Connect production hosting to the GitHub repository.
3. Set build command to npm run build.
4. Set output directory to dist.
5. Configure environment variables.
6. Add production domain worldcup2026schedule.net.
7. Configure DNS according to the hosting provider.
8. Enable HTTPS.
9. Trigger production deploy.
10. Wait until the deploy is live.
```

DNS notes:

```text
[ ] Add required A/CNAME records from the hosting provider.
[ ] Decide whether www redirects to apex.
[ ] Confirm DNS propagation.
[ ] Confirm HTTPS certificate issuance.
```

## Post-Deployment Verification

Open these URLs in production:

```text
https://worldcup2026schedule.net/
https://worldcup2026schedule.net/world-cup-2026-schedule/
https://worldcup2026schedule.net/world-cup-2026-schedule-pdf/
https://worldcup2026schedule.net/world-cup-2026-schedule-excel/
https://worldcup2026schedule.net/world-cup-2026-schedule-host-cities/
https://worldcup2026schedule.net/world-cup-2026-schedule-groups/
https://worldcup2026schedule.net/world-cup-2026-schedule-standings/
https://worldcup2026schedule.net/about/
https://worldcup2026schedule.net/contact/
https://worldcup2026schedule.net/privacy-policy/
https://worldcup2026schedule.net/disclaimer/
```

Production file checks:

```text
https://worldcup2026schedule.net/sitemap.xml
https://worldcup2026schedule.net/robots.txt
https://worldcup2026schedule.net/ads.txt
https://worldcup2026schedule.net/404.html
```

Unknown URL check:

```text
https://worldcup2026schedule.net/this-page-should-404/
```

Expected:

```text
HTTP status: 404
Title: Page Not Found | wc26schedule
Meta robots: noindex
```

HTTPS and canonical checks:

```text
[ ] http://worldcup2026schedule.net redirects to https://worldcup2026schedule.net.
[ ] www behavior matches the chosen canonical domain.
[ ] Page source canonical uses https://worldcup2026schedule.net.
[ ] No localhost URL appears in production HTML.
```

Mobile checks:

```text
[ ] Test home page on mobile.
[ ] Test full schedule page on mobile.
[ ] Test PDF page on mobile.
[ ] Test Excel page on mobile.
[ ] Test host cities page on mobile.
[ ] Test groups page on mobile.
[ ] Test standings page on mobile.
[ ] Test trust pages on mobile.
[ ] Confirm no horizontal overflow.
```

Download checks:

```text
[ ] Download printable PDF.
[ ] Download overview PDF.
[ ] Download stage overview PDF.
[ ] Download bracket PDF.
[ ] Download Excel workbook.
[ ] Download CSV file.
[ ] Open at least one file locally to confirm it is not corrupted.
```

## Search Console Readiness

Before submitting sitemap:

```text
[ ] Production site is live over HTTPS.
[ ] robots.txt is accessible.
[ ] sitemap.xml is accessible.
[ ] 404 behavior is correct.
[ ] Trust pages are live and final enough for public visitors.
[ ] No fake AdSense publisher ID appears.
```

Search Console steps:

```text
1. Add domain property for worldcup2026schedule.net.
2. Complete DNS verification or URL-prefix verification.
3. Submit https://worldcup2026schedule.net/sitemap.xml.
4. Inspect key URLs.
5. Request indexing for core pages after verification.
```

Core URLs to inspect:

```text
/
/world-cup-2026-schedule/
/world-cup-2026-schedule-pdf/
/world-cup-2026-schedule-excel/
/world-cup-2026-schedule-host-cities/
/world-cup-2026-schedule-groups/
/world-cup-2026-schedule-standings/
```

## AdSense Readiness

Do not submit to AdSense until:

```text
[ ] Contact mailbox is active.
[ ] About page owner/operator language is final.
[ ] Privacy Policy matches actual production tools.
[ ] Disclaimer is reviewed.
[ ] Production HTTPS is working.
[ ] Production ads.txt is either safe comment-only or contains the exact official line from AdSense.
[ ] AdSense verification method is configured exactly as requested in the AdSense interface.
```

AdSense verification checks after production deploy:

```text
[ ] View page source on the homepage.
[ ] Confirm google-adsense-account meta tag exists only if using meta verification.
[ ] Confirm AdSense script exists only if code verification is enabled.
[ ] Confirm /ads.txt contains the correct line only if AdSense requires it.
[ ] Confirm no placeholder ca-pub or pub ID appears.
```

## Items Already Technically Ready

```text
[x] Build command exists.
[x] Static output directory exists.
[x] Production domain is configured in source canonical generation.
[x] sitemap.xml generation exists.
[x] robots.txt generation exists.
[x] ads.txt safety gate exists.
[x] AdSense verification gate exists.
[x] Static 404 page exists.
[x] Trust page routes exist.
[x] Footer trust links exist.
```

## Items Waiting on Owner or Production Platform

```text
[ ] Hosting provider selection.
[ ] DNS configuration.
[ ] HTTPS certificate.
[ ] Contact mailbox activation.
[ ] Owner/operator public wording.
[ ] Actual privacy tool choices.
[ ] AdSense publisher ID.
[ ] AdSense verification method.
[ ] Official ads.txt line.
[ ] Production unknown-route 404 behavior test.
[ ] Search Console property verification.
```

## Recommended Next Phase

```text
Phase Launch Readiness D: Production Hosting Setup Plan
```

Suggested scope:

```text
Choose hosting platform.
Document exact DNS records.
Document deployment settings.
Prepare environment variable values without committing secrets.
Create post-deploy verification worksheet.
```

