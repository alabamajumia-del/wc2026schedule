# World Cup 2026 Match Detail Pages

Date: 2026-05-23

Scope:

```text
Create real single-match detail pages for all 104 World Cup 2026 schedule rows and upgrade schedule-page entry points from "Jump to match" to "Match details".
```

## 1. Why This Phase Was Needed

The schedule page had a strong live-board experience, but the primary action still jumped back to a table row. That helped users locate the row, but it did not provide a deeper planning page or long-tail SEO target.

This phase turns each schedule row into a real page with its own:

- URL
- Title and meta description
- H1
- Match facts
- Team matchup block
- Time conversion section
- Venue and city context
- Team route context
- FAQ
- Article, SportsEvent, FAQPage and BreadcrumbList Schema
- Internal links to schedule, team, city, downloads and ticket pages

## 2. URL Pattern

```text
/world-cup-2026-match/{match-number}-{home-team}-vs-{away-team}/
```

Example:

```text
/world-cup-2026-match/1-mexico-vs-south-africa/
```

## 3. Entry Points Upgraded

The following schedule-page areas now point into match detail pages:

```text
Next match spotlight
Upcoming match cards
Full schedule table
Date cards
Team View match entries
City View match entries
```

The live board action now reads:

```text
Match details ->
```

## 4. Match Page Content Structure

Each match page uses a consistent planning structure, but the content is generated from match-specific data:

```text
H1: Match {number}: {home} vs {away}
Hero facts: stage, kickoff, venue
Match scoreboard: home team vs away team
Fact cards: match number, date, venue local time, host city
Match overview
Kickoff Time and Time Zone Details
Team Route Context
Venue and City Planning
How to Use This Match Detail Page
Related Match Planning Links
FAQ
Source note
```

The page avoids creating a thin placeholder by including planning context, time conversion, source-status notes, city routing and team-route context instead of only repeating the table row.

## 5. Schema

Each page includes:

```text
Article
SportsEvent
FAQPage
BreadcrumbList
```

SportsEvent includes:

```text
name
startDate
eventStatus
eventAttendanceMode
sport
location
competitor when teams are real confirmed teams
organizer
url
```

## 6. Validation

Build:

```text
Passed
Generated pages: 181
New match pages: 104
```

Batch page validation:

```text
Total matches: 104
Generated match paths: 104
Missing match pages: 0
Duplicate match paths: 0
Pages below 800 words: 0
Pages missing SportsEvent Schema: 0
```

Sample page validation:

```text
URL: /world-cup-2026-match/1-mexico-vs-south-africa/
H1: Match 1: Mexico vs South Africa
Title: Match 1: Mexico vs South Africa - World Cup 2026 Match Details | wc26schedule
SportsEvent Schema: present
Main content word count: 895
Related links: 11
Source note includes FIFA reference: yes
Frontend errors: 0
```

Entry-point validation:

```text
Next match href: /world-cup-2026-match/1-mexico-vs-south-africa/
Full schedule table detail links: 104
Date card detail links: 104
Team View match detail links: 144
City View match detail links: 104
```

## 7. Preview Artifact

```text
page-seo-plans/match-detail-page-preview.png
```

## 8. Next Recommendation

The next useful step is to improve match detail pages visually with a stronger top scoreboard:

```text
Home team card
Away team card
Kickoff countdown
Venue local time
Stage/group badge
City/stadium CTA
```

This should be done carefully so the page remains content-rich and not only a decorative match card.
