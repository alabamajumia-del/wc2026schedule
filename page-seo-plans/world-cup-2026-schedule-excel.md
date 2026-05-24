# /world-cup-2026-schedule-excel/ SEO and UX Optimization Review

Date: 2026-05-23
Status: Completed for this pass
Preview URL: http://localhost:3000/world-cup-2026-schedule-excel/

## Page Goal

The page should help users download and choose the right spreadsheet file for World Cup 2026 schedule planning. It should not read like a generic article. The strongest user tasks are filtering by team, comparing host cities, sorting by date or stage, importing schedule data into another tool and deciding when Excel, CSV, PDF or the live schedule is the better format.

## Keyword Plan

Primary keyword:
- world cup 2026 schedule excel

Long-tail keyword pool used on page:
- fifa world cup 2026 schedule spreadsheet
- world cup 2026 excel download
- world cup fixtures spreadsheet
- world cup schedule csv
- world cup 2026 spreadsheet planner
- world cup 2026 fixtures excel
- world cup 2026 schedule csv download

Keyword placement:
- H1: World Cup 2026 Schedule Excel
- Title tag: World Cup 2026 Schedule Excel Download | wc26schedule
- Meta description: includes World Cup 2026 schedule Excel planner and CSV data
- H2 sections: planner, download files, workbook contents, filters, CSV comparison, spreadsheet workflow, format choice and official sources
- Intro and module copy: keyword family appears inside real use cases instead of repeated keyword blocks

## Content Quality Notes

The old page relied too much on explanatory text. This pass turns the page into a spreadsheet download tool page with:
- Hero download actions for the Excel workbook and CSV data.
- A planner module that explains the user's first task before download.
- Task cards for team filter, city comparison, date sorting and data import.
- Workbook structure cards for the eight planning sheets.
- Filter cards for team, city, date and stage use cases.
- Excel vs CSV, Excel vs PDF vs Live Schedule and source freshness modules.
- FAQ answers tied to real spreadsheet use, not generic SEO filler.

Visible content length is about 1,447 words, which keeps the page above the 800-word requirement while replacing long paragraph blocks with task-led cards.

## SEO Self-Check

Measured from the generated HTML:
- Word count: 1,447
- Primary exact keyword count: 5
- Primary exact density: 0.35%
- Non-overlapping keyword family hits: 53
- Keyword family density: 3.66%
- H1 count: 1
- H2 count: 11
- H3 count: 8
- Long-tail phrases now appear naturally at least once, except broader variants that are covered through headings and related phrase context.

Schema:
- WebPage schema inherited from the page generator.
- FAQPage schema from the page FAQ.
- HowTo schema added for using the Excel planner.

Source trust:
- The page links to the official FIFA schedule source for final verification before ticket, travel or publication decisions.

## UX Validation

Desktop validation:
- Excel task cards: 4
- Workbook sheet cards: 8
- Filter cards: 4
- Format cards: 3
- Source cards: 3
- Download cards: 6
- Horizontal overflow: 0

Mobile validation:
- Horizontal overflow: 0
- H1 remains readable.
- Primary button remains visible above the fold.
- Hero panel stacks below the intro instead of squeezing the content.

Screenshots saved:
- page-seo-plans/excel-page-planner-hero-preview.png
- page-seo-plans/excel-page-planner-module-preview.png
- page-seo-plans/excel-page-support-modules-preview.png
- page-seo-plans/excel-page-mobile-preview.png

## Follow-Up Ideas

The next optimization could split the download library into a stronger Excel-first file chooser with file size, updated date and "best for" badges. That would make the download area feel more like a product selector and less like a shared site-wide file list.

## Hero Theme Differentiation Pass

Date: 2026-05-23
Status: Completed

User feedback:

```text
The Schedule and Excel pages looked too similar at the top. The Excel page needs a theme-specific hero, not the same visual format with different text.
```

Excel-page adjustment:

- Replaced the generic right-side fact panel with a workbook preview panel.
- Added sheet tabs, spreadsheet-style columns and sample match rows inside the hero.
- Added Excel and CSV file cards directly inside the preview panel so the module communicates download value immediately.
- Added a subtle spreadsheet grid overlay to the hero background while keeping a World Cup stadium context.
- Kept the primary CTA focused on the Excel workbook and the secondary CTA focused on CSV data.

Validation:

```text
Desktop overflow: 0
Mobile overflow: 0
Workbook preview rows: 4
Planner tabs on Excel page: 0
```

Screenshots saved:

```text
page-seo-plans/excel-theme-hero-desktop-preview.png
page-seo-plans/excel-theme-hero-mobile-preview.png
```

## Excel Download File Selector Pass

Date: 2026-05-23
Status: Completed

User task:

```text
Optimize the /world-cup-2026-schedule-excel/ download file selection module.
```

Problem found:

- The page had a strong Excel-themed hero, but the lower download area still reused the site-wide file list.
- Excel, CSV and PDF files were too close in hierarchy, which made the page less useful for users who came specifically for spreadsheet downloads.
- Anchor jumps to the download module needed better spacing so the sticky header did not cover the module title.

Optimization completed:

