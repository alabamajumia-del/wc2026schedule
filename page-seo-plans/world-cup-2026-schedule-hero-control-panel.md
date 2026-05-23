# /world-cup-2026-schedule/ Hero Control Panel Upgrade

Date: 2026-05-23

## 1. User Feedback

The schedule hero panel looked like a control panel, but it behaved like a static visual preview. It did not help users control the page.

## 2. Optimization Completed

The hero panel now works as a real control panel:

- `Team`, `Date`, `City` and `Stage` switch the control panel's internal mode instead of sending every click to the same schedule block.
- Team mode provides concrete team choices and applies the team filter plus Team View.
- Date mode provides fixture-day choices and applies the local date filter plus Date cards.
- City mode provides host-city choices and applies the city filter plus City View.
- Stage mode provides tournament-phase choices and applies the stage filter in the full table.
- Featured match rows link to real match detail pages.
- Reset restores the full 104-match table.
- Search focuses the schedule search box.
- Export opens the Excel planner page.

## 3. Files Changed

```text
scripts/generate-site.mjs
src/styles.css
```

## 4. Validation

```text
Hero panel tabs: 4
Hero option buttons: 16
Featured match detail links: 2
Team example: Mexico -> Team View, 3 matches
Date example: Opening match -> Date cards, 2 matches in selected timezone
City example: Dallas -> City View, 9 matches
Stage example: Final -> Table View, 1 match
Reset: returns to 104 matches
Frontend errors: 0
```

Preview artifact:

```text
page-seo-plans/schedule-hero-control-panel-module-preview.png
```

## 5. Next Recommendation

The control panel now has real page-control value. A later visual pass can add icons or compact select menus, but the priority issue has been resolved: users now make a choice inside the panel and that choice applies a real schedule view or filter.
