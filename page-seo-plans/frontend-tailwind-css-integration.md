# Frontend Tailwind CSS Integration

Date: 2026-05-23

Scope:

```text
Introduce Tailwind CSS into the existing wc26schedule static frontend without changing the site's current static rendering architecture.
```

## 1. Implementation Decision

Tailwind CSS was introduced as a build-time utility layer, not as a full frontend rewrite.

Selected version:

```text
tailwindcss 3.4.19
```

Reason:

- Tailwind v3 provides a stable CLI workflow for this static Node-generated site.
- The current project does not use React, so shadcn/ui was not added in this step.
- Preflight is disabled to avoid unexpectedly resetting existing page styling.
- Tailwind utilities can now be used gradually for visual refinements, layout polish and interaction states.

## 2. Files Changed

```text
package.json
package-lock.json
tailwind.config.cjs
src/styles.css
scripts/generate-site.mjs
scripts/serve-site.mjs
```

## 3. Build Pipeline

Updated commands:

```text
npm run build
npm run build:css
npm run dev
npm start
```

Current flow:

```text
1. Generate static HTML, data files and downloads.
2. Compile src/styles.css through Tailwind.
3. Output the final minified stylesheet to dist/styles.css.
```

The preview server no longer regenerates raw CSS on import. This prevents the compiled Tailwind output from being overwritten by the source stylesheet.

## 4. Tailwind Configuration

Tailwind scans:

```text
./scripts/**/*.mjs
./src/**/*.mjs
./src/**/*.css
```

Theme tokens map to existing wc26schedule CSS variables:

```text
pitch -> --green
pitch-dark -> --green-dark
field -> --surface
field-strong -> --surface-strong
line -> --line
ink -> --text
muted -> --muted
gold -> --accent
```

Preflight:

```text
disabled
```

## 5. Current Utility Usage

Tailwind utilities were added only where they improve the current schedule page without creating a visual redesign:

```text
scroll-mt-24
transition
duration-200
hover:shadow-lg
hover:border-pitch
```

Applied areas:

- Schedule capability cards.
- Venue planning shortcuts.
- Team View and City View explanation tools.
- Download decision cards.
- Navigation route cards.

## 6. Theme Fix

The existing stylesheet used `--green` and `--green-dark` in several schedule components, but these aliases were not defined originally.

They are now defined directly:

```text
--green: #157a5b
--green-dark: #0c5b43
```

This keeps Tailwind hover borders and the existing schedule UI aligned with the same brand color system.

## 7. Validation

Build:

```text
Passed
Generated 77 pages
Tailwind CSS compiled successfully
```

Syntax checks:

```text
scripts/generate-site.mjs passed
scripts/serve-site.mjs passed
```

Interaction regression:

```text
CSS link loaded: yes
Capability cards: 3
Navigation route cards: 6
Tailwind hover utility instances: 20
Team View filter for Brazil: 1 team card, 3 visible matches
City View filter for Dallas: 1 city card, 9 visible matches
Frontend errors: 0
```

Note:

```text
Build prints an outdated Browserslist data warning. This is not blocking page generation or local preview, but it can be refreshed later with the standard Browserslist update command.
```

## 8. Next Frontend Optimization Direction

Tailwind should be used gradually and page by page.

Recommended next uses:

- Convert repeated schedule control spacing into shared utility patterns.
- Improve mobile layout states for filters, match cards and aggregate cards.
- Add clearer focus-visible states for keyboard users.
- Build small component-level visual variants for Team chips, City cards and download CTAs.
- Keep SEO content custom for each page; Tailwind should improve presentation, not produce template-like page blocks.
