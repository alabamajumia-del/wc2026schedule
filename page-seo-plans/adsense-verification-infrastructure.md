# AdSense Verification Infrastructure

Date: 2026-05-24
Status: Completed

Task:

```text
Phase AdSense 1.2: AdSense Verification Infrastructure
```

## Purpose

Prepare the site for AdSense ownership verification and future ads.txt setup without loading fake publisher IDs, fake ad scripts or live ads during development.

## Implementation

Environment variables:

```text
ADSENSE_PUBLISHER_ID=
ADSENSE_VERIFICATION_METHOD=off
ADSENSE_ENABLE_SCRIPT=false
ADSENSE_ENABLE_ADS_TXT=false
```

Supported verification modes:

```text
off  - no AdSense verification tag is injected
meta - injects <meta name="google-adsense-account" content="ca-pub-...">
code - injects the AdSense code snippet only when ADSENSE_ENABLE_SCRIPT=true
both - injects meta and code snippet, with the script still gated by ADSENSE_ENABLE_SCRIPT=true
```

Files changed:

```text
scripts/generate-site.mjs
.env.example
05-落地执行清单.md
task-progress/wc2026schedule-task-progress.xlsx
```

## Safety Rules

- Default builds do not include any AdSense meta tag.
- Default builds do not load the AdSense script.
- Default builds generate `/ads.txt` with comments only, not a fake publisher line.
- A real `ca-pub-...` ID is required before any verification output appears.
- `ADSENSE_ENABLE_SCRIPT=true` is required before the code snippet can load.
- `ADSENSE_ENABLE_ADS_TXT=true` is required before the production ads.txt line is generated.

## Validation

Default build:

```text
Build passed.
/ads.txt status: 200
AdSense meta tag present: false
AdSense script present: false
Fake ca-pub ID present: false
ads.txt contains fake publisher line: false
```

Simulated production build:

```text
ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456
ADSENSE_VERIFICATION_METHOD=meta
ADSENSE_ENABLE_ADS_TXT=true

Meta tag generated: true
ads.txt generated: google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

Simulated code snippet build:

```text
ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456
ADSENSE_VERIFICATION_METHOD=both
ADSENSE_ENABLE_SCRIPT=true
ADSENSE_ENABLE_ADS_TXT=true

Meta tag generated: true
AdSense script generated: true
ads.txt generated: true
```

Final local build was rerun with all AdSense settings cleared so no test publisher ID remains in `dist`.

## Remaining Before Application

```text
[ ] Get the real AdSense publisher ID from the AdSense account.
[ ] Choose the verification method shown in the AdSense interface.
[ ] Configure production environment variables only on the deployment platform.
[ ] Rebuild and confirm source HTML before submitting.
[ ] Replace comment-only ads.txt with the real generated line by enabling ADSENSE_ENABLE_ADS_TXT=true.
```

## Dependency on Trust Page Information

Date added: 2026-05-25

Before the AdSense application:

```text
[ ] Complete launch-checklists/trust-pages-prelaunch-info-checklist.md.
[ ] Confirm /about/ does not contain invented owner/operator information.
[ ] Confirm /contact/ uses a real active mailbox.
[ ] Confirm /privacy-policy/ reflects the actual production analytics, ads, cookies, hosting and contact-message setup.
[ ] Confirm /disclaimer/ has owner-approved unofficial-status, no-ticket-sales and official-source language.
```

Important:

```text
AdSense verification infrastructure is technically ready, but AdSense submission should wait until the trust pages contain owner-provided final details.
```
