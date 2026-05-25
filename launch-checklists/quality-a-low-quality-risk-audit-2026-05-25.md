# Phase Quality A: Low-Quality Risk Audit

Date: 2026-05-25
Status: Completed audit; optimization actions pending

## 2026-05-25 Remediation Update

The standalone thin homepage risk has been resolved by retiring the root homepage as an indexable page.

Current decision:

```text
/ redirects to /world-cup-2026-schedule/
/world-cup-2026-schedule/ is the actual homepage and primary SEO entry page.
The old root homepage content is no longer retained.
```

Follow-up implication:

```text
Remove "Homepage Quality Expansion" as the next recommended task.
Prioritize Team Page Content System Redesign and support-page optimization instead.
```

## 2026-05-25 Team Page Remediation Update

The 48 thin Team pages have been reconstructed.

Before:

```text
48 Team pages
323-347 words each
High-risk thin programmatic page group
```

After:

```text
48 Team pages
1087-1154 visible words each
0 Team pages below 800 words
Core keyword weighted density range: 3.49%-4.22%
Each page uses team-specific Group, opponent, city, stadium and match-detail data.
```

Updated thin-content risk count after this remediation:

```text
High risk pages: 9
Medium risk pages: 4
Team-page high risk count: 0
Remaining high-risk groups: trust pages and support pages
```

Remaining follow-up:

```text
Manually enrich the highest-search Team pages first: Mexico, United States, Canada, Argentina, Brazil, England, France, Germany, Spain and Portugal.
```

## 2026-05-25 Dates Page Remediation Update

The `/world-cup-2026-dates/` support page has been rebuilt.

Before:

```text
Visible words: 672
Risk: high
Main issues: below 800 words, no page-level visual asset
```

After:

```text
Visible words: 1401
Risk: removed from thin-content group
Primary keyword: World Cup 2026 Dates
Weighted keyword density: 4.85%
Images detected: 1
Structured data blocks: 4
Timeline and source modules added
```

## 2026-05-25 TV Schedule Page Remediation Update

The `/world-cup-2026-tv-schedule/` support page has been rebuilt.

Before:

```text
Visible words: 563
Risk: high
Main issues: below 800 words, generic TV guidance, no TV-specific visual module
```

After:

```text
Visible words: 1796
Risk: removed from thin-content group
Primary keyword: World Cup 2026 TV Schedule
Weighted keyword density: 4.45%
Images detected: 13
Structured data blocks: 4
Viewing planner, broadcaster verification and match-window modules added
```

Important editorial rule:

```text
Do not publish guessed final channel grids. Add match-by-match TV listings only when they can be verified through authorized broadcaster or tournament sources.
```

Remaining high-risk support pages:

```text
/where-to-watch-world-cup-2026/
/world-cup-2026-bracket/
/world-cup-2026-final/
/world-cup-2026-tickets/
```

## Purpose

Before publishing wc26schedule on Cloudflare, this audit checks whether the generated static site has pages that could look thin, repetitive, under-trusted or under-developed to users, Google Search, AI Overviews and AdSense review.

The audit focuses on indexable page quality, not deployment settings.

## Audit Scope

Build checked:

```text
npm run build
Generated pages checked from: dist/
Total HTML files checked: 189
Indexable pages checked: 185
Noindex / excluded pages: 4
```

Checks applied:

```text
Visible content length
H1 presence and uniqueness
Canonical tag presence
Meta description presence
Internal link count
Footer trust links
Structured data presence
Image / visual asset presence
Expected noindex redirects
Page type risk grouping
```

## Executive Summary

The core commercial and SEO hub pages are mostly strong enough to keep optimizing toward launch:

```text
/world-cup-2026-schedule/
/world-cup-2026-schedule-pdf/
/world-cup-2026-schedule-groups/
/world-cup-2026-schedule-host-cities/
/world-cup-2026-schedule-standings/
```

The biggest low-quality risks are:

