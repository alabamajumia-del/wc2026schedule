# /world-cup-2026-schedule/ Hero Control Panel Upgrade

Date: 2026-05-23

## 1. User Feedback

The schedule hero panel looked like a control panel, but it behaved like a static visual preview. It did not help users control the page.

## 2. Initial Optimization

The first control-panel pass made the panel clickable, but it still had a weakness: too many actions were preset shortcuts, and the panel did not let users make full choices from the actual schedule data.

## 3. Redesign Completed

The panel has now been redesigned as a real Quick Planner:

- Users choose a planner mode: Team, City, Date or Stage.
- The select field is populated from real schedule data, not hardcoded examples.
- Team mode exposes 48 confirmed team options.
- City mode exposes all host-city options.
- Date mode exposes local match dates based on the selected timezone.
- Stage mode exposes tournament phases.
- The panel previews the number of matching matches.
- The panel previews the first matching fixture.
- `Apply to schedule` applies the selected filter and opens the right view.
- `Open first match` links to the first matching match detail page.
- Reset, manual search and Excel export remain available as secondary actions.

## 4. Files Changed

```text
scripts/generate-site.mjs
src/styles.css
```

## 5. Validation

```text
Planner modes: 4
Team options: 48
Date options in Asia/Shanghai test: 33
Team example: Mexico -> Team View, 3 matches
City example: Dallas -> City View, 9 matches
Date example: selected local date -> Date cards, 1 match
Stage example: Final -> Table View, 1 match
First match link for Final: /world-cup-2026-match/104-w101-vs-w102/
Reset: returns to 104 matches
Mobile city example: Dallas -> 9 matches
Mobile horizontal overflow: false
Frontend errors: 0
```

Preview artifact:

```text
page-seo-plans/schedule-hero-control-panel-module-preview.png
page-seo-plans/schedule-hero-control-panel-mobile-preview.png
```

## 6. Next Recommendation

The control panel now has real page-control value. A later visual pass can add icons, but the module should keep this planner logic: choose a planning mode, choose a real value, preview the result, then apply it.

## 7. Follow-up Fix: Accurate Result Navigation

User feedback on 2026-05-23 showed that selecting `Team -> Belgium` and clicking `Apply to schedule` still felt inaccurate because the page landed near the full schedule area instead of the exact Belgium result.

The planner behavior has been tightened:

- The result panel now states the destination before click, such as `Will open Team View and highlight Belgium`.
- The primary button changes from a generic label to a selected-result label, such as `Show Belgium results`.
- Team mode scrolls directly to the selected team aggregate card.
- City mode scrolls directly to the selected host-city aggregate card.
- Date mode scrolls directly to the selected date group.
- Stage mode scrolls to the first visible matching table row.
- The destination card or row receives a temporary highlight so users can see where the action landed.
- Target results now scroll into a more visible position instead of sitting under the sticky navigation.

Validation:

```text
Team example: Belgium -> Team View, Belgium card visible, 3 matches, highlighted
City example: Dallas -> City View, Dallas card visible, 9 matches
Date example: selected local date -> Date Cards, matching date group visible
Stage example: Final -> Table View, 1 visible row, Final row visible
Build: passed
Syntax check: passed
Local page status: 200
```

Preview artifact:

```text
page-seo-plans/schedule-planner-belgium-target-preview.png
```