- Replaced the generic download panel with an Excel-specific file chooser.
- Made XLS and CSV the primary choices, each with a clear task, best-use case, compatibility note, included fields and direct download button.
- Added supporting cards for PDF, live schedule and official-source verification without making them compete with the spreadsheet downloads.
- Added responsive styles so the file cards stack cleanly on mobile.
- Added `scroll-margin-top` for the download module, with a larger mobile value because the mobile navigation is taller.

SEO and keyword notes:

- The section keeps the primary intent around `world cup 2026 schedule excel`.
- It naturally reinforces long-tail intent for `world cup 2026 schedule csv download`, `world cup schedule csv`, `world cup 2026 excel download` and spreadsheet import searches.
- The module copy is task-led and avoids keyword repetition.

Validation:

```text
Word count: 1,447
Primary exact keyword count: 5
Primary exact density: 0.35%
Keyword family density: 3.8%
Desktop overflow: 0
Mobile overflow: 0
File cards: 2
Utility cards: 3
Download buttons: 2
Desktop download anchor top: 96px
Mobile download anchor top: 184px
```

Screenshots saved:

```text
page-seo-plans/excel-download-file-selector-desktop-final.png
page-seo-plans/excel-download-file-selector-mobile-final.png
```

## Official Banner Asset Integration Pass

Date: 2026-05-24
Status: Completed

User task:

```text
Connect the processed Excel-themed banner image and adapt the page-level visual presentation.
```

Optimization completed:

- Connected `world-cup-2026-schedule-excel-data-hero.png` as the Excel page hero background.
- Kept the visual direction distinct from PDF and Schedule by emphasizing workbook structure, data preview and spreadsheet planning.
- Preserved the right-side spreadsheet preview panel because it directly explains why users would choose Excel or CSV.
- Added the final asset to the static build copy list so the page uses a local file rather than a remote or temporary background.
- Verified desktop and mobile renderings for readable copy, intact CTA buttons and no horizontal overflow.

SEO notes:

- The H1 keeps the exact page intent `World Cup 2026 Schedule Excel`.
- The first screen naturally supports long-tail searches around Excel workbook, CSV data, filtering fixtures and spreadsheet planning.
- The module avoids keyword stuffing by showing the file value through table preview, tabs and download options.

Validation:

```text
Build passed.
Desktop overflow: 0
Mobile overflow: 0
Hero background asset: /assets/banners/world-cup-2026-schedule-excel-data-hero.png
Primary CTA: Get Excel workbook
Secondary CTA: Get CSV data
```

Screenshots saved:

```text
page-seo-plans/banner-excel-hero-desktop.png
page-seo-plans/banner-excel-mobile-viewport.png
```

## H2 and H3 Core Keyword Pass

Date: 2026-05-24
Status: Completed

Goal:

```text
Apply the unified heading rule to /world-cup-2026-schedule-excel/ so every H2 and H3 contains the page core keyword in readable form.
```

Core keyword:

```text
world-cup-2026-schedule-excel
Readable phrase: World Cup 2026 Schedule Excel
```

Final H2:

```text
World Cup 2026 Schedule Excel Planner
World Cup 2026 Schedule Excel and CSV Downloads
What Is Inside the World Cup 2026 Schedule Excel Workbook?
World Cup 2026 Schedule Excel Spreadsheet Filters by Team, City, Date or Stage
World Cup 2026 Schedule Excel Workbook or CSV Data?
How to Use the World Cup 2026 Schedule Excel Fixtures Spreadsheet
World Cup 2026 Schedule Excel vs PDF vs Live Schedule
World Cup 2026 Schedule Excel Updates and Official Sources
How to Use the World Cup 2026 Schedule Excel Planner
World Cup 2026 Schedule Excel Planning Links
World Cup 2026 Schedule Excel FAQ
```

Final H3:

```text
World Cup 2026 Schedule Excel Filter First, Print Later
World Cup 2026 Schedule Excel Workbook
World Cup 2026 Schedule Excel Clean CSV Data
What is included in the World Cup 2026 Schedule Excel workbook?
Is World Cup 2026 Schedule Excel better than PDF for travel planning?
Can I use the World Cup 2026 Schedule Excel CSV file in Google Sheets?
Does the World Cup 2026 Schedule Excel workbook include all 104 matches?
When should I download a fresh World Cup 2026 Schedule Excel copy?
```

Validation:

```text
Build passed.
H2/H3 missing core keyword: 0.
Visible word count: 2200.
Exact readable core phrase count: 22.
Weighted density check: 5.00%.
Desktop overflow: 0.
Mobile overflow: 0.
```

## Phase Download Trust A

Date: 2026-05-24
Status: Completed

Optimization completed:

- Added a four-card trust strip above the Excel and CSV download choices.
- Added task-based recommendations: filter teams, import into Google Sheets and move to PDF after filtering.
- Added file metadata to XLS and CSV cards: updated date, file size, version, compatibility, included fields and source note.
- Replaced generic file actions with `Download Excel workbook` and `Download CSV data`.
- Added visible independent-planner, no-ticket-sales and official-source verification language for user trust and AdSense readiness.

Validation:

```text
Build passed.
H2/H3 missing core keyword: 0.
Visible word count: 2410.
Weighted density check: 4.56%.
Trust cards: 4.
Decision cards: 3.
Download cards: 2.
Desktop overflow: 0.
Mobile overflow: 0.
```