```text
48 team pages are indexable but only 323-347 words each.
The homepage is indexable but only 250 words.
Six support pages are indexable but below 800 words and currently lack page-level visuals.
Three trust pages are below 800 words; Privacy Policy is just above the threshold at 822 words.
Three Mexico city detail pages are close to the thin-content threshold.
The Excel page has strong copy volume but the audit did not detect a page-level image in the generated HTML.
```

This means the next optimization work should prioritize page depth, task usefulness and visible trust over adding more decorative modules.

## Site-Wide Risk Counts

```text
High risk: 58 pages
Medium risk: 5 pages
Low risk: 122 pages
Excluded / noindex: 4 pages
```

Risk by page type:

```text
Home: 1 high risk
Team pages: 48 high risk
Support pages: 6 high risk
Trust pages: 3 high risk, 1 medium risk
City detail pages: 3 medium risk
Core hub pages: 5 low risk, 1 medium risk
Match detail pages: 104 low risk
Noindex redirects: 3 excluded
Static 404: 1 excluded
```

## High-Risk Pages

### Homepage

```text
Route: /
Words detected: 250
Main issue: indexable page below 800 words
```

Risk:

The homepage currently functions more like a brand doorway than a complete homepage. For launch and AdSense review, it needs stronger original content, clearer site purpose, links to the main schedule tools and a trust signal explaining data sources and update behavior.

Recommended action:

Build a real homepage experience around the brand, the 104-match schedule, primary tools, download choices, host city/team paths, source notes and update policy.

### Team Pages

```text
Routes: /world-cup-2026-teams/*-schedule/
Page count: 48
Words detected: 323-347 each
Main issue: every team page is indexable but below 800 words
```

Risk:

The team pages are the largest quality risk because they are programmatic, numerous and thin. Even if each page has useful match data, the current text volume and likely repeated structure can look like scaled low-value pages.

Recommended action:

Do not bulk-fill all 48 pages with generic paragraphs. Create one improved team-page content model first, then apply team-specific sections with real match context:

```text
Team fixture summary
Group opponents
First match and travel rhythm
Host city / stadium path
Kickoff-time planning
Same-group links
Match detail links
Download and live schedule links
Source and update note
FAQ specific to the team route
```

Priority teams for first pass:

```text
Mexico
United States
Canada
Argentina
Brazil
England
France
Germany
Spain
Portugal
```

### Support Pages

High-risk support pages:

```text
/where-to-watch-world-cup-2026/ - 387 words
/world-cup-2026-bracket/ - 401 words
/world-cup-2026-final/ - 401 words
/world-cup-2026-tv-schedule/ - 563 words
/world-cup-2026-tickets/ - 598 words
/world-cup-2026-dates/ - 672 words
```

Main issues:

```text
Indexable page below 800 words
No page-level visual asset detected
```

Risk:

These pages target valuable search intent, but the current output is too short for competitive informational queries. They need real tools, comparison tables, source notes and intent-specific modules.

Recommended action:

Optimize these one by one instead of copying the same section pattern across all six.

Suggested order:

```text
1. /world-cup-2026-dates/
2. /world-cup-2026-tv-schedule/
3. /world-cup-2026-tickets/
4. /world-cup-2026-bracket/
5. /world-cup-2026-final/
6. /where-to-watch-world-cup-2026/
```

### Trust Pages

High / medium trust-page risks:

```text
/contact/ - 542 words - high
/disclaimer/ - 584 words - high
/about/ - 651 words - high
/privacy-policy/ - 822 words - medium
```

Risk:

These pages are important for AdSense and trust review, but several sections still depend on missing owner information. The current architecture exists, but the final launch version needs real operator details, contact path, editorial policy and data-source policy.

Recommended action:

Keep these pages in the launch readiness track. Before production, add the owner-provided details recorded in:

```text
launch-checklists/trust-pages-prelaunch-info-checklist.md
```

## Medium-Risk Pages

### City Detail Pages Near Thin-Content Threshold

