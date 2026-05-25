# Team Pages Rebuild Reference

Date: 2026-05-25
Status: Implemented first reconstruction pass

## Why the old Team pages were removed

The previous Team pages were too thin and too uniform:

```text
48 pages
323-347 words each
Same structure on every page
Limited team-specific route explanation
Weak standalone value beyond the table row data
```

This created the largest low-quality risk in the site audit.

## Reference Pages and Patterns Reviewed

The new structure uses a combined reference model rather than copying one competitor page.

### FIFA national-team fixture articles

Reference value:

```text
Team-first route framing
Opponent, stadium and match order context
Clear focus on one country's fixture path
```

Examples / reference sources:

```text
https://www.fifa.com/en/articles/usa-world-cup-2026-fixtures-stadiums-matches
https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
```

How this influenced wc26schedule:

```text
Each Team page now opens as a country route, not a generic table.
The first match, final group match, Group opponents, cities and stadiums are surfaced in the page copy.
Official-source reminders remain visible.
```

### ESPN-style fixtures pages

Reference value:

```text
Fast fixture scanning
Match date, opponent and competition context
Low-friction sports schedule layout
```

Reference:

```text
https://www.espn.com/soccer/fixtures
```

How this influenced wc26schedule:

```text
The new Team pages use fixture cards for the three group matches.
Each card links to the match detail page and the relevant host city page.
```

### Matchtimes-style planning flow

Reference value:

```text
Upcoming match cards
Time and match-detail focus
Low-friction route from schedule overview to match detail
```

Reference:

```text
https://matchtimes.app/schedule
```

How this influenced wc26schedule:

```text
Team pages now work as planning routes instead of static articles.
The page points users to match details, city guides, full schedule, group guide, standings, PDF and Excel downloads.
```

## New Team Page Structure

Each of the 48 Team pages now uses this structure:

```text
Hero: Team route snapshot
H1: {Team} World Cup 2026 Schedule
H2: {Team} World Cup 2026 Schedule Overview
H3: {Team} World Cup 2026 Schedule Group {Group} Opponents
H2: {Team} World Cup 2026 Schedule Fixtures by Date, Opponent and City
Fixture card 1: first group match
Fixture card 2: middle group match
Fixture card 3: final group match
H3: {Team} First Match
H3: {Team} Host Cities and Stadiums
H3: Group {Group} Planning for {Team}
H2: How to Use the {Team} World Cup 2026 Schedule
H2: {Team} World Cup 2026 Schedule Related Planning Links
H2: {Team} World Cup 2026 Schedule FAQ
Source note
```

## SEO Rule Applied

Core keyword:

```text
{Team} World Cup 2026 Schedule
```

Metadata:

```text
Title: {Team} World Cup 2026 Schedule: Fixtures, Dates, Opponents & Cities
Description: Follow the {Team} World Cup 2026 Schedule with fixtures, match dates, kickoff times, Group {Group} opponents, host cities, stadiums and match details.
H1: {Team} World Cup 2026 Schedule
```

Long-tail keyword coverage:

```text
{Team} World Cup 2026 fixtures
{Team} World Cup 2026 schedule dates
{Team} World Cup 2026 match schedule
{Team} World Cup 2026 group matches
{Team} World Cup 2026 opponents
{Team} World Cup 2026 kickoff times
{Team} World Cup 2026 host cities
{Team} World Cup 2026 stadiums
{Team} Group {Group} World Cup 2026 schedule
{Team} vs {Opponent} World Cup 2026 date
```

## Quality Validation

After rebuild:

```text
Team pages generated: 48
Minimum visible word count: 1087
Maximum visible word count: 1154
Pages below 800 words: 0
Core keyword weighted density range: 3.49%-4.22%
All Team pages have unique opponent, group, city and fixture data.
Each Team page links to match details, city pages, group page, standings, downloads and tickets.
```

Sample pages:

```text
/world-cup-2026-teams/mexico-schedule/
/world-cup-2026-teams/usa-schedule/
/world-cup-2026-teams/canada-schedule/
```

## Remaining Risk

The reconstruction is still generated from a shared system, but the content is now route-specific and no longer a thin repeated page.

Future refinement should prioritize high-search teams for manual editorial enrichment:

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

