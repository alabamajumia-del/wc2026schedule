# Download Files Upgrade: FIFA Reference Style

Date: 2026-05-23

## 1. Reference File

Local reference reviewed:

```text
FWC26 Match Schedule_v17_10042026_EN.pdf
```

The official FIFA PDF uses a high-density visual matrix: host cities down the left side, dates across the top, and colored fixture blocks in the grid. It is useful for quick visual scanning, but it is not enough by itself for spreadsheet filtering or detailed planning.

## 2. Completed Download File Changes

### CSV

- Keeps an import-friendly one-row-per-match format.
- Expanded columns to include team codes and match detail URLs.
- Contains 104 match rows.
- Best use: Google Sheets, Airtable, databases and custom planning tools.

### Excel

- Rebuilt as a styled SpreadsheetML workbook.
- Added visual header styles and alternating rows.
- Includes 8 sheets:
  - README
  - All Matches
  - Group Stage
  - Knockout
  - By Date
  - By Team
  - Venues
  - Groups
- Added source notes and official PDF reference note.
- Best use: filtering, sorting, offline planning and custom views.

### PDF

- Rebuilt from a plain text PDF into a styled printable planning PDF.
- Page 1 now uses a FIFA-reference-style city/date matrix:
  - 16 host cities down the left
  - dates across the top
  - colored match blocks by group or knockout stage
  - match number, ET kickoff and team codes inside each block
- Detail pages list all 104 matches with date, ET time, teams, stage, venue and venue-local time.
- Current generated PDF has 6 pages.
- Added a separate `Overview poster PDF` as a clean one-page wc26schedule asset for sharing or embedding.
- The site does not reuse the watermarked source image and does not remove third-party watermarks or logos.

## 3. Download Module UI Changes

- Download cards now show format badges: CSV, XLS and PDF.
- Each card explains best use and included content.
- Card styling was upgraded so the module better communicates file value before download.

## 4. Validation

```text
Build: passed
Syntax check: passed
CSV rows: 104 data rows
Excel sheets: README, All Matches, Group Stage, Knockout, By Date, By Team, Venues, Groups
Printable PDF pages: 6
Overview poster PDF pages: 1
PDF first page renders as a matrix preview
Download module screenshot: no horizontal overflow
```

Preview artifacts:

```text
page-seo-plans/download-pdf-matrix-preview.png
page-seo-plans/download-pdf-detail-preview.png
page-seo-plans/download-overview-poster-pdf-preview.png
page-seo-plans/download-module-updated-preview.png
```

The official FIFA PDF itself is kept as a local reference file and is intentionally ignored by Git.
The `PDF/` reference-material folder is also ignored so watermarked working assets are not published.
