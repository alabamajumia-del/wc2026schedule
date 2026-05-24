# Trust Pages Pre-Launch Information Checklist

Date created: 2026-05-25
Status: Required before public launch and before Google AdSense application

## Purpose

The trust pages are structurally prepared, but final public content must be reviewed with the site owner's real information before launch. Codex must not invent ownership, contact, legal, privacy or advertising details.

Affected pages:

```text
/about/
/contact/
/privacy-policy/
/disclaimer/
```

Related records:

```text
page-seo-plans/adsense-trust-and-compliance-pages.md
page-seo-plans/adsense-verification-infrastructure.md
```

## Current Architecture Status

Completed:

```text
[x] Four trust pages exist.
[x] Footer links point to Privacy Policy, About, Contact and Disclaimer.
[x] Pages are included in static generation and sitemap generation.
[x] Pages describe the site as an independent planning guide.
[x] Pages avoid claiming official FIFA affiliation.
[x] Pages include no-ticket-sales and official-source verification reminders.
[x] AdSense verification infrastructure is gated behind real environment variables.
```

Not final yet:

```text
[ ] Site owner/operator information has not been provided.
[ ] Public contact mailbox has not been confirmed as active.
[ ] Privacy tools and third-party services have not been finalized.
[ ] AdSense publisher ID and ads.txt line have not been provided.
[ ] Final legal wording has not been owner-reviewed.
```

## Required User Information Before Launch

### 1. Site Owner / Operator

Required decision:

```text
[ ] Use only the brand name wc26schedule publicly.
[ ] Use a personal name.
[ ] Use a company or organization name.
```

Information needed:

```text
Public operator name:
Country/region of operation:
Optional business/entity name:
Optional mailing address or region-only public description:
Whether to disclose the owner name on /about/:
```

Where it affects:

```text
/about/
/privacy-policy/
/contact/
/disclaimer/
Footer trust language if added later
```

### 2. Contact Method

Information needed:

```text
Public contact email:
Is contact@worldcup2026schedule.net active? yes/no
Should the site use a contact form? yes/no
Expected response scope:
Any social profile or alternate contact channel:
```

Must verify before launch:

```text
[ ] Send and receive a test email.
[ ] Confirm mailbox can receive correction reports and policy questions.
[ ] Remove any "if this mailbox is not yet active" development wording once the mailbox is live.
```

Where it affects:

```text
/contact/
/privacy-policy/
Footer
AdSense review readiness
```

### 3. Privacy and Data Handling

Information needed:

```text
Hosting provider:
Analytics provider, if any:
Cookie/cookie-less analytics choice:
Security/CDN provider, if any:
Email provider for contact mailbox:
Whether logs are retained and for how long:
Whether any contact messages are stored outside email:
Whether newsletters, accounts or forms will exist at launch:
Whether users can request deletion of contact messages:
```

AdSense-specific:

```text
AdSense enabled at launch? yes/no
AdSense publisher ID:
AdSense verification method selected in Google AdSense:
ads.txt line from AdSense:
Cookie consent requirement by target audience/region:
```

Where it affects:

```text
/privacy-policy/
/contact/
/ads.txt
Site head verification tags
Deployment environment variables
```

### 4. Disclaimer and Trademark Positioning

Confirm final wording:

```text
[ ] wc26schedule is independent and unofficial.
[ ] The site is not affiliated with FIFA.
[ ] The site does not sell tickets.
[ ] Downloads are planning aids, not official documents.
[ ] Users must verify schedule, ticket, stadium, travel and broadcast details with official sources.
[ ] Tournament, FIFA, team, city and stadium names are used only for descriptive informational purposes.
```

Where it affects:

```text
/disclaimer/
/about/
Download modules
Ticket-related pages
Footer trust language if added later
```

## Page-by-Page Pre-Launch Review

### /about/

Needs owner input:

```text
[ ] Public operator identity.
[ ] Whether the page should say "we", "I", "the wc26schedule team" or only "wc26schedule".
[ ] Any real editorial process or source review process the owner wants to disclose.
```

Do not invent:

```text
Company history, staff names, editorial credentials, location, business registration or partnerships.
```

### /contact/

Needs owner input:

```text
[ ] Final public email address.
[ ] Whether the email is active.
[ ] Whether a form will be added.
[ ] Whether response-time wording should be included or omitted.
```

Do not invent:

```text
Response time, support team size, official support capability or ticket-support capability.
```

### /privacy-policy/

Needs owner input:

```text
[ ] Analytics provider.
[ ] Advertising provider timing.
[ ] Cookie handling.
[ ] Hosting/security providers.
[ ] Contact-message retention.
[ ] User data request email/process.
```

Do not invent:

```text
Specific retention periods, legal basis, business address, DPO contact, cookie vendors or compliance certifications.
```

### /disclaimer/

Needs owner input:

```text
[ ] Final unofficial-status language approved by owner.
[ ] Final wording for ticket, travel and broadcaster disclaimers.
[ ] Whether to include region-specific legal limitations.
```

Do not invent:

```text
Legal jurisdiction, liability limits, attorney-reviewed claims or official relationship statements.
```

## Launch Blockers

The site should not be submitted to AdSense until these are complete:

```text
[ ] Contact email is active and tested.
[ ] About page owner/operator wording is approved.
[ ] Privacy Policy reflects actual analytics, hosting, advertising and contact-message handling.
[ ] Disclaimer is reviewed for unofficial status and no-ticket-sales language.
[ ] Real AdSense publisher ID is configured only in production environment variables.
[ ] ads.txt contains the real AdSense line only after AdSense provides it.
[ ] No fake owner name, fake address, fake email or fake publisher ID appears in production.
```

## Final Pre-Launch Validation Commands

Run after the owner provides the missing information:

```text
npm run build
```

Browser checks:

```text
Open /about/
Open /contact/
Open /privacy-policy/
Open /disclaimer/
Open /ads.txt
Confirm footer links work on desktop and mobile.
Confirm no placeholder or "not yet active" wording remains unless intentionally kept.
```

AdSense checks:

```text
Confirm AdSense verification tag or code snippet matches the method selected in Google AdSense.
Confirm /ads.txt uses the exact publisher line from Google AdSense.
Confirm no ad unit is placed above core content before UX review.
Confirm Privacy Policy mentions advertising only in terms that match the actual launch setup.
```

