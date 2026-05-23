# /world-cup-2026-schedule/ Dynamic Upcoming Matches Optimization

Date: 2026-05-23

## 1. User Feedback

The `Upcoming matches` area looked useful, but it behaved like a static display. It only showed the first few matches and did not give users a way to keep browsing from that module.

## 2. Optimization Goal

Turn the module into a dynamic schedule surface that supports real browsing behavior:

- Show the current result range, not just fixed cards.
- Let users move through upcoming fixtures with previous and next controls.
- Respect active filters, so team, city, date, stage and search choices change the upcoming cards.
- Keep `View all` meaningful by opening the full matching schedule view.
- Preserve the next-match countdown while making the lower card rail interactive.

## 3. Completed Changes

- Added range text such as `Showing 1-4 of 104`.
- Added `Prev` and `Next` controls for paging through upcoming fixtures.
- Added a dynamic scope label, such as `Filtered upcoming matches for Belgium`.
- Added `View all` as an action button that opens the relevant schedule view.
- Rebuilt the card rail from the active match pool instead of hardcoding the first four matches.
- When filters change, the upcoming card rail resets to the first matching page.
- When no upcoming match matches the filters, the module shows an empty state instead of stale cards.
- Added countdown text to each upcoming card so the rail has live planning value.

## 4. Validation

```text
Default state: Showing 1-4 of 104, 4 cards, Next enabled, Prev disabled
After Next: Showing 5-8 of 104, first card changes to match #5, Prev enabled
Filtered example: Belgium -> Showing 1-3 of 3, 3 cards, all cards include Belgium
View all after Belgium filter: opens Team View with Belgium active context
Mobile check: no horizontal overflow, controls remain visible
Build: passed
Syntax check: passed
```

Preview artifact:

```text
page-seo-plans/schedule-dynamic-upcoming-preview.png
```