```text
/world-cup-2026-schedule/monterrey/ - 965 words
/world-cup-2026-schedule/guadalajara/ - 970 words
/world-cup-2026-schedule/mexico-city/ - 996 words
```

Risk:

These pages are above 800 words but close to the threshold. They should be strengthened because Mexico host city searches will likely be important, and these pages can support schedule, venue and travel-planning intent.

Recommended action:

Add city-specific utility sections:

```text
Venue match pattern
Group-stage and knockout relevance
Travel planning notes
Local kickoff-time note
Nearby related host city links
Best download or live-view option for the city
```

### Excel Page Visual Asset Check

```text
Route: /world-cup-2026-schedule-excel/
Words detected: 2378
Main issue: no page-level image detected by static audit
```

Risk:

The Excel page content volume is strong, but a download-focused page should show the workbook choice and file purpose clearly. If the page uses background CSS images only, the static audit will not count them as image assets.

Recommended action:

Review the Excel download module visually and consider adding an explicit workbook preview image, screenshot-style card or table preview with descriptive alt text.

## Low-Risk Areas

### Core Hub Pages

Strong pages:

```text
/world-cup-2026-schedule/ - 4831 words
/world-cup-2026-schedule-pdf/ - 3228 words
/world-cup-2026-schedule-groups/ - 3568 words
/world-cup-2026-schedule-host-cities/ - 2857 words
/world-cup-2026-schedule-standings/ - 1976 words
```

These pages currently pass the audit checks for content depth, structure, trust links, canonical URLs and structured data.

Remaining risk:

They should still be reviewed visually page by page before launch, especially for:

```text
Mobile readability
Control-panel usefulness
Navigation clarity
Heading density
Real source/update notes
Download trust signals
```

### Match Detail Pages

```text
Page count: 104
Words detected: 1036-1361
Average words: 1250
Risk level: low in this audit
```

These pages pass the content depth threshold. The remaining risk is not word count; it is template similarity. Future review should sample at least 10 match detail pages across group stage, knockout, semifinal and final routes to make sure the content reads as match-specific rather than generated filler.

### Noindex Redirects and 404

Excluded pages:

```text
/404.html
/world-cup-2026-groups/
/world-cup-2026-host-cities/
/world-cup-2026-standings/
```

These are expected to be excluded from index quality evaluation.

## Low-Quality Risk Patterns

### Pattern 1: Thin Programmatic Team Pages

The 48 team pages are the clearest quality issue. They have structured data and internal links, but the main content is too short.

Do not solve this by adding the same 500-word block to every team page. The fix should be a stronger team page system with team-specific match context.

### Pattern 2: Support Pages Exist but Do Not Yet Compete

The six support pages cover useful topics but do not yet deliver enough practical value. Each should become a real page with tools, tables, answer blocks and source notes.

### Pattern 3: Trust Pages Need Owner Data Before Launch

The site has trust-page infrastructure, but launch-quality trust still depends on missing real information. This is important for AdSense.

### Pattern 4: Homepage Is Too Thin for a Production Entry Page

The homepage should not remain a light brand doorway. It should guide users into schedule, downloads, cities, teams, groups, standings and source/update trust.

## Recommended Optimization Order

1. Homepage quality expansion.
2. Team page content system redesign.
3. Support page optimization, starting with Dates, TV and Tickets.
4. Trust page completion once owner information is available.
5. Mexico city detail page strengthening.
6. Excel page visual/download preview review.
7. Match detail page template-similarity sampling.

## Next Phase Recommendation

Recommended next task:

```text
Phase Quality B: Homepage Quality Expansion
```

Goal:

Turn the homepage into a useful, indexable entry page with enough original content, visible site purpose, trust signals and clear navigation into the schedule tools.

Secondary option:

```text
Phase Team Pages A: Team Page Content System Redesign
```

Goal:

Fix the largest page-count risk by making every team page more useful, more specific and less thin.
