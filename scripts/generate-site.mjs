import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pages, site } from "../src/content.mjs";
import { matches, scheduleMeta } from "../src/matches.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const updated = "May 22, 2026";

const adsensePublisherId = (process.env.ADSENSE_PUBLISHER_ID || "").trim();
const adsenseVerificationMethod = (process.env.ADSENSE_VERIFICATION_METHOD || "off").trim().toLowerCase();
const adsenseScriptEnabled = process.env.ADSENSE_ENABLE_SCRIPT === "true";
const adsenseAdsTxtEnabled = process.env.ADSENSE_ENABLE_ADS_TXT === "true";
const hasAdsensePublisherId = /^ca-pub-\d{10,}$/.test(adsensePublisherId);
const adsenseAdsTxtPublisherId = adsensePublisherId.replace(/^ca-/, "");

const citySlugOverrides = {
  "new-york": "new-york-new-jersey",
  "san-francisco": "san-francisco-bay-area"
};

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const attr = esc;

const adsenseHeadTags = () => {
  if (!hasAdsensePublisherId || adsenseVerificationMethod === "off") return "";

  const tags = [];
  if (["meta", "both"].includes(adsenseVerificationMethod)) {
    tags.push(`<meta name="google-adsense-account" content="${attr(adsensePublisherId)}">`);
  }
  if (["code", "both"].includes(adsenseVerificationMethod) && adsenseScriptEnabled) {
    tags.push(
      `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${attr(
        adsensePublisherId
      )}" crossorigin="anonymous"></script>`
    );
  }

  return tags.length ? `\n  ${tags.join("\n  ")}` : "";
};

const adsTxt = () => {
  if (hasAdsensePublisherId && adsenseAdsTxtEnabled) {
    return `google.com, ${adsenseAdsTxtPublisherId}, DIRECT, f08c47fec0942fa0\n`;
  }

  return [
    `# ads.txt for ${site.domain}`,
    "# AdSense publisher ID is not configured yet.",
    "# Add the official AdSense publisher ID at build time before submitting the site for review.",
    "# Expected production format: google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
    ""
  ].join("\n");
};

const cityPath = (citySlug) =>
  `/world-cup-2026-schedule/${citySlugOverrides[citySlug] ?? citySlug}/`;

const teamSlugOverrides = {
  "Bosnia & Herzegovina": "bosnia-herzegovina",
  "Cote d'Ivoire": "ivory-coast",
  "Ivory Coast": "ivory-coast",
  "Curaçao": "curacao",
  "DR Congo": "dr-congo",
  "IR Iran": "iran",
  "Korea Republic": "south-korea",
  "South Korea": "south-korea",
  Türkiye: "turkiye",
  Turkiye: "turkiye",
  USA: "usa",
  "United States": "usa",
  "Cabo Verde": "cape-verde",
  "Cape Verde": "cape-verde"
};

const teamCodeOverrides = {
  Algeria: "ALG",
  Argentina: "ARG",
  Australia: "AUS",
  Austria: "AUT",
  Belgium: "BEL",
  "Bosnia & Herzegovina": "BIH",
  Brazil: "BRA",
  "Cabo Verde": "CPV",
  Canada: "CAN",
  "Cape Verde": "CPV",
  Colombia: "COL",
  Croatia: "CRO",
  "Côte d'Ivoire": "CIV",
  "Cote d'Ivoire": "CIV",
  Czechia: "CZE",
  "Ivory Coast": "CIV",
  "Curaçao": "CUW",
  "DR Congo": "COD",
  Ecuador: "ECU",
  Egypt: "EGY",
  England: "ENG",
  France: "FRA",
  Germany: "GER",
  Ghana: "GHA",
  Haiti: "HAI",
  Iran: "IRN",
  Iraq: "IRQ",
  "IR Iran": "IRN",
  Japan: "JPN",
  Jordan: "JOR",
  "Korea Republic": "KOR",
  Mexico: "MEX",
  Morocco: "MAR",
  Netherlands: "NED",
  "New Zealand": "NZL",
  Norway: "NOR",
  Panama: "PAN",
  Paraguay: "PAR",
  Portugal: "POR",
  Qatar: "QAT",
  "Saudi Arabia": "KSA",
  Scotland: "SCO",
  Senegal: "SEN",
  "South Africa": "RSA",
  "South Korea": "KOR",
  Spain: "ESP",
  Sweden: "SWE",
  Switzerland: "SUI",
  Tunisia: "TUN",
  Türkiye: "TUR",
  Turkiye: "TUR",
  Uruguay: "URU",
  Uzbekistan: "UZB",
  USA: "USA",
  "United States": "USA"
};

const teamFlagEmojiOverrides = {
  Algeria: "🇩🇿",
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  "Bosnia & Herzegovina": "🇧🇦",
  Brazil: "🇧🇷",
  "Cabo Verde": "🇨🇻",
  Canada: "🇨🇦",
  "Cape Verde": "🇨🇻",
  Colombia: "🇨🇴",
  Croatia: "🇭🇷",
  "Côte d'Ivoire": "🇨🇮",
  "Cote d'Ivoire": "🇨🇮",
  Czechia: "🇨🇿",
  "Ivory Coast": "🇨🇮",
  "Curaçao": "🇨🇼",
  "DR Congo": "🇨🇩",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Haiti: "🇭🇹",
  Iran: "🇮🇷",
  Iraq: "🇮🇶",
  "IR Iran": "🇮🇷",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  "Korea Republic": "🇰🇷",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  "New Zealand": "🇳🇿",
  Norway: "🇳🇴",
  Panama: "🇵🇦",
  Paraguay: "🇵🇾",
  Portugal: "🇵🇹",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  Scotland: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  Senegal: "🇸🇳",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Tunisia: "🇹🇳",
  Türkiye: "🇹🇷",
  Turkiye: "🇹🇷",
  Uruguay: "🇺🇾",
  Uzbekistan: "🇺🇿",
  USA: "🇺🇸",
  "United States": "🇺🇸"
};

const slugify = (value) =>
  String(value)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const isRealTeam = (team) =>
  team &&
  !team.includes("/") &&
  !/^W\d+$/i.test(team) &&
  !/^L\d+$/i.test(team) &&
  !/^\d[A-Z]+$/i.test(team) &&
  !/^Winner/i.test(team) &&
  !/^Loser/i.test(team) &&
  team !== "TBD";

const teamSlug = (team) => teamSlugOverrides[team] ?? slugify(team);
const teamPath = (team) => `/world-cup-2026-teams/${teamSlug(team)}-schedule/`;
const teamCode = (team) =>
  teamCodeOverrides[team] ??
  slugify(team)
    .split("-")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
const compactTeamLabel = (team) => (isRealTeam(team) ? teamCode(team) : team);
const emojiCodepoints = (emoji) =>
  [...emoji]
    .map((char) => char.codePointAt(0).toString(16))
    .filter((codepoint) => codepoint !== "fe0f")
    .join("-");
const teamFlagCodeOverrides = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia & Herzegovina": "ba",
  Brazil: "br",
  "Cabo Verde": "cv",
  Canada: "ca",
  "Cape Verde": "cv",
  Colombia: "co",
  Croatia: "hr",
  "C么te d'Ivoire": "ci",
  "Cote d'Ivoire": "ci",
  Czechia: "cz",
  "Ivory Coast": "ci",
  "Cura莽ao": "cw",
  "DR Congo": "cd",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Haiti: "ht",
  Iran: "ir",
  Iraq: "iq",
  "IR Iran": "ir",
  Japan: "jp",
  Jordan: "jo",
  "Korea Republic": "kr",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Portugal: "pt",
  Qatar: "qa",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Senegal: "sn",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  T眉rkiye: "tr",
  Turkiye: "tr",
  Uruguay: "uy",
  Uzbekistan: "uz",
  USA: "us",
  "United States": "us"
};
const teamFlagUrl = (team) => {
  const code = teamFlagCodeOverrides[team];
  if (code) return `https://flagcdn.com/${code}.svg`;
  const emoji = teamFlagEmojiOverrides[team];
  return emoji ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${emojiCodepoints(emoji)}.svg` : "";
};
const matchDetailPath = (match) =>
  `/world-cup-2026-match/${match.matchNumber}-${slugify(match.home)}-vs-${slugify(match.away)}/`;

const kickoffUtcIso = (match) => {
  const [year, month, day] = match.date.split("-").map(Number);
  const [hour, minute] = match.kickoffET.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour + 4, minute)).toISOString();
};

const csvValue = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const dataDownloadFiles = [
  {
    label: "Full schedule CSV",
    href: "/downloads/world-cup-2026-schedule.csv",
    description: "Import-friendly raw data with match numbers, dates, ET/UTC/local venue times, team codes, cities, stadiums and detail-page URLs.",
    format: "CSV",
    bestFor: "Google Sheets, Airtable, databases",
    includes: "104 rows"
  },
  {
    label: "Excel workbook",
    href: "/downloads/world-cup-2026-schedule.xls",
    description: "Styled multi-sheet workbook with full schedule, group stage, knockout, by-date, by-team, venues, groups and source notes.",
    format: "XLS",
    bestFor: "Filtering, sorting and offline planning",
    includes: "8 sheets"
  }
];

const pdfDownloadFiles = [
  {
    label: "Printable PDF",
    href: "/downloads/world-cup-2026-schedule.pdf",
    description: "Printable PDF with an official-reference-style city/date matrix plus detailed match list pages for travel folders.",
    format: "PDF",
    bestFor: "Printing, sharing and quick visual scanning",
    includes: "Matrix + details"
  },
  {
    label: "Overview poster PDF",
    href: "/downloads/world-cup-2026-schedule-overview.pdf",
    description: "Single-page wc26schedule overview PDF with the host-city and match-date matrix for quick visual scanning.",
    format: "PDF",
    bestFor: "Embedding, sharing and quick previews",
    includes: "1-page matrix"
  },
  {
    label: "Stage overview PDF",
    href: "/downloads/world-cup-2026-stage-overview.pdf",
    description: "Two-page wc26schedule PDF split into group-stage and knockout-stage grids by host city and match date.",
    format: "PDF",
    bestFor: "Stage-by-stage visual planning",
    includes: "2-page overview"
  },
  {
    label: "Bracket PDF",
    href: "/downloads/printable-world-cup-2026-schedule-bracket.pdf",
    description:
      "Printable bracket-focused PDF with group-stage fixtures, knockout bracket, match dates, host cities, BST times, semifinals, third-place match and final schedule.",
    format: "PDF",
    bestFor: "Bracket, final dates and BST-time planning",
    includes: "2 pages"
  }
];

const downloadFiles = [...dataDownloadFiles, ...pdfDownloadFiles];
const officialFifaScheduleUrl =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums";

const visualDownloadFiles = [
  {
    label: "Full match schedule overview image",
    href: "/assets/2026-world-cup-full-match-schedule-overview.png",
    description:
      "Single-image overview covering group-stage fixtures, knockout rounds, third-place playoff and final with match numbers, dates, venues and bracket placeholders.",
    format: "PNG",
    bestFor: "Quick visual reference and sharing",
    includes: "Group stage + knockout overview"
  }
];

const cityImageFiles = [
  "atlanta",
  "boston",
  "dallas",
  "guadalajara",
  "houston",
  "kansas-city",
  "los-angeles",
  "mexico-city",
  "miami",
  "monterrey",
  "new-york-new-jersey",
  "philadelphia",
  "san-francisco-bay-area",
  "seattle",
  "toronto",
  "vancouver"
].map((slug) => [
  `src/assets/cities/world-cup-2026-schedule-host-cities-${slug}.jpg`,
  `assets/cities/world-cup-2026-schedule-host-cities-${slug}.jpg`
]);

const siteAssetFiles = [
  ["page-seo-plans/download-pdf-matrix-preview.png", "assets/download-pdf-matrix-preview.png"],
  ["page-seo-plans/download-overview-poster-pdf-preview.png", "assets/download-overview-poster-pdf-preview.png"],
  ["page-seo-plans/stage-overview-pdf-group-preview.png", "assets/stage-overview-pdf-group-preview.png"],
  ["page-seo-plans/stage-overview-pdf-knockout-preview.png", "assets/stage-overview-pdf-knockout-preview.png"],
  [
    "src/assets/2026-world-cup-full-match-schedule-overview.png",
    "assets/2026-world-cup-full-match-schedule-overview.png"
  ],
  [
    "src/assets/banners/world-cup-2026-schedule-stadium-hero.jpg",
    "assets/banners/world-cup-2026-schedule-stadium-hero.jpg"
  ],
  [
    "src/assets/banners/world-cup-2026-schedule-pdf-trophy-hero.png",
    "assets/banners/world-cup-2026-schedule-pdf-trophy-hero.png"
  ],
  [
    "src/assets/banners/world-cup-2026-schedule-excel-data-hero.png",
    "assets/banners/world-cup-2026-schedule-excel-data-hero.png"
  ],
  [
    "src/assets/banners/world-cup-2026-schedule-host-cities-map-hero.png",
    "assets/banners/world-cup-2026-schedule-host-cities-map-hero.png"
  ],
  [
    "src/assets/printable-world-cup-2026-schedule-bracket.pdf",
    "downloads/printable-world-cup-2026-schedule-bracket.pdf"
  ],
  ...cityImageFiles
];

const nav = () =>
  pages
    .slice(0, 8)
    .map((page) => `<a href="/${page.slug}/">${esc(page.nav)}</a>`)
    .join("");

const layout = ({ title, description, canonical, body, schema = [], titleSuffix = true }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titleSuffix ? `${title} | ${site.brand}` : title)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="canonical" href="${attr(site.url + canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(site.url + canonical)}">
  <meta property="og:site_name" content="${attr(site.brand)}">
  ${adsenseHeadTags()}
  <link rel="stylesheet" href="/styles.css">
  ${schema
    .map(
      (item) =>
        `<script type="application/ld+json">${JSON.stringify(item).replaceAll(
          "<",
          "\\u003c"
        )}</script>`
    )
    .join("\n  ")}
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="/" aria-label="${attr(site.brand)} home">
        <span class="brand-mark">26</span>
        <span>${esc(site.brand)}</span>
      </a>
      <nav class="nav" aria-label="Primary navigation">${nav()}</nav>
    </div>
  </header>
  ${body}
  <script src="/schedule.js" defer></script>
  <script src="/host-cities.js" defer></script>
  <script src="/groups.js" defer></script>
  <script src="/match-detail.js" defer></script>
  <footer class="footer">
    <div class="footer-inner">
      <strong>${esc(site.brand)}</strong>
      <span>Independent planning guide for ${esc(site.domain)}. Always confirm official schedule, ticket and broadcast details with primary sources.</span>
      <nav class="footer-links" aria-label="Footer navigation">
        <a href="/privacy-policy/">Privacy Policy</a>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
        <a href="/disclaimer/">Disclaimer</a>
      </nav>
    </div>
  </footer>
</body>
</html>`;

const hero = ({
  eyebrow,
  h1,
  intro,
  facts,
  variant = "default",
  actions,
  panelTitle = "Quick facts",
  panelIntro = "",
  panelRows,
  primaryHref = "/world-cup-2026-schedule/"
}) => {
  const heroActions =
    actions ??
    [
      ["Open schedule hub", primaryHref, "primary"],
      ["Ticket guide", "/world-cup-2026-tickets/", "secondary"]
    ];
  const rows = panelRows ?? facts;
  const panelContent =
    variant === "schedule"
      ? `<div class="hero-tool hero-tool-schedule">
      <strong class="hero-panel-title">${esc(panelTitle)}</strong>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      <div class="hero-planner" data-hero-planner>
        <div class="hero-planner-tabs" role="tablist" aria-label="Quick planner mode">
          <button type="button" role="tab" aria-selected="true" data-hero-planner-mode="team">Team</button>
          <button type="button" role="tab" aria-selected="false" data-hero-planner-mode="city">City</button>
          <button type="button" role="tab" aria-selected="false" data-hero-planner-mode="date">Date</button>
          <button type="button" role="tab" aria-selected="false" data-hero-planner-mode="stage">Stage</button>
        </div>
        <label class="hero-planner-field">
          <span data-hero-planner-label>Choose a team</span>
          <select data-hero-planner-select></select>
        </label>
        <div class="hero-planner-result" aria-live="polite">
          <span data-hero-planner-count>Loading matches...</span>
          <strong data-hero-planner-next>Choose a value to preview the next matching fixture.</strong>
          <em data-hero-planner-target>Choose an option to see where the schedule will open.</em>
        </div>
        <div class="hero-planner-actions">
          <button type="button" data-hero-planner-apply>Apply to schedule</button>
          <a href="#full-schedule" data-hero-planner-detail>Open first match</a>
        </div>
        <div class="hero-planner-secondary">
          <button type="button" data-hero-clear>Reset all filters</button>
          <button type="button" data-hero-focus="search">Search manually</button>
          <a href="/world-cup-2026-schedule-excel/">Excel export</a>
        </div>
      </div>
    </div>`
      : variant === "pdf"
        ? `<div class="hero-tool hero-tool-pdf">
      <strong class="hero-panel-title">${esc(panelTitle)}</strong>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      <div class="pdf-hero-preview" aria-label="World Cup 2026 schedule PDF preview">
        <img src="/assets/download-overview-poster-pdf-preview.png" alt="wc26schedule one-page World Cup 2026 schedule PDF preview" loading="eager" decoding="async">
        <div>
          <span>Featured PDF</span>
          <strong>One-page schedule overview</strong>
          <a href="/downloads/world-cup-2026-schedule-overview.pdf" download>Get overview PDF</a>
        </div>
      </div>
      <div class="download-checklist" aria-label="PDF download checklist">
        ${rows.map(([label, value]) => `<span><strong>${esc(label)}</strong>${esc(value)}</span>`).join("")}
      </div>
    </div>`
        : variant === "excel"
          ? `<div class="hero-tool hero-tool-excel">
      <div class="excel-hero-heading">
        <strong class="hero-panel-title">${esc(panelTitle)}</strong>
        <span>8 sheets</span>
      </div>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      <div class="excel-workbook-preview" aria-label="World Cup 2026 schedule Excel workbook preview">
        <div class="excel-workbook-tabs">
          <span>All Matches</span>
          <span>By Team</span>
          <span>Venues</span>
        </div>
        <div class="excel-workbook-table">
          <div class="excel-workbook-row excel-workbook-head">
            <span>Match</span><span>Date</span><span>Teams</span><span>City</span>
          </div>
          <div class="excel-workbook-row">
            <span>#1</span><span>Jun 11</span><span>MEX v RSA</span><span>Mexico City</span>
          </div>
          <div class="excel-workbook-row">
            <span>#17</span><span>Jun 16</span><span>ARG v ALG</span><span>Kansas City</span>
          </div>
          <div class="excel-workbook-row">
            <span>#25</span><span>Jun 19</span><span>CZE v RSA</span><span>Atlanta</span>
          </div>
        </div>
      </div>
      <div class="excel-hero-files">
        <a href="/downloads/world-cup-2026-schedule.xls" download><strong>XLS</strong><span>Filter workbook</span></a>
        <a href="/downloads/world-cup-2026-schedule.csv" download><strong>CSV</strong><span>Import data</span></a>
      </div>
    </div>`
          : variant === "cities"
            ? `<div class="hero-tool hero-tool-cities" data-city-hero-planner>
      <strong class="hero-panel-title">${esc(panelTitle)}</strong>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      <div class="city-hero-fields">
        <label>
          <span>Host city</span>
          <select data-city-hero-city>
            <option value="">All host cities</option>
          </select>
        </label>
        <label>
          <span>Planning need</span>
          <select data-city-hero-need>
            <option value="">All fixture types</option>
            <option value="high-volume">Most matches</option>
            <option value="knockout">Knockout rounds</option>
            <option value="final-week">Late tournament route</option>
            <option value="cross-border">Canada or Mexico venues</option>
          </select>
        </label>
      </div>
      <div class="city-hero-result" aria-live="polite">
        <span data-city-hero-count>Loading host cities...</span>
        <strong data-city-hero-primary>Choose a city or planning need.</strong>
        <em data-city-hero-secondary>Results will open in the host city planner below.</em>
      </div>
      <div class="city-hero-actions">
        <button type="button" data-city-hero-apply>Show matching cities</button>
        <button type="button" data-city-hero-reset>Reset</button>
      </div>
      <div class="city-hero-presets">
        <button type="button" data-city-hero-preset="knockout">Knockout hosts</button>
        <button type="button" data-city-hero-preset="final-week">Late tournament route</button>
      </div>
    </div>`
            : variant === "groups"
              ? (() => {
                  const groupItems = groupSummaries();
                  const teamOptions = groupItems
                    .flatMap((item) => item.teams.map((team) => ({ team, group: item.group })))
                    .sort((a, b) => a.team.localeCompare(b.team));
                  return `<div class="hero-tool hero-tool-groups" data-group-hero-tool>
      <strong class="hero-panel-title">${esc(panelTitle)}</strong>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      <div class="group-hero-mode" role="tablist" aria-label="Choose how to find a group route">
        <button type="button" role="tab" aria-selected="true" data-group-hero-mode="group">By group</button>
        <button type="button" role="tab" aria-selected="false" data-group-hero-mode="team">By team</button>
      </div>
      <div class="group-hero-fields">
        <label data-group-hero-field="group">
          <span>Choose group</span>
          <select data-group-hero-group>
            <option value="">All groups</option>
            ${groupItems.map((item) => `<option value="${attr(item.group)}">Group ${esc(item.group)} - ${esc(item.teams.join(", "))}</option>`).join("")}
          </select>
        </label>
        <label data-group-hero-field="team" hidden>
          <span>Choose team</span>
          <select data-group-hero-team>
            <option value="">Any team</option>
            ${teamOptions.map((item) => `<option value="${attr(item.team)}" data-group="${attr(item.group)}">${esc(item.team)} - Group ${esc(item.group)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="group-hero-team-preview" data-group-hero-team-preview aria-live="polite">
        <span>Teams will appear after you choose a group.</span>
      </div>
      <div class="group-hero-result" aria-live="polite">
        <span data-group-hero-count>${groupItems.length} groups ready</span>
        <strong data-group-hero-primary>Choose a group or team to jump into the right schedule path.</strong>
        <em data-group-hero-secondary>Use this panel to move directly to group cards, standings or the first fixture.</em>
      </div>
      <div class="group-hero-actions">
        <button type="button" data-group-hero-apply>Show group card</button>
        <a href="/world-cup-2026-standings/" data-group-hero-standings>Open standings</a>
      </div>
      <div class="group-hero-secondary-actions">
        <a href="#groups-explorer" data-group-hero-first>Open first match</a>
        <button type="button" data-group-hero-reset>Reset</button>
      </div>
    </div>`;
                })()
        : `<strong class="hero-panel-title">${esc(panelTitle)}</strong>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      ${rows
        .map(
          ([label, value]) => `<div class="panel-row"><span class="panel-label">${esc(
            label
          )}</span><span class="panel-value">${esc(value)}</span></div>`
        )
        .join("")}`;

  return `
<section class="hero hero-${attr(variant)}">
  <div class="hero-inner">
    <div>
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1>${esc(h1)}</h1>
      <p class="hero-copy">${esc(intro)}</p>
      <div class="hero-actions">
        ${heroActions
          .map(
            ([label, href, tone]) =>
              `<a class="button${tone === "secondary" ? " secondary" : ""}" href="${attr(href)}">${esc(label)}</a>`
          )
          .join("")}
      </div>
    </div>
    <aside class="hero-panel" aria-label="Quick facts">
      ${panelContent}
    </aside>
  </div>
</section>`;
};

const table = (rows) => `<div class="table-wrap">
<table>
  <thead><tr><th>Task</th><th>What to check</th><th>Next step</th></tr></thead>
  <tbody>
    ${rows
      .map(
        (row) =>
          `<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`
      )
      .join("")}
  </tbody>
</table>
</div>`;

const linkGrid = (links) => `<div class="link-grid">
${links
  .map(
    ([label, href]) =>
      `<a class="link-card" href="${attr(href)}"><span>${esc(label)}</span><span aria-hidden="true">-&gt;</span></a>`
  )
  .join("")}
</div>`;

const renderScheduleCapabilitySections = () => {
  const confirmedTeams = [
    ...new Set(
      matches
        .flatMap((match) => [match.home, match.away])
        .filter((team) => team && !team.includes("/") && !team.startsWith("W") && !team.startsWith("2") && !team.startsWith("1") && team !== "TBD")
    )
  ].length;
  const cityCount = new Set(matches.map((match) => match.city)).size;
  const groupCount = new Set(matches.map((match) => match.group).filter(Boolean)).size;
  const knockoutCount = matches.filter((match) => match.stage !== "Group stage").length;
  const groupCountMatches = matches.filter((match) => match.stage === "Group stage").length;
  const topCityRows = [...new Set(matches.map((match) => match.city))]
    .map((city) => {
      const cityMatches = matches.filter((match) => match.city === city);
      return {
        city,
        count: cityMatches.length,
        stadium: cityMatches[0]?.stadium || "",
        path: cityPath(cityMatches[0]?.citySlug || slugify(city))
      };
    })
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
    .slice(0, 6);

  return `
  <section class="section capability-section scroll-mt-24">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Use the schedule</p>
        <h2>How to Use the World Cup 2026 Match Schedule</h2>
        <p>Use the World Cup 2026 schedule by what you already know: a team, a city, a date, a group or a match number.</p>
      </div>
      <a class="button light" href="#full-schedule">Open schedule controls</a>
    </div>
    <div class="capability-grid">
      <article class="capability-card transition duration-200 hover:shadow-lg hover:border-pitch">
        <span class="capability-number">01</span>
        <h3>Find one World Cup 2026 schedule match fast</h3>
        <p>Use Search for a team, stadium, city, group letter or match number.</p>
        <dl><div><dt>Best input</dt><dd>Team, city or match #</dd></div><div><dt>Output</dt><dd>Filtered table and cards</dd></div></dl>
      </article>
      <article class="capability-card transition duration-200 hover:shadow-lg hover:border-pitch">
        <span class="capability-number">02</span>
        <h3>Change the World Cup 2026 schedule view</h3>
        <p>Switch between Table, Date cards, Team View and City View without changing data source.</p>
        <dl><div><dt>Best input</dt><dd>View tabs</dd></div><div><dt>Output</dt><dd>Schedule by task</dd></div></dl>
      </article>
      <article class="capability-card transition duration-200 hover:shadow-lg hover:border-pitch">
        <span class="capability-number">03</span>
        <h3>Keep a World Cup 2026 schedule copy</h3>
        <p>Use PDF for printing, Excel for sorting, or CSV for imports.</p>
        <dl><div><dt>Best input</dt><dd>Download format</dd></div><div><dt>Output</dt><dd>Offline planner</dd></div></dl>
      </article>
    </div>
  </section>

  <section class="section capability-section scroll-mt-24">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Date and venue planner</p>
        <h2>World Cup 2026 Schedule Dates and Locations</h2>
        <p>Use the World Cup 2026 schedule dates and city tools together when your real question is when to go and where the match is played.</p>
      </div>
      <a class="button light" href="/world-cup-2026-schedule-host-cities/">Compare host cities</a>
    </div>
    <div class="metric-strip">
      <div><span>Tournament window</span><strong>June 11 to July 19, 2026</strong></div>
      <div><span>Host cities</span><strong>${cityCount}</strong></div>
      <div><span>Total matches</span><strong>${matches.length}</strong></div>
    </div>
    <div class="planning-matrix">
      ${topCityRows
        .map(
          (item) => `<a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="${attr(item.path)}"><strong>${esc(item.city)}</strong><span>${item.count} matches</span><small>${esc(item.stadium)}</small></a>`
        )
        .join("")}
    </div>
  </section>

  <section class="section capability-section scroll-mt-24">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Timezone tool</p>
        <h2>Kickoff Times and Time Zones</h2>
        <p>Select your timezone once, then every visible World Cup 2026 schedule view uses the same local kickoff time and local date.</p>
      </div>
      <a class="button light" href="#full-schedule">Use timezone selector</a>
    </div>
    <div class="tool-flow">
      <div><b>1</b><strong>Select timezone</strong><span>Choose your viewing timezone above the schedule.</span></div>
      <div><b>2</b><strong>Read watch label</strong><span>Use world cup kickoff times as morning, afternoon, prime time, late night or overnight.</span></div>
      <div><b>3</b><strong>Filter local date</strong><span>The Local date filter follows your selected timezone.</span></div>
      <div><b>4</b><strong>Confirm source time</strong><span>Source ET remains visible for verification.</span></div>
    </div>
  </section>

  <section class="section capability-section scroll-mt-24">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Team and city views</p>
        <h2>Schedule by Team and Host City</h2>
        <p>Use Team View when following a country. Use City View when planning travel around World Cup 2026 schedule with venue details.</p>
      </div>
      <a class="button light" href="#full-schedule">Switch views</a>
    </div>
    <div class="split-tool">
      <article class="transition duration-200 hover:shadow-lg hover:border-pitch">
        <h3>Team View</h3>
        <p>${confirmedTeams} confirmed team cards group each country's matches with opponent, city, stadium, local time and watch window.</p>
        <ul><li>Best for national-team tracking.</li><li>Uses team chips, flags and three-letter codes.</li><li>Pairs with linked team schedule pages.</li></ul>
      </article>
      <article class="transition duration-200 hover:shadow-lg hover:border-pitch">
        <h3>City View</h3>
        <p>${cityCount} host city cards group the full schedule by venue market, match count and stage mix.</p>
        <ul><li>Best for travel and stadium planning.</li><li>Shows local match clusters without re-filtering the table.</li><li>Pairs with linked host city pages.</li></ul>
      </article>
    </div>
  </section>

  <section class="section capability-section scroll-mt-24">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Tournament path</p>
        <h2>FIFA World Cup 2026 Schedule Group and Bracket Planning</h2>
        <p>Use this FIFA World Cup 2026 schedule group and bracket module to separate fixed group-stage fixtures from knockout placeholders.</p>
      </div>
      <a class="button light" href="/world-cup-2026-schedule-groups/">Open groups guide</a>
    </div>
    <div class="path-board">
      <div><span>Group stage</span><strong>${groupCountMatches} matches</strong><small>Use the world cup group stage schedule across ${groupCount} groups with fixed teams, dates and venues.</small></div>
      <div><span>Knockout path</span><strong>${knockoutCount} matches</strong><small>Dates and venues are listed before teams are confirmed.</small></div>
      <div><span>Bracket workflow</span><strong>Schedule + standings + bracket</strong><small>Use all three once group results begin.</small></div>
    </div>
  </section>

  <section class="section capability-section scroll-mt-24">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Files and trust</p>
        <h2>Downloads, Sources and Update Notes</h2>
        <p>Choose a World Cup 2026 schedule PDF, Excel or CSV file by use case, then verify time-sensitive decisions against official sources.</p>
      </div>
      <a class="button light" href="/world-cup-2026-schedule-pdf/">Open PDF page</a>
    </div>
    <div class="download-decision-grid">
      <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="/world-cup-2026-schedule-pdf/"><strong>PDF</strong><span>Print, save or share a simple offline copy.</span></a>
      <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="/world-cup-2026-schedule-excel/"><strong>Excel</strong><span>Sort and filter matches by team, date, city, stage or stadium.</span></a>
      <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="/downloads/world-cup-2026-schedule.csv"><strong>CSV</strong><span>Import the structured schedule into another planner.</span></a>
    </div>
    <ul class="source-checklist">
      <li>World cup fixtures 2026, downloads and visible tools should be refreshed together.</li>
      <li>Tickets, venue operations and broadcasts should be confirmed with official sources.</li>
      <li>wc26schedule is an independent planning guide, not an official FIFA property.</li>
    </ul>
  </section>`;
};

const renderScheduleNavigation = () => `<section class="section capability-section scroll-mt-24">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Navigation paths</p>
      <h2>Ways to Navigate the Full Schedule</h2>
      <p>Pick a World Cup 2026 schedule path based on the decision you are trying to make now.</p>
    </div>
    <a class="button light" href="#full-schedule">Return to schedule</a>
  </div>
  <div class="route-grid">
    <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="#full-schedule"><strong>Find a match</strong><span>Search the World Cup 2026 schedule by team, city, stadium, group or match number.</span></a>
    <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="#full-schedule"><strong>Follow a team</strong><span>Open Team View, choose one country, then jump to its team page.</span></a>
    <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="#full-schedule"><strong>Plan a city trip</strong><span>Open City View and compare match clusters by venue market.</span></a>
    <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="/world-cup-2026-schedule-pdf/"><strong>Save offline</strong><span>Use the PDF when you need a printable fixture list.</span></a>
    <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="/world-cup-2026-schedule-excel/"><strong>Sort your own way</strong><span>Use Excel when you want custom filtering outside the browser.</span></a>
    <a class="transition duration-200 hover:shadow-lg hover:border-pitch" href="/world-cup-2026-tickets/"><strong>Check paid decisions</strong><span>Move to ticket guidance before buying or booking around a match.</span></a>
  </div>
</section>`;

const teamLink = (team) =>
  isRealTeam(team) ? `<a href="${attr(teamPath(team))}">${esc(team)}</a>` : esc(team);

const teamChip = (team, side = "") => {
  const sideLabel = side ? `<span>${esc(side)}</span>` : "";
  const code = `<b>${esc(teamCode(team))}</b>`;
  const flagUrl = teamFlagUrl(team);
  const flag = flagUrl
    ? `<img class="team-flag" src="${attr(flagUrl)}" alt="" loading="lazy" decoding="async" aria-hidden="true">`
    : "";
  return isRealTeam(team)
    ? `<a class="team-chip" href="${attr(teamPath(team))}">${sideLabel}<em>${flag}${code}<strong>${esc(team)}</strong></em></a>`
    : `<span class="team-chip is-placeholder">${sideLabel}<em>${flag}${code}<strong>${esc(team)}</strong></em></span>`;
};

const matchupHtml = (home, away) =>
  `<div class="matchup"><div>${teamChip(home, "Home")}</div><span>vs</span><div>${teamChip(away, "Away")}</div></div>`;

const groupListItems = () => {
  const groups = new Map();
  for (const match of matches.filter((item) => item.stage === "Group stage" && item.group)) {
    if (!groups.has(match.group)) groups.set(match.group, new Set());
    if (isRealTeam(match.home)) groups.get(match.group).add(match.home);
    if (isRealTeam(match.away)) groups.get(match.group).add(match.away);
  }
  return [...groups.entries()]
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([group, teams]) => [group, [...teams]]);
};

const groupSummaries = () =>
  groupListItems().map(([group, teams]) => {
    const groupMatches = matches
      .filter((match) => match.stage === "Group stage" && match.group === group)
      .sort((a, b) => a.date.localeCompare(b.date) || a.kickoffET.localeCompare(b.kickoffET));
    const cities = [...new Set(groupMatches.map((match) => match.city))].sort((a, b) => a.localeCompare(b));
    const stadiums = [...new Set(groupMatches.map((match) => match.stadium))].sort((a, b) => a.localeCompare(b));
    const firstMatch = groupMatches[0];
    const lastMatch = groupMatches.at(-1);
    return { group, teams, matches: groupMatches, cities, stadiums, firstMatch, lastMatch };
  });

const groupStandingsPreviewRows = (teams) =>
  teams
    .map((team, index) => {
      const rank = index + 1;
      const status = rank <= 2 ? "Top-two route" : rank === 3 ? "Rank-three watch" : "Needs results";
      const note =
        rank <= 2
          ? "Would advance if this position holds."
        : rank === 3
            ? "Must compare record with other groups."
            : "Needs points to climb.";
      return `<tr>
      <td><span>${rank}</span></td>
      <td>${teamChip(team)}</td>
      <td>0</td>
      <td><strong>${status}</strong><small>${note}</small></td>
    </tr>`;
    })
    .join("");

const renderGroupsSupportSections = () => {
  const groups = groupSummaries();
  const groupMatchCount = groups.reduce((total, group) => total + group.matches.length, 0);
  const teams = groups.flatMap((group) => group.teams);
  const cityCount = new Set(groups.flatMap((group) => group.cities)).size;

  return `<section class="section host-city-tool-section">
  <div class="host-city-explorer-head">
    <div>
      <p class="eyebrow">Group stage map</p>
      <h2>World Cup 2026 Schedule Groups by Teams, Fixtures and Cities</h2>
      <p>The World Cup 2026 schedule groups view connects each four-team group with its fixed group-stage fixtures, host cities and next planning pages. Use it when you want the group structure first, then open the full schedule, standings, team pages or match details for a narrower decision.</p>
    </div>
    <div class="host-city-scoreboard" aria-label="World Cup 2026 groups summary">
      <div><strong>${groups.length}</strong><span>groups</span></div>
      <div><strong>${teams.length}</strong><span>teams</span></div>
      <div><strong>${groupMatchCount}</strong><span>group fixtures</span></div>
      <div><strong>${cityCount}</strong><span>host cities used</span></div>
    </div>
  </div>
  <div class="utility-card-grid">
    <article><strong>Find one group</strong><span>Start with Group A through Group L when you already know a team's draw position.</span></article>
    <article><strong>Check fixture spread</strong><span>Compare the cities and match dates attached to that group before opening a team route.</span></article>
    <article><strong>Understand advancement</strong><span>The top two teams in each group plus the best third-place teams move toward the knockout bracket.</span></article>
    <article><strong>Move to standings</strong><span>Before results, this is a planning page. During the tournament, standings become the live table.</span></article>
  </div>
</section>

<section class="section groups-explorer" id="groups-explorer" data-groups-explorer>
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Group cards</p>
      <h2>World Cup 2026 Schedule Groups and Fixtures</h2>
      <p>Each card shows the teams, all six group fixtures, date window and host-city spread for one group. Open team pages when you follow one country, city routes when you compare venues, or match details when you need kickoff time, stadium and source notes.</p>
    </div>
    <a class="button light" href="/world-cup-2026-schedule/#full-schedule">Open full schedule</a>
  </div>
  <div class="groups-tabbar" role="tablist" aria-label="Choose a World Cup 2026 schedule group">
    <button type="button" data-group-filter="" aria-pressed="true">All groups</button>
    ${groups.map((item) => `<button type="button" data-group-filter="${attr(item.group)}">Group ${esc(item.group)}</button>`).join("")}
  </div>
  <div class="host-city-results-line" id="group-results">
    <strong><span data-group-result-count>${groups.length}</span> groups shown</strong>
    <span>Use A-L tabs to focus the group cards without leaving the page.</span>
  </div>
  <aside class="group-qualification-panel" data-group-qualification-panel>
    <div>
      <p class="eyebrow">Qualification path</p>
      <h3 data-qualification-title>All World Cup 2026 Schedule Groups</h3>
      <p data-qualification-copy>Every group starts level before the tournament begins. The top two teams from each group advance, while third-place teams move into a cross-group comparison for the remaining Round of 32 places.</p>
    </div>
    <div class="qualification-path-grid">
      <article>
        <span>1</span>
        <strong>Top two</strong>
        <small data-qualification-top>24 teams qualify directly from first and second place.</small>
      </article>
      <article>
        <span>3</span>
        <strong>Third-place race</strong>
        <small data-qualification-third>Eight third-place teams qualify after comparing records across groups.</small>
      </article>
      <article>
        <span>TB</span>
        <strong>Tie-breakers</strong>
        <small>Points, goal difference, goals scored and FIFA tie-break rules decide close groups.</small>
      </article>
    </div>
    <div class="qualification-panel-actions">
      <a href="/world-cup-2026-standings/" data-qualification-standings>Open standings</a>
      <a href="/world-cup-2026-bracket/">Open bracket path</a>
    </div>
  </aside>
  <div class="groups-card-grid">
    ${groups
      .map(
        (item) => `<article class="groups-card" id="group-${attr(item.group.toLowerCase())}" data-group-card="${attr(item.group)}" data-group-teams="${attr(item.teams.join(", "))}" data-group-first="#${attr(item.firstMatch.matchNumber)} ${attr(item.firstMatch.home)} vs ${attr(item.firstMatch.away)}" data-group-first-path="${attr(matchDetailPath(item.firstMatch))}" data-group-last="${attr(shortDate(item.lastMatch.date))}" data-group-cities="${attr(item.cities.join(", "))}">
      <div class="groups-card-head">
        <span>Group ${esc(item.group)}</span>
        <strong>${item.matches.length} fixtures</strong>
      </div>
      <div class="city-detail-team-cloud">
        ${item.teams.map((team) => teamChip(team)).join("")}
      </div>
      <div class="group-city-routes" aria-label="Host cities for Group ${attr(item.group)}">
        ${item.cities.map((city) => `<a href="${attr(cityPath(slugify(city)))}">${esc(city)}</a>`).join("")}
      </div>
      <section class="group-standings-preview" aria-label="Group ${attr(item.group)} standings preview">
        <div class="group-standings-head">
          <div>
            <span>Standings preview</span>
            <strong>Group ${esc(item.group)} starts level</strong>
          </div>
          <a href="/world-cup-2026-standings/#group-${attr(item.group.toLowerCase())}">Live table</a>
        </div>
        <div class="group-standings-table-wrap">
          <table class="group-standings-table">
            <thead>
              <tr><th>Rank</th><th>Team</th><th>Pts</th><th>Route</th></tr>
            </thead>
            <tbody>
              ${groupStandingsPreviewRows(item.teams)}
            </tbody>
          </table>
        </div>
      </section>
      <dl>
        <div><dt>Date window</dt><dd>${esc(shortDate(item.firstMatch.date))}-${esc(shortDate(item.lastMatch.date))}</dd></div>
        <div><dt>Host cities</dt><dd>${esc(item.cities.slice(0, 4).join(", "))}${item.cities.length > 4 ? "..." : ""}</dd></div>
        <div><dt>First fixture</dt><dd>#${item.firstMatch.matchNumber} ${esc(item.firstMatch.home)} vs ${esc(item.firstMatch.away)}</dd></div>
      </dl>
      <div class="group-route-panel">
        <div>
          <span>First decision point</span>
          <strong>${esc(shortDate(item.firstMatch.date))}: #${item.firstMatch.matchNumber} ${esc(item.firstMatch.home)} vs ${esc(item.firstMatch.away)}</strong>
        </div>
        <div>
          <span>Final group day</span>
          <strong>${esc(shortDate(item.lastMatch.date))}: standings and third-place watch become clearer</strong>
        </div>
      </div>
      <div class="group-fixture-list">
        ${item.matches
          .map(
            (match) => `<a href="${attr(matchDetailPath(match))}">
          <span>#${match.matchNumber}</span>
          <strong>${esc(`${match.home} vs ${match.away}`)}</strong>
          <small>${esc(`${shortDate(match.date)} - ${match.city}`)}</small>
        </a>`
          )
          .join("")}
      </div>
      <div class="host-city-actions">
        <a href="${attr(matchDetailPath(item.firstMatch))}">Open first match</a>
        <a href="/world-cup-2026-schedule/?group=${attr(item.group)}#full-schedule">View group fixtures</a>
      </div>
    </article>`
      )
      .join("")}
  </div>
</section>

<section class="section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Qualification path</p>
      <h2>How the Schedule Groups Connect to Standings and the Bracket</h2>
      <p>The groups page should answer the planning question before results arrive and the qualification question once results begin. The schedule tells you who plays, when and where; standings explain points and ranking; the bracket explains where qualified teams go next.</p>
    </div>
  </div>
  <div class="host-city-source-grid">
    <article><span>Before kickoff</span><strong>Use groups for structure</strong><p>Compare teams, cities, fixtures and date windows without mixing fixed group-stage matches with knockout placeholders.</p><a href="/world-cup-2026-schedule/">Filter schedule</a></article>
    <article><span>During group play</span><strong>Use standings for ranking</strong><p>Track points, goal difference and qualification status when results start changing the table.</p><a href="/world-cup-2026-standings/">Open standings</a></article>
    <article><span>After groups</span><strong>Use bracket for routes</strong><p>Move from group placement into the Round of 32, then follow the knockout path toward the final.</p><a href="/world-cup-2026-bracket/">Open bracket</a></article>
  </div>
</section>

<section class="section">
  <h2>Ways to Use the World Cup 2026 Schedule Groups Page</h2>
  ${table([
    ["Follow one team", "Open its group card, then use the linked team page and match pages.", "Compare opponents, rest days and host cities."],
    ["Plan around a group", "Use the fixture spread to see where the six group matches are played.", "Open the full schedule with the group filter."],
    ["Check qualification", "Use this page for structure and the standings page for live ranking.", "Review tie-breakers before knockout qualification scenarios."],
    ["Prepare bracket planning", "Once the group stage ends, group placement feeds the bracket.", "Open the bracket page for knockout paths."]
  ])}
</section>`;
};

const renderPdfVisualSections = () => {
  const groups = groupListItems();
  return `<section class="section pdf-feature-section">
  <div class="pdf-feature-grid">
    <div class="pdf-feature-copy">
      <p class="eyebrow">Single-image reference</p>
      <h2>Full Match Schedule Overview Image</h2>
      <p>The full match schedule overview image is built for users who want the entire tournament on one visual reference. It lists the group-stage fixtures from M1 through M72, then shows the knockout stage from the Round of 32 through the Round of 16, quarter-finals, semi-finals, third-place playoff and final.</p>
      <p>Use this image when you need a fast visual handout, a planning-board reference or a shareable snapshot before moving into the PDF library. It includes match numbers, dates, host cities, venues and bracket placeholder notation such as 1A, 2D and 3ABCDF, while the full PDF and live schedule remain better for detailed filtering and time-zone checks.</p>
      <div class="pdf-feature-actions">
        <a class="button" href="/assets/2026-world-cup-full-match-schedule-overview.png" download>Get overview image</a>
        <a class="button light" href="/downloads/world-cup-2026-schedule.pdf" download>Get printable PDF</a>
      </div>
    </div>
    <aside class="pdf-preview-card pdf-preview-card-wide">
      <span>Full overview image</span>
      <img src="/assets/2026-world-cup-full-match-schedule-overview.png" alt="World Cup 2026 full match schedule overview image preview" loading="eager" decoding="async">
      <a href="/assets/2026-world-cup-full-match-schedule-overview.png" download>Open the overview image</a>
    </aside>
  </div>
</section>

<section class="section pdf-feature-section">
  <div class="pdf-feature-grid">
    <div class="pdf-feature-copy">
      <p class="eyebrow">Printable download</p>
      <h2>2026 World Cup Schedule PDF for USA, Canada and Mexico</h2>
      <p>The complete printable PDF is the right first file when you want all 104 matches in one offline reference. It keeps the host-city matrix on the opening page, then follows with match detail pages that include date, kickoff time, team names, match number, stage, host city and stadium.</p>
      <p>Use this file for a travel folder, watch-party packet, classroom board, office bracket wall or shared planning drive. It is intentionally more detailed than a poster because users often need to check a specific fixture after the first visual scan.</p>
      <div class="pdf-feature-actions">
        <a class="button" href="/downloads/world-cup-2026-schedule.pdf" download>Get printable PDF</a>
        <a class="button light" href="/world-cup-2026-schedule/">Use live schedule</a>
      </div>
    </div>
    <aside class="pdf-preview-card">
      <span>Full printable file</span>
      <img src="/assets/download-pdf-matrix-preview.png" alt="Printable World Cup 2026 schedule PDF matrix preview" loading="eager" decoding="async">
      <a href="/downloads/world-cup-2026-schedule.pdf" download>Open the printable PDF</a>
    </aside>
  </div>
</section>

<section class="section pdf-feature-section">
  <div class="pdf-feature-grid">
    <div class="pdf-feature-copy">
      <p class="eyebrow">Tournament timing</p>
      <h2>When is the Next World Cup?</h2>
      <p>The next World Cup begins on Thursday, June 11, 2026 and runs through Sunday, July 19, 2026. The tournament is hosted across the United States, Canada and Mexico, with 48 teams, 12 groups and 104 matches across 16 host cities.</p>
      <ul class="pdf-bullet-list">
        <li>The opening match is scheduled for Mexico City, and the final is scheduled for New York New Jersey.</li>
        <li>The group stage uses fixed teams and fixtures, while the knockout stage uses placeholders until results are known.</li>
        <li>The top two teams from each group plus the eight best third-place teams move into the Round of 32.</li>
        <li>Use the stage overview PDF when you want to separate group-stage days from bracket and knockout planning.</li>
      </ul>
      <div class="pdf-feature-actions">
        <a class="button" href="/downloads/world-cup-2026-stage-overview.pdf" download>Get stage overview</a>
        <a class="button light" href="/world-cup-2026-dates/">Check tournament dates</a>
      </div>
    </div>
    <aside class="pdf-preview-card">
      <span>Group-stage overview</span>
      <img src="/assets/stage-overview-pdf-group-preview.png" alt="World Cup 2026 group-stage schedule PDF preview" loading="eager" decoding="async">
      <a href="/downloads/world-cup-2026-stage-overview.pdf" download>Open the stage PDF</a>
    </aside>
  </div>
</section>

<section class="section pdf-feature-section">
  <div class="pdf-feature-grid">
    <div class="pdf-feature-copy">
      <p class="eyebrow">Groups and bracket</p>
      <h2>2026 World Cup Groups and Knockout Planning</h2>
      <p>The groups are already useful for PDF planning because they tell fans which fixtures are fixed and which paths still depend on tournament results. The group list below is generated from the same structured schedule data used for the downloads, so it stays connected to the fixture table rather than becoming a separate manual note.</p>
      <div class="pdf-group-list">
        ${groups
          .map(
            ([group, teams]) =>
              `<p><strong>${esc(group)}:</strong> ${teams.map((team) => esc(team)).join(", ")}</p>`
          )
          .join("")}
      </div>
      <p>For knockout-route planning, open the bracket PDF and keep the live match pages nearby. The PDF gives you the shape of the route; match detail pages give you the exact city, stadium, time-zone and related team route once a fixture matters to your plan.</p>
      <div class="pdf-feature-actions">
        <a class="button" href="/downloads/printable-world-cup-2026-schedule-bracket.pdf" download>Get bracket PDF</a>
        <a class="button light" href="/world-cup-2026-schedule-groups/">Open groups guide</a>
      </div>
    </div>
    <aside class="pdf-preview-card">
      <span>Knockout-stage overview</span>
      <img src="/assets/stage-overview-pdf-knockout-preview.png" alt="World Cup 2026 knockout-stage schedule PDF preview" loading="eager" decoding="async">
      <a href="/downloads/world-cup-2026-stage-overview.pdf" download>Open knockout view</a>
    </aside>
  </div>
</section>`;
};

const renderPdfUsageCards = (heading, rows) => `<section class="section">
  <h2>${esc(heading)}</h2>
  <div class="pdf-use-grid">
    ${rows
      .map(
        ([task, check, step]) => `<article class="pdf-use-card">
      <span>${esc(task)}</span>
      <p>${esc(check)}</p>
      <strong>${esc(step)}</strong>
    </article>`
      )
      .join("")}
  </div>
</section>`;

const renderPdfChooser = (overview) => {
  const choices = [
    ["Print complete details", "Printable PDF", "/downloads/world-cup-2026-schedule.pdf", "Use when you need match numbers, dates, teams, cities, stadiums and detail pages in one offline packet."],
    ["Scan the tournament quickly", "Overview poster PDF", "/downloads/world-cup-2026-schedule-overview.pdf", "Use when you want a one-page visual matrix by host city and match date."],
    ["Separate group and knockout stages", "Stage overview PDF", "/downloads/world-cup-2026-stage-overview.pdf", "Use when group-stage fixtures and knockout-stage matches should stay on different pages."],
    ["Plan bracket routes", "Bracket PDF", "/downloads/printable-world-cup-2026-schedule-bracket.pdf", "Use when knockout paths, semifinals, third-place match and final dates are the main task."],
    ["Share one image", "Full overview image", "/assets/2026-world-cup-full-match-schedule-overview.png", "Use when you need a quick image for a planning board, chat or visual handout."]
  ];
  return `<section class="section pdf-chooser-section">
  <div class="pdf-chooser-head">
    <div>
      <p class="eyebrow">${esc(overview.eyebrow)}</p>
      <h2>${esc(overview.heading)}</h2>
      <p>${esc(overview.copy)}</p>
    </div>
    <aside>
      <p class="eyebrow">${esc(overview.noteEyebrow)}</p>
      <h3>${esc(overview.noteHeading)}</h3>
      <p>${esc(overview.noteCopy)}</p>
    </aside>
  </div>
  <div class="pdf-choice-grid">
    ${choices
      .map(
        ([task, file, href, copy]) => `<a class="pdf-choice-card" href="${attr(href)}" download>
      <span>${esc(task)}</span>
      <strong>${esc(file)}</strong>
      <p>${esc(copy)}</p>
      <em>Get file</em>
    </a>`
      )
      .join("")}
  </div>
</section>`;
};

const renderPdfSupportSections = () => `<section class="section pdf-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Download decision</p>
      <h2>Which World Cup 2026 Schedule PDF Should You Download?</h2>
      <p>Start with the file that matches the job in front of you, then switch formats only when the task changes.</p>
    </div>
    <a class="button light" href="#download-library">View files</a>
  </div>
  <div class="pdf-task-grid">
    <article><span>Need every match detail</span><strong>Printable PDF</strong><p>Best when you need all 104 matches with dates, teams, match numbers, host cities and stadiums.</p></article>
    <article><span>Need the fastest scan</span><strong>Overview poster PDF</strong><p>Best when you want the whole tournament shape by date and host city on one page.</p></article>
    <article><span>Need tournament phases</span><strong>Stage overview PDF</strong><p>Best when group-stage days and knockout-stage days should stay visually separate.</p></article>
    <article><span>Need knockout route</span><strong>Bracket PDF</strong><p>Best when semifinals, third-place match, final dates and bracket paths matter most.</p></article>
  </div>
</section>

<section class="section pdf-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">File contents</p>
      <h2>What Each PDF Includes</h2>
      <p>Use this checklist before downloading so you do not open the wrong file for a simple planning task.</p>
    </div>
  </div>
  <div class="pdf-include-table">
    <div><strong>Printable PDF</strong><span>Matrix, 104-match detail list, dates, ET kickoff, teams, stage, city, stadium and venue-local time.</span><a href="/downloads/world-cup-2026-schedule.pdf" download>Open</a></div>
    <div><strong>Overview poster PDF</strong><span>One-page host-city and match-date matrix for quick visual scanning and sharing.</span><a href="/downloads/world-cup-2026-schedule-overview.pdf" download>Open</a></div>
    <div><strong>Stage overview PDF</strong><span>Two-page split between group-stage fixtures and knockout-stage schedule blocks.</span><a href="/downloads/world-cup-2026-stage-overview.pdf" download>Open</a></div>
    <div><strong>Bracket PDF</strong><span>Group fixtures, knockout bracket, BST times, semifinals, third-place match and final schedule.</span><a href="/downloads/printable-world-cup-2026-schedule-bracket.pdf" download>Open</a></div>
  </div>
</section>

<section class="section pdf-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Scan paths</p>
      <h2>Printable Schedule by Date, City and Stage</h2>
      <p>The PDFs are easier to use when you scan by the same three questions fans ask before they plan.</p>
    </div>
  </div>
  <div class="pdf-axis-grid">
    <article><span>Date</span><strong>When is the match?</strong><p>Use the matrix and printable list to mark busy match days before you check alarms, watch parties or travel windows.</p></article>
    <article><span>City</span><strong>Where is it played?</strong><p>Use the city rows to compare Dallas, Los Angeles, Atlanta, Miami, New York New Jersey and other host markets.</p></article>
    <article><span>Stage</span><strong>What part of the tournament?</strong><p>Use stage labels to separate group-stage fixtures from knockout rounds, semifinals and the final.</p></article>
  </div>
</section>

<section class="section pdf-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Travel workflow</p>
      <h2>How to Use the PDF Library for Travel Planning</h2>
      <p>Use the PDF files as a planning layer, then confirm details before spending money.</p>
    </div>
    <a class="button light" href="/world-cup-2026-schedule-host-cities/">Compare host cities</a>
  </div>
  <ol class="pdf-step-list">
    <li><strong>Scan the overview.</strong><span>Use the poster or overview image to identify cities and date clusters.</span></li>
    <li><strong>Open the printable PDF.</strong><span>Check the exact match number, teams, city, stadium and kickoff information.</span></li>
    <li><strong>Move to city pages.</strong><span>Review venue context and local match groups before planning hotels or transport.</span></li>
    <li><strong>Verify official details.</strong><span>Before tickets, flights or printed packets, confirm the latest information with official sources.</span></li>
  </ol>
</section>

<section class="section pdf-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Format choice</p>
      <h2>PDF vs Excel vs Live Schedule</h2>
      <p>Each format has a different job. Pick the one that answers your current question fastest.</p>
    </div>
  </div>
  <div class="pdf-format-grid">
    <article><strong>PDF</strong><span>Best for printing, saving, sharing and offline reading.</span><a href="#download-library">View PDF files</a></article>
    <article><strong>Excel</strong><span>Best for filtering by team, city, date, stage or stadium.</span><a href="/world-cup-2026-schedule-excel/">Use Excel planner</a></article>
    <article><strong>Live schedule</strong><span>Best for timezone switching, team pages, city pages and match details.</span><a href="/world-cup-2026-schedule/">Open live schedule</a></article>
  </div>
</section>

<section class="section pdf-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Freshness and trust</p>
      <h2>Update Notes and Official Sources</h2>
      <p>Use wc26schedule files for organization, then verify final decisions with official sources before acting.</p>
    </div>
    <a class="button light" href="${attr(officialFifaScheduleUrl)}">Official FIFA schedule</a>
  </div>
  <div class="pdf-source-grid">
    <article><strong>Refresh before</strong><span>Ticket purchases, hotel bookings, flights, printed watch-party sheets or group sharing.</span></article>
    <article><strong>Check against</strong><span>FIFA schedule updates, host city guidance, stadium information and authorized ticket or broadcast sources.</span></article>
    <article><strong>Use a dated folder</strong><span>Save shared files with the update date so groups know which copy they are using.</span></article>
  </div>
</section>`;

const renderExcelPlanner = (overview) => {
  const tasks = [
    ["Filter by team", "Find one country's matches, opponents, groups and possible planning route.", "By Team sheet"],
    ["Compare host cities", "Review match clusters by city, stadium and stage before travel decisions.", "Venues sheet"],
    ["Sort by date", "Build watch lists, editorial calendars or travel windows around match days.", "By Date sheet"],
    ["Import the data", "Use CSV for Google Sheets, Airtable, Notion, databases or custom tools.", "CSV file"]
  ];
  return `<section class="section excel-planner-section">
  <div class="excel-planner-head">
    <div>
      <p class="eyebrow">${esc(overview.eyebrow)}</p>
      <h2>${esc(overview.heading)}</h2>
      <p>${esc(overview.copy)}</p>
      <div class="excel-planner-actions">
        <a class="button" href="/downloads/world-cup-2026-schedule.xls" download>Get Excel workbook</a>
        <a class="button light" href="/downloads/world-cup-2026-schedule.csv" download>Get CSV file</a>
      </div>
    </div>
    <aside>
      <p class="eyebrow">${esc(overview.noteEyebrow)}</p>
      <h3>${esc(overview.noteHeading)}</h3>
      <p>${esc(overview.noteCopy)}</p>
    </aside>
  </div>
  <div class="excel-task-grid">
    ${tasks
      .map(
        ([task, copy, sheet]) => `<article>
      <span>${esc(sheet)}</span>
      <strong>${esc(task)}</strong>
      <p>${esc(copy)}</p>
    </article>`
      )
      .join("")}
  </div>
</section>`;
};

const renderExcelSupportSections = () => {
  const sheets = [
    ["README", "How to use the workbook and what source notes mean."],
    ["All Matches", "The complete 104-match dataset with teams, dates, times, stages, cities and stadiums."],
    ["Group Stage", "Fixed group-stage fixtures separated from knockout placeholders."],
    ["Knockout", "Round of 32 through final planning rows with bracket-style placeholders."],
    ["By Date", "A date-first view for calendars, watch parties and travel windows."],
    ["By Team", "A team-first view for fans following one country."],
    ["Venues", "Host city, country, stadium and match-count context."],
    ["Groups", "Group assignments for quick tournament structure checks."]
  ];
  return `<section class="section excel-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Workbook structure</p>
      <h2>What Is Inside the World Cup 2026 Schedule Excel Workbook?</h2>
      <p>The FIFA World Cup 2026 schedule spreadsheet is organized into eight sheets so users can move from the full fixture list into team, date, venue and group views without rebuilding the file.</p>
    </div>
    <a class="button light" href="#download-library">View files</a>
  </div>
  <div class="excel-sheet-grid">
    ${sheets.map(([sheet, copy]) => `<article><span>${esc(sheet)}</span><p>${esc(copy)}</p></article>`).join("")}
  </div>
</section>

<section class="section excel-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Planning filters</p>
      <h2>Filter the Spreadsheet by Team, City, Date or Stage</h2>
      <p>Use the world cup fixtures spreadsheet when you need to answer a specific planning question instead of scanning a static schedule.</p>
    </div>
  </div>
  <div class="excel-filter-grid">
    <article><strong>Team filter</strong><span>Track Argentina, Brazil, England, Mexico, the United States or any qualified team through its listed matches.</span></article>
    <article><strong>City filter</strong><span>Compare Dallas, Atlanta, Los Angeles, Miami, Mexico City, Toronto, Vancouver and other host markets.</span></article>
    <article><strong>Date sort</strong><span>Group match days for watch parties, editorial coverage, travel windows or personal reminders.</span></article>
    <article><strong>Stage filter</strong><span>Separate group-stage fixtures from knockout-stage dates, semifinals, third-place match and final planning.</span></article>
  </div>
</section>

<section class="section excel-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Excel vs CSV</p>
      <h2>Excel Workbook or World Cup Schedule CSV Data?</h2>
      <p>Both files use the same schedule dataset, but they solve different user tasks: the workbook supports direct planning, while CSV is cleaner for imports.</p>
    </div>
  </div>
  <div class="excel-compare-grid">
    <article><strong>Use Excel when</strong><ul><li>You want multiple sheets.</li><li>You prefer styled rows and headers.</li><li>You need an offline planner for filtering and sorting.</li></ul><a href="/downloads/world-cup-2026-schedule.xls" download>Get Excel</a></article>
    <article><strong>Use CSV when</strong><ul><li>You want raw import-friendly data.</li><li>You use Google Sheets, Airtable or a database.</li><li>You are building a custom schedule view.</li></ul><a href="/downloads/world-cup-2026-schedule.csv" download>Get CSV</a></article>
  </div>
</section>

<section class="section excel-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Spreadsheet workflow</p>
      <h2>How to Use the World Cup 2026 Fixtures Spreadsheet</h2>
      <p>Start with the workbook for exploration, then move to the schedule page or PDF page when your planning question changes.</p>
    </div>
  </div>
  <ol class="excel-step-list">
    <li><strong>Open All Matches.</strong><span>Confirm the row fields you want: match number, date, team, city, stadium, stage and time.</span></li>
    <li><strong>Filter one dimension.</strong><span>Start with team, city, date or stage so the file stays easy to read.</span></li>
    <li><strong>Save a working copy.</strong><span>Add notes, travel status or watch-party plans in your own version rather than changing the source file.</span></li>
    <li><strong>Verify before decisions.</strong><span>Use the live schedule and official FIFA information before buying tickets or booking travel.</span></li>
  </ol>
</section>

<section class="section excel-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Format choice</p>
      <h2>Excel vs PDF vs Live Schedule</h2>
      <p>Choose the format based on whether you need to edit, print or browse.</p>
    </div>
  </div>
  <div class="excel-format-grid">
    <article><strong>Excel</strong><span>Best for sorting, filtering, custom notes and comparing teams or cities.</span><a href="/downloads/world-cup-2026-schedule.xls" download>Get workbook</a></article>
    <article><strong>PDF</strong><span>Best for printing, sharing and offline reading once your list is final.</span><a href="/world-cup-2026-schedule-pdf/">Open PDF page</a></article>
    <article><strong>Live schedule</strong><span>Best for timezone switching, match detail pages and linked team or city routes.</span><a href="/world-cup-2026-schedule/">Open schedule</a></article>
  </div>
</section>

<section class="section excel-support-section">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Sources and freshness</p>
      <h2>Excel Schedule Updates and Official Sources</h2>
      <p>Use the workbook for organization, then confirm final plans with official sources before acting.</p>
    </div>
    <a class="button light" href="${attr(officialFifaScheduleUrl)}">Official FIFA schedule</a>
  </div>
  <div class="excel-source-grid">
    <article><strong>Refresh before</strong><span>Ticket purchases, hotel bookings, flights, published calendars or group sharing.</span></article>
    <article><strong>Check against</strong><span>FIFA schedule updates, host city pages, stadium guidance and authorized ticket or broadcast sources.</span></article>
    <article><strong>Keep copies labeled</strong><span>Name working files with an update date so collaborators know which version they are editing.</span></article>
  </div>
</section>`;
};

const renderExcelDownloadSelector = (page = {}) => {
  const excelFiles = [
    {
      format: "XLS",
      label: "Excel-compatible workbook",
      href: "/downloads/world-cup-2026-schedule.xls",
      badge: "Recommended",
      task: "Filter and sort the schedule",
      bestFor: "Fans, travelers and editors who want multiple planning sheets.",
      includes: ["8 sheets", "104 matches", "Team, city, date, stage and venue fields", "Source notes"],
      worksWith: "Microsoft Excel, Apple Numbers and spreadsheet apps that open .xls files"
    },
    {
      format: "CSV",
      label: "Clean schedule data",
      href: "/downloads/world-cup-2026-schedule.csv",
      badge: "Import file",
      task: "Move the schedule into another tool",
      bestFor: "Google Sheets, Airtable, Notion databases, BI tools and custom schedule builders.",
      includes: ["104 rows", "ET, UTC and venue-local time fields", "Team codes", "Match detail URLs"],
      worksWith: "Google Sheets, Airtable, databases, scripts and no-code planning tools"
    }
  ];
  return `<section class="section excel-download-selector" id="download-library">
  <div class="excel-download-head">
    <div>
      <p class="eyebrow">Excel file chooser</p>
      <h2>${esc(page.downloadHeading ?? "Download the Excel and CSV Schedule Files")}</h2>
      <p>${esc(
        page.downloadIntro ??
          "Choose the workbook when you want a ready-made planner. Choose CSV when you need raw schedule data for another tool."
      )}</p>
    </div>
    <aside>
      <strong>Pick by job</strong>
      <span>Filter in Excel, import CSV, or switch to the printable PDF after your match list is final.</span>
    </aside>
  </div>
  <div class="excel-file-grid">
    ${excelFiles
      .map(
        (file) => `<article class="excel-file-card">
      <div class="excel-file-top">
        <b>${esc(file.format)}</b>
        <span>${esc(file.badge)}</span>
      </div>
      <h3>${esc(file.label)}</h3>
      <p>${esc(file.task)}</p>
      <dl>
        <div><dt>Best for</dt><dd>${esc(file.bestFor)}</dd></div>
        <div><dt>Works with</dt><dd>${esc(file.worksWith)}</dd></div>
      </dl>
      <ul>
        ${file.includes.map((item) => `<li>${esc(item)}</li>`).join("")}
      </ul>
      <a class="button" href="${attr(file.href)}" download>Download ${esc(file.format)} file</a>
    </article>`
      )
      .join("")}
  </div>
  <div class="excel-download-utility">
    <article>
      <span>Need to print?</span>
      <strong>Use the PDF library after filtering.</strong>
      <a href="/world-cup-2026-schedule-pdf/">Open PDF schedule files</a>
    </article>
    <article>
      <span>Need current browsing?</span>
      <strong>Use the live schedule for timezone and match links.</strong>
      <a href="/world-cup-2026-schedule/">Open live schedule</a>
    </article>
    <article>
      <span>Before decisions</span>
      <strong>Check official updates before travel or ticket purchases.</strong>
      <a href="${attr(officialFifaScheduleUrl)}">Official FIFA schedule</a>
    </article>
  </div>
</section>`;
};

const downloadPanel = (page = {}) => {
  const dataFiles =
    page.slug === "world-cup-2026-schedule-excel"
      ? [...dataDownloadFiles].sort((a, b) => (a.format === "XLS" ? -1 : b.format === "XLS" ? 1 : 0))
      : dataDownloadFiles;
  const pdfFiles =
    page.slug === "world-cup-2026-schedule-pdf"
      ? [...pdfDownloadFiles].sort((a, b) => (a.label === "Printable PDF" ? -1 : b.label === "Printable PDF" ? 1 : 0))
      : pdfDownloadFiles;
  const card = (file) => `<a class="download-card" href="${attr(file.href)}" download>
      <b>${esc(file.format)}</b>
      <strong>${esc(file.label)}</strong>
      <span>${esc(file.description)}</span>
      <dl>
        <div><dt>Best for</dt><dd>${esc(file.bestFor)}</dd></div>
        <div><dt>Includes</dt><dd>${esc(file.includes)}</dd></div>
      </dl>
    </a>`;

  return `<section class="section" id="download-library">
  <h2>${esc(page.downloadHeading ?? "Download schedule files")}</h2>
  <p>${esc(
    page.downloadIntro ??
      "Use these files for offline planning, spreadsheet filtering, trip notes or sharing the tournament calendar with friends."
  )}</p>
  <div class="download-library">
    <div class="download-group">
      <div class="download-group-heading"><h3>Data downloads</h3><span>Structured files</span></div>
      <div class="download-grid">${dataFiles.map(card).join("")}</div>
    </div>
    <div class="download-group">
      <div class="download-group-heading"><h3>PDF schedule library</h3><span>${pdfFiles.length} PDF files</span></div>
      <div class="download-grid">${pdfFiles.map(card).join("")}</div>
    </div>
    ${
      page.slug === "world-cup-2026-schedule-pdf"
        ? `<div class="download-group">
      <div class="download-group-heading"><h3>Visual overview image</h3><span>${visualDownloadFiles.length} PNG file</span></div>
      <div class="download-grid">${visualDownloadFiles.map(card).join("")}</div>
    </div>`
        : ""
    }
  </div>
</section>`;
};

const cityIndexPanel = () => {
  const cities = citySummaries();
  return `<section class="section" id="city-schedule-pages">
  <h2>City schedule pages</h2>
  <p>Open a host city page to see that city's matches, stadium, date range and planning notes.</p>
  <div class="link-grid">
    ${cities
      .map(
        (city) => `<a class="link-card" href="${attr(city.path)}">
      <span>${esc(city.city)}</span>
      <span>${city.matches.length} matches</span>
    </a>`
      )
      .join("")}
  </div>
</section>`;
};

const renderHostCitiesSupportSections = () => `<section class="section host-city-tool-section">
  <div class="tool-section-head">
    <p class="eyebrow">City planning workflow</p>
    <h2>How to Use the World Cup 2026 Schedule Host Cities Hub</h2>
    <p>Move from broad city comparison to a city schedule page, then confirm match details before travel, tickets or broadcast planning.</p>
  </div>
  <div class="utility-card-grid">
    <article><strong>1. Pick a planning angle</strong><span>Use country, match volume, knockout host or late-round presets to narrow the city list.</span></article>
    <article><strong>2. Compare the city card</strong><span>Check match count, stadium, date window, stage mix and first listed match before opening a city page.</span></article>
    <article><strong>3. Open the local schedule</strong><span>Use the city page for fixtures, stadium context, related teams and next planning links.</span></article>
    <article><strong>4. Confirm official details</strong><span>Before booking travel or buying tickets, verify timing, access and ticket information with official sources.</span></article>
  </div>
</section>

<section class="section host-city-tool-section">
  <div class="tool-section-head">
    <p class="eyebrow">Decision guide</p>
    <h2>Which Host City Should You Open First?</h2>
  </div>
  <div class="decision-card-grid">
    <article><span>Following one team</span><strong>Start with the full schedule</strong><p>Filter by team first, then open the cities that appear in that team's route.</p><a href="/world-cup-2026-schedule/">Filter by team</a></article>
    <article><span>Planning a trip</span><strong>Start with match clusters</strong><p>Choose cities with several fixtures or a date window that fits your arrival and departure plan.</p><a href="#city-schedule-pages">Compare cities</a></article>
    <article><span>Watching knockout rounds</span><strong>Start with knockout hosts</strong><p>Use the knockout preset to focus on cities that carry bracket-stage value.</p><a href="#city-schedule-pages">Find knockout hosts</a></article>
    <article><span>Need an offline copy</span><strong>Use PDF or Excel next</strong><p>After choosing a city, save the schedule as a printable PDF or sortable workbook.</p><a href="/world-cup-2026-schedule-pdf/">Open downloads</a></article>
  </div>
</section>

<section class="section host-city-tool-section">
  <div class="tool-section-head">
    <p class="eyebrow">Source and update checks</p>
    <h2>Confirm City Details Before Travel or Tickets</h2>
    <p>The city planner is useful for narrowing choices, but final decisions should be checked against official schedule, ticket and local venue information.</p>
  </div>
  <div class="host-city-source-grid">
    <article>
      <span>Schedule source</span>
      <strong>Full match dates, venues and fixtures</strong>
      <p>Use the FIFA match schedule as the primary reference when a group-stage fixture, knockout round, semifinal, third-place match or final venue affects travel plans.</p>
      <a href="${attr(scheduleMeta.sourceUrl)}">Open FIFA schedule source</a>
    </article>
    <article>
      <span>Ticket decisions</span>
      <strong>Availability can change</strong>
      <p>The city cards do not show ticket inventory. Use them to decide which matches to inspect, then confirm availability through official ticket channels.</p>
      <a href="https://www.fifa.com/tickets">Open FIFA ticket information</a>
    </article>
    <article>
      <span>Local checks</span>
      <strong>Transport, stadium access and timing</strong>
      <p>After choosing a city, check stadium operations, public transport, airport routes and local event guidance close to your travel date.</p>
      <a href="/world-cup-2026-tickets/">Use ticket planning guide</a>
    </article>
  </div>
</section>`;

const faqHtml = (faqs) => `<div class="card"><div class="card-body">
${faqs
  .map(
    ([question, answer]) =>
      `<div class="faq"><h3>${esc(question)}</h3><p>${esc(answer)}</p></div>`
  )
  .join("")}
</div></div>`;

const pageSchema = (page) => {
  const schema = [
    {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.description,
    author: { "@type": "Organization", name: `${site.brand} editorial team` },
    publisher: { "@type": "Organization", name: site.brand },
    mainEntityOfPage: `${site.url}/${page.slug}/`
    },
    {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
    },
    {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: page.h1, item: `${site.url}/${page.slug}/` }
    ]
    }
  ];

  if (page.slug === "world-cup-2026-schedule-pdf") {
    schema.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to choose a World Cup 2026 schedule PDF",
      description:
        "Choose the right World Cup 2026 schedule PDF for printing, quick visual scanning, group-stage planning or knockout-stage planning.",
      step: [
        {
          "@type": "HowToStep",
          name: "Choose the printable PDF for detail",
          text: "Use the full printable PDF when you need match numbers, dates, teams, host cities, stadiums and detail pages in one offline file."
        },
        {
          "@type": "HowToStep",
          name: "Choose the overview poster for scanning",
          text: "Use the one-page overview poster PDF when you want a quick visual matrix of the tournament by host city and date."
        },
        {
          "@type": "HowToStep",
          name: "Choose the stage overview for bracket planning",
          text: "Use the two-page stage overview PDF when you want group-stage fixtures separate from knockout-stage matches."
        },
        {
          "@type": "HowToStep",
          name: "Choose the bracket PDF for knockout routes",
          text: "Use the bracket PDF when you want group-stage fixtures, knockout paths, semifinals, third-place match and final dates in a printable bracket-focused file."
        },
        {
          "@type": "HowToStep",
          name: "Confirm official details",
          text: "Use the PDF library for planning, then verify important travel, ticket and timing decisions with official sources before acting."
        }
      ]
    });
  }

  if (page.slug === "world-cup-2026-schedule-excel") {
    schema.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to use a World Cup 2026 schedule Excel planner",
      description:
        "Use the World Cup 2026 schedule Excel workbook to filter fixtures by team, date, city, stadium and tournament stage.",
      step: [
        {
          "@type": "HowToStep",
          name: "Open the All Matches sheet",
          text: "Start with the complete match list to review match number, date, team, city, stadium, stage and kickoff time fields."
        },
        {
          "@type": "HowToStep",
          name: "Filter by one planning question",
          text: "Choose team, city, date or stage as the first filter so the spreadsheet stays readable."
        },
        {
          "@type": "HowToStep",
          name: "Use CSV for imports",
          text: "Use the CSV file when you want to move the same schedule data into Google Sheets, Airtable, a database or a custom planner."
        },
        {
          "@type": "HowToStep",
          name: "Verify official details",
          text: "Confirm time-sensitive travel, ticket and broadcast decisions with official sources before acting."
        }
      ]
    });
  }

  if (page.slug === "world-cup-2026-schedule-host-cities") {
    schema.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to compare World Cup 2026 schedule host cities",
      description:
        "Use the host city planner to compare countries, stadiums, match windows, knockout value and city-specific schedule pages.",
      step: [
        {
          "@type": "HowToStep",
          name: "Choose a planning angle",
          text: "Start with country, match volume, knockout host, late-round route or cross-border travel needs."
        },
        {
          "@type": "HowToStep",
          name: "Compare city cards",
          text: "Review match count, stadium, date window, stage mix and first listed match before opening a city page."
        },
        {
          "@type": "HowToStep",
          name: "Open the city schedule",
          text: "Use the city-specific schedule page for fixtures, stadium context, related teams and next planning links."
        },
        {
          "@type": "HowToStep",
          name: "Confirm official details",
          text: "Check official schedule, ticket, stadium and local guidance before making paid or time-sensitive decisions."
        }
      ]
    });
  }

  return schema;
};

const renderPage = (page) => {
  const sections =
    page.slug === "world-cup-2026-schedule"
      ? renderScheduleCapabilitySections()
      : page.slug === "world-cup-2026-schedule-pdf"
        ? renderPdfSupportSections()
      : page.slug === "world-cup-2026-schedule-excel"
        ? renderExcelSupportSections()
      : page.slug === "world-cup-2026-schedule-host-cities"
        ? renderHostCitiesSupportSections()
      : page.slug === "world-cup-2026-schedule-groups"
        ? renderGroupsSupportSections()
      : page.sections
          .map(
            ([heading, paragraphs]) => `<section class="section">
  <h2>${esc(heading)}</h2>
  ${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
</section>`
          )
          .join("");

  const scheduleBlock =
    page.slug === "world-cup-2026-schedule" ? renderScheduleTable() : "";
  const downloadsBlock = [
    "world-cup-2026-schedule",
    "world-cup-2026-schedule-pdf",
    "world-cup-2026-schedule-excel"
  ].includes(page.slug)
    ? page.slug === "world-cup-2026-schedule-excel"
      ? renderExcelDownloadSelector(page)
      : downloadPanel(page)
    : "";
  const pdfVisualBlock =
    page.slug === "world-cup-2026-schedule-pdf" ? renderPdfVisualSections() : "";
  const cityBlock = page.slug === "world-cup-2026-schedule-host-cities" ? renderHostCitiesExplorer() : "";
  const sourceNote =
    page.sourceNote ??
    (page.slug === "world-cup-2026-schedule"
      ? `This page is maintained as an independent fixture planner for fans. Sources: FIFA official schedule, structured match data, host city and stadium references. Editorial note: kickoff times, ticket details and broadcast information may change, so confirm paid or time-sensitive decisions with official sources.`
      : `wc26schedule is an independent planning guide. Sources include FIFA official schedule information, official ticket information, host city sites, stadium sites and authorized broadcaster pages where relevant. Editorial note: times, ticket details and broadcaster information may change, so confirm important decisions with official sources.`);
  const overview = page.overview ?? {
    eyebrow: "Guide overview",
    heading: page.intent,
    copy:
      "This guide brings the essential match-planning details into one place, then points you to the next useful step: checking the full schedule, comparing host cities, downloading a planner, reviewing TV options or reading ticket guidance.",
    tags: ["Match planning", "Host city context", "Downloadable tools", "Official-source reminders"],
    noteEyebrow: "Quick note",
    noteHeading: "Use official sources",
    noteCopy:
      "Schedule, ticket and broadcast details can change. Use wc26schedule for planning, then confirm final details with FIFA, official host city pages, stadium sites or authorized broadcasters."
  };
  const usageRows =
    page.usageRows ?? [
      ["Find match details", "Date, kickoff time, teams, city, stadium and stage.", "Use the schedule filters or open a related planning page."],
      ["Plan around a city", "Host city, stadium, travel timing and ticket context.", "Compare host cities before booking travel."],
      ["Save a planner", "PDF, Excel and calendar-friendly schedule options.", "Use the download pages when you need an offline copy."]
    ];
  const excelPlannerBlock =
    page.slug === "world-cup-2026-schedule-excel" ? renderExcelPlanner(overview) : "";

  return layout({
    title: page.title,
    description: page.description,
    canonical: `/${page.slug}/`,
    schema: pageSchema(page),
    titleSuffix: page.titleSuffix,
    body: `${hero({
      eyebrow: page.hero?.eyebrow ?? `${page.nav} guide`,
      h1: page.h1,
      intro: page.intro,
      facts: page.facts,
      variant: page.hero?.variant,
      actions: page.hero?.actions,
      panelTitle: page.hero?.panelTitle,
      panelIntro: page.hero?.panelIntro,
      panelRows: page.hero?.panelRows
    })}
<main class="main">
  ${
    page.slug === "world-cup-2026-schedule-pdf"
      ? renderPdfChooser(overview)
      : page.slug === "world-cup-2026-schedule-excel"
        ? excelPlannerBlock
      : page.slug === "world-cup-2026-schedule-host-cities"
        ? ""
      : `<section class="section">
    <div class="grid">
      <article class="span-8 card"><div class="card-body">
        <p class="eyebrow">${esc(overview.eyebrow)}</p>
        <h2>${esc(overview.heading)}</h2>
        <p>${esc(overview.copy)}</p>
        <ul class="tag-list">
          ${overview.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}
        </ul>
      </div></article>
      <aside class="span-4 card"><div class="card-body">
        <p class="eyebrow">${esc(overview.noteEyebrow)}</p>
        <h3>${esc(overview.noteHeading)}</h3>
        <p>${esc(overview.noteCopy)}</p>
      </div></aside>
    </div>
  </section>`
  }
  ${scheduleBlock}
  ${pdfVisualBlock}
  ${downloadsBlock}
  ${cityBlock}
  ${sections}
  ${
    page.slug === "world-cup-2026-schedule"
      ? renderScheduleNavigation()
      : page.slug === "world-cup-2026-schedule-pdf"
        ? renderPdfUsageCards(page.usageHeading ?? "How to Choose a PDF File", usageRows)
        : `<section class="section">
    <h2>${esc(page.usageHeading ?? "How to use this page")}</h2>
    ${table(usageRows)}
  </section>`
  }
  <section class="section"><h2>${esc(page.relatedHeading ?? "Related planning pages")}</h2>${linkGrid(page.links)}</section>
  <section class="section"><h2>FAQ</h2>${faqHtml(page.faqs)}</section>
  <section class="source-note"><strong>Last updated:</strong> ${updated}. ${esc(sourceNote)}</section>
</main>`
  });
};

const renderScheduleTable = () => {
  const timezoneOptions = [
    ["America/New_York", "Eastern Time"],
    ["America/Los_Angeles", "Pacific Time"],
    ["America/Mexico_City", "Mexico City"],
    ["America/Toronto", "Toronto"],
    ["America/Vancouver", "Vancouver"],
    ["Europe/London", "London"],
    ["Europe/Madrid", "Madrid"],
    ["Europe/Paris", "Paris"],
    ["Africa/Johannesburg", "Johannesburg"],
    ["Asia/Dubai", "Dubai"],
    ["Asia/Kolkata", "India"],
    ["Asia/Shanghai", "China"],
    ["Asia/Tokyo", "Tokyo"],
    ["Australia/Sydney", "Sydney"]
  ];
  const stageOptions = [...new Set(matches.map((match) => match.stage))];
  const groupOptions = [...new Set(matches.map((match) => match.group).filter(Boolean))];
  const cityOptions = [...new Set(matches.map((match) => match.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const teamOptions = [
    ...new Set(matches.flatMap((match) => [match.home, match.away]).filter((team) => team && !team.includes("/") && !team.startsWith("W") && !team.startsWith("2") && !team.startsWith("1") && team !== "TBD"))
  ].sort((a, b) => a.localeCompare(b));
  const matchDataset = (match) => {
    const searchable = [
      match.matchNumber,
      match.stage,
      match.group,
      match.date,
      match.dateLabel,
      match.home,
      match.away,
      match.city,
      match.stadium,
      match.kickoffET
    ]
      .join(" ")
      .toLowerCase();
    return `data-match-number="${attr(match.matchNumber)}" data-stage="${attr(match.stage)}" data-group="${attr(match.group)}" data-date="${attr(match.date)}" data-date-label="${attr(match.dateLabel)}" data-kickoff-utc="${attr(kickoffUtcIso(match))}" data-detail-url="${attr(matchDetailPath(match))}" data-city="${attr(match.city)}" data-home="${attr(match.home)}" data-away="${attr(match.away)}" data-search="${attr(searchable)}"`;
  };

  return `<section class="section schedule-tool" id="full-schedule">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Full schedule table</p>
      <h2>Full World Cup 2026 Match Schedule</h2>
      <p>Use the ${matches.length}-match table to check match number, date, Eastern Time kickoff, teams, stage, group, host city and stadium.</p>
    </div>
    <a class="button light" href="${attr(scheduleMeta.sourceUrl)}">Official source</a>
  </div>
  <section class="schedule-live-board" aria-label="Next World Cup 2026 match">
    <article class="live-next-match">
      <div>
        <p class="eyebrow">Next match</p>
        <h3><span data-next-home>Loading</span> <span>vs</span> <span data-next-away>Loading</span></h3>
        <p data-next-meta>Choose a timezone to calculate the next kickoff.</p>
        <a data-next-detail href="#full-schedule">Match details -></a>
      </div>
      <div class="countdown-grid" aria-label="Countdown to next kickoff">
        <div><strong data-next-days>--</strong><span>Days</span></div>
        <div><strong data-next-hours>--</strong><span>Hours</span></div>
        <div><strong data-next-minutes>--</strong><span>Min</span></div>
        <div><strong data-next-seconds>--</strong><span>Sec</span></div>
      </div>
    </article>
    <div class="upcoming-board-head">
      <div>
        <h3>Upcoming matches</h3>
        <p data-upcoming-scope>Showing the next matches from the full schedule.</p>
      </div>
      <div class="upcoming-board-controls" aria-label="Upcoming match controls">
        <span data-upcoming-range>Loading matches</span>
        <button type="button" data-upcoming-prev aria-label="Show previous upcoming matches">Prev</button>
        <button type="button" data-upcoming-next aria-label="Show next upcoming matches">Next</button>
        <button type="button" data-upcoming-view-all>View all</button>
      </div>
    </div>
    <div class="upcoming-match-grid" data-upcoming-rail></div>
  </section>
  <div class="filters" aria-label="Schedule filters">
    <label>Search
      <input data-filter-search type="search" placeholder="Team, match number, stage">
    </label>
    <label>Stage
      <select data-filter-stage>
        <option value="">All stages</option>
        ${stageOptions.map((stage) => `<option value="${attr(stage)}">${esc(stage)}</option>`).join("")}
      </select>
    </label>
    <label>Group
      <select data-filter-group>
        <option value="">All groups</option>
        ${groupOptions.map((group) => `<option value="${attr(group)}">Group ${esc(group)}</option>`).join("")}
      </select>
    </label>
    <label>Local date
      <select data-filter-date>
        <option value="">All local dates</option>
      </select>
    </label>
    <label>City
      <select data-filter-city>
        <option value="">All cities</option>
        ${cityOptions.map((city) => `<option value="${attr(city)}">${esc(city)}</option>`).join("")}
      </select>
    </label>
    <label>Team
      <select data-filter-team>
        <option value="">All teams</option>
        ${teamOptions.map((team) => `<option value="${attr(team)}">${esc(team)}</option>`).join("")}
      </select>
    </label>
  </div>
  <div class="timezone-tool" aria-label="Timezone planner">
    <div>
      <p class="eyebrow">Timezone planner</p>
      <strong>Your match times update the table and date cards.</strong>
      <p data-timezone-summary>Choose a timezone to see local kickoff times, local dates and watch-time labels.</p>
    </div>
    <label>Your timezone
      <select data-timezone-select>
        ${timezoneOptions.map(([value, label]) => `<option value="${attr(value)}">${esc(label)}</option>`).join("")}
      </select>
    </label>
  </div>
  <div class="schedule-insight-row" aria-label="Schedule reading guide">
    <div class="insight-card live-time-card">
      <span>Current local time</span>
      <strong data-current-time>Loading time...</strong>
    </div>
    <div class="insight-card next-match-card">
      <span>Next match countdown</span>
      <strong data-next-countdown>Calculating next kickoff...</strong>
      <small data-next-match-label>Based on your selected timezone.</small>
    </div>
    <div class="insight-card">
      <span>Local date logic</span>
      <strong data-local-date-range>Dates follow your selected timezone.</strong>
    </div>
    <div class="insight-card insight-wide">
      <span>Watch windows</span>
      <div class="watch-legend" aria-label="Watch-time label meanings">
        <span class="watch-tag" data-watch-type="morning">Morning</span>
        <span class="watch-tag" data-watch-type="afternoon">Afternoon</span>
        <span class="watch-tag" data-watch-type="prime">Prime time</span>
        <span class="watch-tag" data-watch-type="late">Late night</span>
        <span class="watch-tag" data-watch-type="overnight">Overnight</span>
      </div>
    </div>
    <button class="clear-filter-button" type="button" data-clear-filters>Clear filters</button>
  </div>
  <div class="view-switcher" id="schedule-views" role="tablist" aria-label="Schedule view">
    <button class="view-tab active" type="button" role="tab" aria-selected="true" data-view-toggle="table">Table</button>
    <button class="view-tab" type="button" role="tab" aria-selected="false" data-view-toggle="date">Date cards</button>
    <button class="view-tab" type="button" role="tab" aria-selected="false" data-view-toggle="team">Team</button>
    <button class="view-tab" type="button" role="tab" aria-selected="false" data-view-toggle="city">City</button>
  </div>
  <div class="schedule-result-bar">
    <div>
      <p class="schedule-count"><span data-schedule-count>${matches.length}</span> matches shown</p>
      <div class="active-filter-list" data-active-filters aria-label="Active filters"></div>
    </div>
    <p data-active-context>Times use your selected timezone. Source ET remains visible for verification.</p>
  </div>
  <div class="table-wrap schedule-table-wrap" data-schedule-view="table">
    <table class="schedule-table">
      <thead>
        <tr>
          <th>Match</th>
          <th>Stage</th>
          <th>Group</th>
          <th>Teams</th>
          <th>Your Time</th>
          <th>Watch Window</th>
          <th>Source Time</th>
          <th>Source Date</th>
          <th>City</th>
          <th>Stadium</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${matches
          .map((match) => {
            return `<tr data-match-row ${matchDataset(match)}>
          <td id="match-${attr(match.matchNumber)}"><strong>${match.matchNumber}</strong></td>
          <td>${esc(match.stage)}</td>
          <td>${match.group ? `Group ${esc(match.group)}` : "-"}</td>
          <td>${matchupHtml(match.home, match.away)}</td>
          <td><span data-local-time>Choose timezone</span></td>
          <td><span class="watch-tag" data-watch-tag>Time check</span></td>
          <td>${esc(match.kickoffET)} ET</td>
          <td>${esc(match.date)}</td>
          <td><a href="${attr(cityPath(match.citySlug))}">${esc(match.city)}</a></td>
          <td>${esc(match.stadium)}</td>
          <td><a href="${attr(matchDetailPath(match))}">Match details</a></td>
        </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>
  <div class="date-card-view" data-schedule-view="date" hidden></div>
  <div class="team-view aggregate-view" data-schedule-view="team" hidden></div>
  <div class="city-view aggregate-view" data-schedule-view="city" hidden></div>
  <div class="schedule-empty" data-empty-state hidden>
    <strong>No matches found</strong>
    <p>Try a broader local date, city, team or stage filter.</p>
    <button class="button light" type="button" data-clear-filters>Clear filters</button>
  </div>
  <p class="source-note inline-note"><strong>Data note:</strong> ${esc(scheduleMeta.note)} Primary source: <a href="${attr(scheduleMeta.sourceUrl)}">${esc(scheduleMeta.sourceLabel)}</a>. Mapping source: <a href="${attr(scheduleMeta.mappingSourceUrl)}">${esc(scheduleMeta.mappingSourceLabel)}</a>. Decorative flag images use country and region SVG assets.</p>
</section>`;
};

const renderHome = () =>
  layout({
    title: "World Cup 2026 Schedule Hub",
    description: site.description,
    canonical: "/",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.brand,
        url: site.url,
        description: site.description
      }
    ],
    body: `${hero({
      eyebrow: "World Cup 2026 schedule hub",
      h1: "wc26schedule",
      intro:
        "Plan the tournament by date, team, city, stadium, TV schedule, ticket guide and downloadable tools for worldcup2026schedule.net.",
      facts: [
        ["Brand", site.brand],
        ["Domain", site.domain],
        ["Core tool", "Full match schedule"]
      ]
    })}
<main class="main">
  <section class="section">
    <div class="grid">
      <div class="span-8 card"><div class="card-body">
        <p class="eyebrow">Execution focus</p>
        <h2>Build the schedule first, then expand into tools and long-tail pages.</h2>
        <p>wc26schedule starts with the full match schedule, then connects users to PDF, Excel, groups, host cities, TV and tickets pages. City and team pages become the next layer once the core planning tools are stable.</p>
        <div class="section-actions">
          <a class="button" href="/world-cup-2026-schedule/">View schedule page</a>
          <a class="button light" href="/world-cup-2026-tickets/">Review ticket guide</a>
        </div>
      </div></div>
      <div class="span-4 card"><div class="card-body">
        <p class="eyebrow">Planning tools</p>
        <h3>Schedule, PDF and Excel</h3>
        <p>The site is built around practical planning: browse the full schedule, filter matches, compare host cities, and use downloadable tools as they are added.</p>
      </div></div>
    </div>
  </section>
  <section class="section">
    <h2>MVP page map</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Page</th><th>URL</th><th>Main use</th><th>Status</th></tr></thead>
      <tbody>
        ${pages
          .slice(0, 8)
          .map(
            (page) =>
              `<tr><td>${esc(page.nav)}</td><td><a href="/${page.slug}/">/${page.slug}/</a></td><td>${esc(page.intent)}</td><td>MVP</td></tr>`
          )
          .join("")}
      </tbody>
    </table></div>
  </section>
</main>`
  });

const write = async (relative, content) => {
  const target = join(dist, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
};

const redirectPage = (target) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=${attr(target)}">
  <link rel="canonical" href="${attr(site.url + target)}">
  <title>Redirecting</title>
</head>
<body>
  <p>Redirecting to <a href="${attr(target)}">${esc(target)}</a>.</p>
</body>
</html>`;

const scheduleHeaders = [
  "Match #",
  "Date",
  "Day",
  "Kickoff ET",
  "Kickoff UTC",
  "Venue local time",
  "Stage",
  "Group",
  "Team 1",
  "Team 1 code",
  "Team 2",
  "Team 2 code",
  "City",
  "Host country",
  "Stadium",
  "City slug",
  "Match detail URL",
  "Source status"
];

const cityMeta = {
  "Mexico City": { country: "Mexico", localOffsetHours: -6 },
  Guadalajara: { country: "Mexico", localOffsetHours: -6 },
  Monterrey: { country: "Mexico", localOffsetHours: -6 },
  Toronto: { country: "Canada", localOffsetHours: -4 },
  Vancouver: { country: "Canada", localOffsetHours: -7 },
  "New York New Jersey": { country: "United States", localOffsetHours: -4 },
  "Los Angeles": { country: "United States", localOffsetHours: -7 },
  "San Francisco Bay Area": { country: "United States", localOffsetHours: -7 },
  Seattle: { country: "United States", localOffsetHours: -7 },
  Dallas: { country: "United States", localOffsetHours: -5 },
  Houston: { country: "United States", localOffsetHours: -5 },
  "Kansas City": { country: "United States", localOffsetHours: -5 },
  Atlanta: { country: "United States", localOffsetHours: -4 },
  Miami: { country: "United States", localOffsetHours: -4 },
  Boston: { country: "United States", localOffsetHours: -4 },
  Philadelphia: { country: "United States", localOffsetHours: -4 }
};

const cityRegionMeta = {
  Atlanta: { region: "East", label: "Eastern USA", travel: "Southeast travel base" },
  Boston: { region: "East", label: "Eastern USA", travel: "Northeast rail and airport base" },
  Dallas: { region: "Central", label: "Central USA", travel: "Central high-volume base" },
  Guadalajara: { region: "Mexico", label: "Mexico", travel: "Mexico route with local venue checks" },
  Houston: { region: "Central", label: "Central USA", travel: "Texas match base" },
  "Kansas City": { region: "Central", label: "Central USA", travel: "Central USA knockout stop" },
  "Los Angeles": { region: "West", label: "Western USA", travel: "West Coast stadium route" },
  "Mexico City": { region: "Mexico", label: "Mexico", travel: "Opening-match and Mexico travel anchor" },
  Miami: { region: "East", label: "Eastern USA", travel: "Florida late-tournament route" },
  Monterrey: { region: "Mexico", label: "Mexico", travel: "Northern Mexico match base" },
  "New York New Jersey": { region: "East", label: "Eastern USA", travel: "Tournament finish anchor" },
  Philadelphia: { region: "East", label: "Eastern USA", travel: "Northeast match base" },
  "San Francisco Bay Area": { region: "West", label: "Western USA", travel: "Bay Area match base" },
  Seattle: { region: "West", label: "Western USA", travel: "Pacific Northwest route" },
  Toronto: { region: "Canada", label: "Canada", travel: "Eastern Canada match base" },
  Vancouver: { region: "Canada", label: "Canada", travel: "Western Canada match base" }
};

const formatTime = (date) =>
  `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;

const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

const matchView = (match) => {
  const [hour, minute] = match.kickoffET.split(":").map(Number);
  const etAsUtcClock = new Date(`${match.date}T00:00:00Z`);
  etAsUtcClock.setUTCHours(hour, minute, 0, 0);
  const utc = addHours(etAsUtcClock, 4);
  const meta = cityMeta[match.city] ?? { country: "", localOffsetHours: -4 };
  const local = addHours(utc, meta.localOffsetHours);

  return {
    "Match #": match.matchNumber,
    Date: match.date,
    Day: match.dateLabel,
    "Kickoff ET": match.kickoffET,
    "Kickoff UTC": `${utc.toISOString().slice(0, 10)} ${formatTime(utc)}`,
    "Venue local time": `${local.toISOString().slice(0, 10)} ${formatTime(local)}`,
    Stage: match.stage,
    Group: match.group || "",
    "Team 1": match.home,
    "Team 1 code": teamCode(match.home),
    "Team 2": match.away,
    "Team 2 code": teamCode(match.away),
    City: match.city,
    "Host country": meta.country,
    Stadium: match.stadium,
    "City slug": match.citySlug,
    "Match detail URL": `${site.url}${matchDetailPath(match)}`,
    "Source status": match.sourceStatus
  };
};

const citySummaries = () => {
  const groups = new Map();
  for (const match of matches) {
    const path = cityPath(match.citySlug);
    const meta = cityMeta[match.city] ?? { country: "" };
    const current = groups.get(match.city) ?? {
      city: match.city,
      country: meta.country,
      region: cityRegionMeta[match.city]?.region ?? meta.country,
      regionLabel: cityRegionMeta[match.city]?.label ?? meta.country,
      travelFit: cityRegionMeta[match.city]?.travel ?? "Host city match base",
      citySlug: match.citySlug,
      path,
      matches: [],
      stadiums: new Set(),
      stages: new Set(),
      teams: new Set()
    };
    current.matches.push(match);
    current.stadiums.add(match.stadium);
    current.stages.add(match.stage);
    current.teams.add(match.home);
    current.teams.add(match.away);
    groups.set(match.city, current);
  }

  return [...groups.values()]
    .map((city) => ({
      ...city,
      matches: city.matches.sort((a, b) => a.date.localeCompare(b.date) || a.kickoffET.localeCompare(b.kickoffET)),
      stadiums: [...city.stadiums].sort((a, b) => a.localeCompare(b)),
      stages: [...city.stages].sort((a, b) => a.localeCompare(b)),
      teams: [...city.teams].sort((a, b) => a.localeCompare(b)),
      firstDate: city.matches.map((match) => match.date).sort()[0],
      lastDate: city.matches.map((match) => match.date).sort().at(-1)
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
};

const shortDate = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00Z`));

const cityDateWindow = (city) => `${shortDate(city.firstDate)}-${shortDate(city.lastDate)}`;

const cityStageSummary = (city) => {
  const stageCounts = new Map();
  for (const match of city.matches) stageCounts.set(match.stage, (stageCounts.get(match.stage) ?? 0) + 1);
  return [...stageCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([stage, count]) => `${stage}: ${count}`);
};

const cityImagePath = (city) =>
  `/assets/cities/world-cup-2026-schedule-host-cities-${citySlugOverrides[city.citySlug] ?? city.citySlug}.jpg`;

const cityCapacity = {
  Atlanta: "71,000 seats",
  Boston: "65,878 seats",
  Dallas: "80,000 seats",
  Guadalajara: "48,071 seats",
  Houston: "72,220 seats",
  "Kansas City": "76,416 seats",
  "Los Angeles": "70,240 seats",
  "Mexico City": "87,523 seats",
  Miami: "64,767 seats",
  Monterrey: "53,500 seats",
  "New York New Jersey": "82,500 seats",
  Philadelphia: "69,879 seats",
  "San Francisco Bay Area": "68,500 seats",
  Seattle: "69,000 seats",
  Toronto: "45,500 seats",
  Vancouver: "54,500 seats"
};

const cityStageRank = (stage) =>
  ({
    Final: 7,
    "Bronze final": 6,
    "Semi-finals": 5,
    "Quarter-finals": 4,
    "Round of 16": 3,
    "Round of 32": 2,
    "Group stage": 1
  })[stage] ?? 0;

const cityFeaturedMatch = (city) =>
  [...city.matches].sort(
    (a, b) =>
      cityStageRank(b.stage) - cityStageRank(a.stage) ||
      Number(a.matchNumber) - Number(b.matchNumber)
  )[0];

const cityValueTags = (city) => {
  const knockoutCount = city.matches.filter((match) => match.stage !== "Group stage").length;
  const tags = [];
  if (city.matches.some((match) => match.matchNumber === 104)) tags.push("Final host");
  if (city.matches.some((match) => match.matchNumber === 1)) tags.push("Opening match");
  if (city.matches.some((match) => match.stage === "Semi-finals")) tags.push("Semifinal route");
  if (city.matches.some((match) => match.stage === "Bronze final")) tags.push("Third-place match");
  if (city.matches.length >= 8) tags.push("8+ matches");
  if (knockoutCount > 0) tags.push(`${knockoutCount} knockout`);
  if (city.country !== "United States") tags.push(city.country);
  if (!tags.length) tags.push(city.regionLabel);
  return tags.slice(0, 4);
};

const cityPlanningFit = (city) => {
  const hasFinal = city.matches.some((match) => match.matchNumber === 104);
  const hasOpening = city.matches.some((match) => match.matchNumber === 1);
  const knockoutCount = city.matches.filter((match) => match.stage !== "Group stage").length;
  if (hasFinal) return "Championship-week anchor for fans planning the tournament finish.";
  if (hasOpening) return "Opening-match anchor with early tournament demand.";
  if (city.matches.length >= 9) return "High-volume base for comparing several match days in one market.";
  if (knockoutCount >= 2) return "Strong knockout route for fans following the bracket.";
  if (city.country !== "United States") return "Cross-border planning stop with country-specific travel checks.";
  return "Focused city schedule for checking stadium, date window and stage mix.";
};

const cityRouteBadge = (city) => {
  if (city.matches.some((match) => match.matchNumber === 104)) return "Final host";
  if (city.matches.some((match) => match.matchNumber === 1)) return "Opening match";
  if (city.matches.some((match) => match.stage === "Semi-finals")) return "Semifinal route";
  if (city.matches.some((match) => match.stage === "Bronze final")) return "Third-place";
  if (city.region === "West") return "West route";
  if (city.country !== "United States") return city.country;
  if (city.matches.length >= 8) return "8+ matches";
  return city.regionLabel;
};

const cityGuideMeta = {
  Atlanta: {
    lead: "Atlanta is one of the strongest knockout-route choices because its schedule combines a heavy group-stage base with a semifinal date. The city page is useful when you want to compare several early fixtures and still keep a late-tournament path in view.",
    planningAngle: "Use Atlanta when your trip depends on both match volume and a possible semifinal anchor.",
    stadiumNote: "Mercedes-Benz Stadium sits in a major downtown event district, so stadium access, nearby hotel demand and event-day transport planning should be checked early.",
    travelNote: "Atlanta works best as a Southeast base with strong air connectivity and several match days to compare before choosing tickets.",
    ticketNote: "Prioritize the semifinal and any team-specific group fixtures first, then use the full schedule to check whether nearby dates justify a longer stay."
  },
  Boston: {
    lead: "Boston gives fans a Northeast route with eight matches and a strong knockout mix. The page is built for users comparing New England travel, stadium access and whether the city can work as part of a Boston-New York-Philadelphia corridor.",
    planningAngle: "Use Boston when you want an Eastern USA base with several stages but do not need the final itself.",
    stadiumNote: "Gillette Stadium is outside central Boston, so local transport, ride timing and post-match return plans matter more than they would in a downtown venue.",
    travelNote: "Boston pairs naturally with other Northeast city pages if you are comparing rail, flight and hotel options across multiple host markets.",
    ticketNote: "Check the knockout dates before booking flexible travel, because those fixtures may become more valuable once the bracket is known."
  },
  Dallas: {
    lead: "Dallas is one of the highest-volume World Cup 2026 host cities, with nine matches and a major late-round role. It is a practical page for fans who want the most fixture choice in one market and need to compare date windows before committing to tickets.",
    planningAngle: "Use Dallas when match quantity, knockout options and a central travel base are the main planning questions.",
    stadiumNote: "AT&T Stadium is a large event venue in the Arlington area, so parking, shuttle guidance and stadium-entry rules should be checked close to match day.",
    travelNote: "Dallas can work as a hub for fans who want several matches without changing cities, especially if hotel and transport plans are made around stadium distance.",
    ticketNote: "Start with the semifinal and other knockout fixtures, then decide whether group-stage dates make the trip worth extending."
  },
  Guadalajara: {
    lead: "Guadalajara is a focused Mexico host city with a compact group-stage schedule. This page is most useful for fans comparing Mexico-based fixtures, local stadium logistics and cross-border planning questions before opening team or match pages.",
    planningAngle: "Use Guadalajara when your priority is a Mexico fixture stop rather than a long multi-stage tournament route.",
    stadiumNote: "Estadio Akron planning should include local arrival timing, stadium access guidance and official venue instructions as the tournament approaches.",
    travelNote: "Guadalajara is best compared with Mexico City and Monterrey if you want a Mexico-only route or need country-specific travel checks.",
    ticketNote: "Because the city has fewer matches, choose by team interest first, then confirm whether the date works with nearby Mexico fixtures."
  },
  Houston: {
    lead: "Houston offers a Texas match base with seven fixtures and multiple knockout dates. The page helps fans compare whether Houston is a better fit than Dallas when stadium access, travel distance and specific teams are more important than total match count.",
    planningAngle: "Use Houston when you want a Texas schedule with knockout value but a different date window from Dallas.",
    stadiumNote: "NRG Stadium is a major event venue, so event-day traffic, parking rules and public transport updates should be confirmed before booking tight transfers.",
    travelNote: "Houston is useful for fans comparing Texas match clusters, especially if flights and hotels make one city more practical than another.",
    ticketNote: "Look at the Round of 16 and Round of 32 fixtures first, then use the city table to see whether group matches add value."
  },
  "Kansas City": {
    lead: "Kansas City is a compact central route with six matches and two knockout fixtures. This page works well when you want a smaller host market, a clear date window and a schedule that still includes bracket-stage value.",
    planningAngle: "Use Kansas City when you want a central USA stop with a manageable match list and knockout upside.",
    stadiumNote: "GEHA Field at Arrowhead Stadium planning should include official parking, gate and local arrival instructions because stadium-site logistics can shape the match-day experience.",
    travelNote: "Kansas City is best used as a targeted stop rather than a full tournament base, especially for fans following teams that land in the city.",
    ticketNote: "Compare the early group match with later knockout possibilities before deciding whether one ticket or a longer stay makes sense."
  },
  "Los Angeles": {
    lead: "Los Angeles is a top high-volume city with nine matches, a semifinal and a West Coast route. The page is valuable for fans comparing multiple match days, stadium access around SoFi Stadium and whether Los Angeles should anchor a longer Western USA trip.",
    planningAngle: "Use Los Angeles when you want maximum match choice on the West Coast with late-round value.",
    stadiumNote: "SoFi Stadium sits in a large event district, so airport choice, local traffic, ride timing and stadium-entry guidance should be planned with extra margin.",
    travelNote: "Los Angeles pairs naturally with San Francisco Bay Area and Seattle for fans comparing a Western USA route across several host cities.",
    ticketNote: "Treat the semifinal as the premium planning point, then use the remaining match dates to decide whether to stay for several fixtures."
  },
  "Mexico City": {
    lead: "Mexico City is the opening-match anchor and one of the most important city pages for early tournament planning. It helps fans compare the first match, Mexico-based group fixtures and the local stadium context before moving into team or ticket decisions.",
    planningAngle: "Use Mexico City when your planning starts with the tournament opener or a Mexico-focused route.",
    stadiumNote: "Estadio Banorte has unique event demand around the opening match, so official stadium guidance, entry timing and local transport updates should be checked carefully.",
    travelNote: "Mexico City should be compared with Guadalajara and Monterrey if your trip is built around Mexico venues and country-specific travel requirements.",
    ticketNote: "Opening-match tickets and early fixtures may drive higher demand, so confirm official ticket information before making travel commitments."
  },
  Miami: {
    lead: "Miami is a late-tournament route city with seven matches, including the third-place match. This page is useful when your priority is knockout football, warm-weather travel planning and comparing Florida's date window against other Eastern USA cities.",
    planningAngle: "Use Miami when third-place match timing or a Florida-based knockout route matters most.",
    stadiumNote: "Hard Rock Stadium is a major event venue outside the densest tourist areas, so transport time, traffic and local event guidance should be part of the plan.",
    travelNote: "Miami works best for fans who want a clear late-stage target or a trip that combines football with extra travel days.",
    ticketNote: "Start with the third-place match and knockout rounds, then check whether earlier group fixtures are worth adding."
  },
  Monterrey: {
    lead: "Monterrey provides a Northern Mexico match stop with a compact four-match schedule. It is best for fans who already know a team or date they want and need a quick way to confirm the local fixture list, stadium and travel context.",
    planningAngle: "Use Monterrey when you want a focused Mexico stop rather than a broad multi-city comparison.",
    stadiumNote: "Estadio BBVA planning should include official access instructions and local traffic guidance because fewer fixtures mean each event day matters more.",
    travelNote: "Monterrey should be compared with Mexico City and Guadalajara when choosing between Mexico host cities.",
    ticketNote: "Because the match count is compact, start from the team matchup and then decide whether the date fits your wider route."
  },
  "New York New Jersey": {
    lead: "New York New Jersey is the championship-week anchor because it hosts the World Cup 2026 final and several earlier fixtures. The page is designed for fans comparing the tournament finish, Northeast travel and whether to combine the final with other regional city pages.",
    planningAngle: "Use New York New Jersey when the final, late-round planning or a Northeast route is your main focus.",
    stadiumNote: "MetLife Stadium planning should include official event-day transport, stadium-entry rules and extra time for very high-demand matches.",
    travelNote: "New York New Jersey pairs with Boston and Philadelphia for fans comparing a Northeast corridor instead of a single-city trip.",
    ticketNote: "Treat the final as the anchor decision, then use earlier fixtures to decide whether a longer stay is worthwhile."
  },
  Philadelphia: {
    lead: "Philadelphia gives fans a Northeast city page with six matches and one knockout fixture. It is useful for comparing a focused match stop with nearby New York New Jersey and Boston pages before choosing a travel corridor.",
    planningAngle: "Use Philadelphia when you want a Northeast schedule without relying only on the final-host market.",
    stadiumNote: "Lincoln Financial Field sits in a major sports complex, so parking, transit and event-entry details should be checked against official venue guidance.",
    travelNote: "Philadelphia works well as a regional comparison page for fans weighing shorter stays, nearby airports and possible multi-city movement.",
    ticketNote: "Start with the Round of 16 fixture, then compare group-stage dates against your team interests."
  },
  "San Francisco Bay Area": {
    lead: "San Francisco Bay Area is a West Coast page for fans comparing Bay Area fixtures, stadium travel and whether a California route should include Los Angeles as well. The schedule is focused but still includes a knockout match.",
    planningAngle: "Use San Francisco Bay Area when you want a West Coast stop with a clear stadium and date window.",
    stadiumNote: "Levi's Stadium is in Santa Clara, so distance from San Francisco, local rail options, driving time and official stadium operations should be planned before match day.",
    travelNote: "The Bay Area pairs naturally with Los Angeles and Seattle if you are comparing a Western USA football trip.",
    ticketNote: "Check the Round of 32 match first, then decide whether group-stage fixtures justify a longer local stay."
  },
  Seattle: {
    lead: "Seattle is a Pacific Northwest route with six matches and two knockout fixtures. The page helps fans compare a concentrated West Coast schedule with stadium access, date windows and possible links to Vancouver or San Francisco Bay Area.",
    planningAngle: "Use Seattle when you want a Pacific Northwest base with knockout value and cross-border comparison potential.",
    stadiumNote: "Lumen Field is close to central Seattle, but official guidance for gates, crowd movement and event-day transport should still be checked close to the match.",
    travelNote: "Seattle is especially useful when paired with Vancouver for fans considering a regional route across the United States and Canada.",
    ticketNote: "Prioritize knockout fixtures first, then use group-stage dates to see whether the trip should be extended."
  },
  Toronto: {
    lead: "Toronto is an Eastern Canada schedule page with six matches and a Round of 32 fixture. It is useful for fans comparing Canadian host cities, border documents and whether Toronto or Vancouver better matches a team route.",
    planningAngle: "Use Toronto when Canada-based planning, Eastern Canada access or a Round of 32 fixture is important.",
    stadiumNote: "BMO Field planning should include official stadium access, local transit guidance and border-aware travel timing for international fans.",
    travelNote: "Toronto is best compared with Vancouver and nearby Eastern USA cities when building a cross-border route.",
    ticketNote: "Check whether a team you follow appears in Toronto before using the knockout fixture as the anchor."
  },
  Vancouver: {
    lead: "Vancouver is a Western Canada host city with six matches and a Round of 32 fixture. The page is useful when fans are weighing Canada-based travel, Pacific Northwest routes and whether to connect Vancouver with Seattle.",
    planningAngle: "Use Vancouver when you want Western Canada fixtures or a cross-border route with Seattle.",
    stadiumNote: "BC Place planning should include official entry rules, downtown crowd movement and local transport updates before match day.",
    travelNote: "Vancouver works best as a Canada-West comparison page, especially for fans considering Seattle on the same trip.",
    ticketNote: "Start with the Round of 32 date, then compare group fixtures by team interest and travel timing."
  }
};

const cityGuide = (city) =>
  cityGuideMeta[city.city] ?? {
    lead: `${city.city} is a World Cup 2026 host city with a local schedule that should be reviewed by match date, stadium and stage before travel or ticket decisions.`,
    planningAngle: `Use ${city.city} when its date window, teams and stadium location fit your tournament route.`,
    stadiumNote: `Confirm ${city.stadiums.join(", ")} access, gates and local operations with official sources before match day.`,
    travelNote: `Compare ${city.city} with nearby host cities before booking hotels or flights.`,
    ticketNote: "Confirm official ticket availability and match details before making paid decisions."
  };

const renderFeaturedCityCards = (cities) => {
  const featuredOrder = [
    "New York New Jersey",
    "Los Angeles",
    "Miami",
    "Dallas",
    "Atlanta",
    "Mexico City",
    "Toronto",
    "Vancouver",
    "Seattle",
    "San Francisco Bay Area",
    "Boston",
    "Philadelphia",
    "Houston",
    "Kansas City",
    "Guadalajara",
    "Monterrey"
  ];
  const featured = featuredOrder
    .map((name) => cities.find((city) => city.city === name))
    .filter(Boolean);

  return `<div class="featured-city-strip" aria-label="Featured World Cup 2026 host city guides">
    ${featured
      .map(
        (city) => `<article class="featured-city-card">
      <img src="${attr(cityImagePath(city))}" alt="${attr(`${city.city} World Cup 2026 host city schedule guide`)}" loading="lazy">
      <div class="featured-city-shade"></div>
      <div class="featured-city-content">
        <span>${esc(cityRouteBadge(city))}</span>
        <h3>${esc(city.city)}</h3>
        <p>${esc(city.stadiums.join(", "))}</p>
        <small>${city.matches.length} matches - ${esc(cityCapacity[city.city] ?? "Venue capacity listed by stadium")}</small>
        <a href="${attr(city.path)}">Open city guide -&gt;</a>
      </div>
    </article>`
      )
      .join("")}
  </div>`;
};

const renderHostCitiesExplorer = () => {
  const cities = citySummaries();
  const countries = [...new Set(cities.map((city) => city.country))].sort((a, b) => a.localeCompare(b));
  const regions = [...new Map(cities.map((city) => [city.region, city.regionLabel])).entries()].sort((a, b) =>
    a[1].localeCompare(b[1])
  );
  const totalMatches = matches.length;
  const maxMatches = Math.max(...cities.map((city) => city.matches.length));
  const knockoutHosts = cities.filter((city) => city.matches.some((match) => match.stage !== "Group stage")).length;
  const firstDate = cities.map((city) => city.firstDate).sort()[0];
  const lastDate = cities.map((city) => city.lastDate).sort().at(-1);
  const topCities = [...cities]
    .sort((a, b) => b.matches.length - a.matches.length || a.city.localeCompare(b.city))
    .slice(0, 5);
  const finalWeekCities = cities.filter((city) => city.matches.some((match) => match.date >= "2026-07-13"));
  const westernCities = cities.filter((city) => city.region === "West");
  const compareCards = [
    {
      label: "Most matches",
      title: topCities.slice(0, 3).map((city) => city.city).join(", "),
      copy: "Start here when your priority is more fixtures in one market.",
      action: "Show most matches",
      preset: "high-volume"
    },
    {
      label: "Knockout route",
      title: cities
        .filter((city) => city.matches.some((match) => match.stage === "Semi-finals" || match.stage === "Final"))
        .map((city) => city.city)
        .join(", "),
      copy: "Use this path when late-round fixtures matter more than group volume.",
      action: "Show knockout hosts",
      preset: "knockout"
    },
    {
      label: "Canada and Mexico",
      title: cities.filter((city) => city.country !== "United States").map((city) => city.city).join(", "),
      copy: "Compare cross-border cities separately before checking documents, flights and local guidance.",
      action: "Show cross-border",
      preset: "cross-border"
    },
    {
      label: "West route",
      title: westernCities.map((city) => city.city).join(", "),
      copy: "Scan the Pacific-side route when travel time zones and west-coast airports matter.",
      action: "Show west route",
      region: "West"
    }
  ];

  const card = (city) => {
    const knockoutCount = city.matches.filter((match) => match.stage !== "Group stage").length;
    const firstMatch = city.matches[0];
    const featuredMatch = cityFeaturedMatch(city);
    const sampleTeams = city.teams.filter(isRealTeam).slice(0, 4);
    return `<article class="host-city-card" data-city-card data-country="${attr(city.country)}" data-region="${attr(city.region)}" data-match-count="${city.matches.length}" data-knockout="${knockoutCount}" data-final-week="${city.matches.some((match) => match.date >= "2026-07-13") ? "true" : "false"}" data-first-date="${attr(city.firstDate)}" data-search="${attr(`${city.city} ${city.country} ${city.regionLabel} ${city.stadiums.join(" ")} ${city.stages.join(" ")} ${city.teams.join(" ")}`.toLowerCase())}">
      <div class="host-city-card-top">
        <div>
          <span class="city-country">${esc(city.country)}</span>
          <h3>${esc(city.city)}</h3>
          <p>${esc(city.stadiums.join(", "))}</p>
        </div>
        <strong>${city.matches.length}<span>matches</span></strong>
      </div>
      <dl class="host-city-stats">
        <div><dt>Date window</dt><dd>${esc(cityDateWindow(city))}</dd></div>
        <div><dt>Knockout</dt><dd>${knockoutCount}</dd></div>
        <div><dt>Stages</dt><dd>${city.stages.length}</dd></div>
      </dl>
      <div class="stage-chip-row">
        ${cityStageSummary(city)
          .map((stage) => `<span>${esc(stage)}</span>`)
          .join("")}
      </div>
      <p class="city-fit">${esc(cityPlanningFit(city))}</p>
      <div class="city-next-match">
        <span>First listed match</span>
        <strong>#${firstMatch.matchNumber} ${esc(firstMatch.home)} vs ${esc(firstMatch.away)}</strong>
          <small>${esc(firstMatch.dateLabel)} at ${esc(firstMatch.kickoffET)} ET</small>
      </div>
      <div class="city-featured-match">
        <span>Planning highlight</span>
        <strong>#${featuredMatch.matchNumber} ${esc(featuredMatch.stage)}</strong>
        <small>${esc(featuredMatch.home)} vs ${esc(featuredMatch.away)} - ${esc(featuredMatch.dateLabel)}</small>
      </div>
      <div class="city-badge-row">
        ${cityValueTags(city).map((tag) => `<span>${esc(tag)}</span>`).join("")}
      </div>
      <div class="city-team-sample">
        ${sampleTeams.map((team) => `<span>${esc(teamCode(team))}</span>`).join("")}
      </div>
      <div class="host-city-actions">
        <a href="${attr(city.path)}">Open city schedule</a>
        <a href="/world-cup-2026-schedule/#full-schedule">Open full schedule</a>
      </div>
    </article>`;
  };

  return `<section class="section host-city-explorer" id="city-schedule-pages" data-city-explorer>
  <div class="host-city-explorer-head">
    <div>
      <p class="eyebrow">Host city planner</p>
      <h2>Compare Full Match Dates, Venues and Fixtures by Host City</h2>
      <p>Use this city hub to narrow the 16 World Cup 2026 schedule host cities by country, region, full match dates, venue, group stage fixtures, knockout rounds, semifinals, third-place match and final planning value.</p>
    </div>
    <div class="host-city-scoreboard" aria-label="Host city summary">
      <div><strong>${cities.length}</strong><span>host cities</span></div>
      <div><strong>${totalMatches}</strong><span>matches</span></div>
      <div><strong>${countries.length}</strong><span>countries</span></div>
      <div><strong>${knockoutHosts}</strong><span>knockout hosts</span></div>
    </div>
  </div>

  <div class="host-city-controls" aria-label="Host city filters">
    <label>
      <span>Search city, stadium or team</span>
      <input type="search" placeholder="Try Dallas, BMO Field or Mexico" data-city-search>
    </label>
    <label>
      <span>Country</span>
      <select data-city-country>
        <option value="">All countries</option>
        ${countries.map((country) => `<option value="${attr(country)}">${esc(country)}</option>`).join("")}
      </select>
    </label>
    <label>
      <span>Region</span>
      <select data-city-region>
        <option value="">All regions</option>
        ${regions.map(([region, label]) => `<option value="${attr(region)}">${esc(label)}</option>`).join("")}
      </select>
    </label>
    <label>
      <span>Planning need</span>
      <select data-city-need>
        <option value="">All city types</option>
        <option value="high-volume">Most matches</option>
        <option value="knockout">Knockout hosts</option>
        <option value="final-week">Late tournament cities</option>
        <option value="cross-border">Canada or Mexico</option>
      </select>
    </label>
    <label>
      <span>Sort</span>
      <select data-city-sort>
        <option value="matches">Most matches first</option>
        <option value="date">Earliest first match</option>
        <option value="name">City name</option>
      </select>
    </label>
  </div>

  <div class="host-city-presets" aria-label="Quick city comparisons">
    <button type="button" data-city-preset="high-volume">Most matches</button>
    <button type="button" data-city-preset="knockout">Knockout hosts</button>
    <button type="button" data-city-preset="final-week">Late tournament route</button>
    <button type="button" data-city-preset="cross-border">Canada and Mexico</button>
    <button type="button" data-city-preset="">Reset</button>
  </div>

  ${renderFeaturedCityCards(cities)}

  <div class="host-city-comparison" aria-label="Recommended host city comparison paths">
    ${compareCards
      .map(
        (item) => `<article>
      <span>${esc(item.label)}</span>
      <strong>${esc(item.title)}</strong>
      <p>${esc(item.copy)}</p>
      <button type="button" ${item.preset ? `data-city-preset="${attr(item.preset)}"` : `data-city-region-preset="${attr(item.region)}"`}>${esc(item.action)}</button>
    </article>`
      )
      .join("")}
  </div>

  <div class="host-city-results-line" id="host-city-results">
    <strong><span data-city-result-count>${cities.length}</span> cities shown</strong>
    <span>Full tournament city window: ${esc(shortDate(firstDate))} to ${esc(shortDate(lastDate))}</span>
  </div>

  <div class="host-city-grid" data-city-grid>
    ${cities.map(card).join("")}
  </div>
</section>

<section class="section host-city-paths">
  <div class="host-city-path">
    <span>Best high-volume bases</span>
    <strong>${topCities.map((city) => city.city).join(", ")}</strong>
    <p>Start here when your main question is how many fixtures can fit into one travel market.</p>
  </div>
  <div class="host-city-path">
    <span>Late-round route</span>
    <strong>${finalWeekCities.map((city) => city.city).join(", ")}</strong>
    <p>Use these cities when semifinals, the third-place match and championship timing matter most.</p>
  </div>
  <div class="host-city-path">
    <span>Cross-border planning</span>
    <strong>${cities.filter((city) => city.country !== "United States").map((city) => city.city).join(", ")}</strong>
    <p>Compare Canada and Mexico cities separately because travel documents, airports and local logistics differ.</p>
  </div>
</section>`;
};

const teamSummaries = () => {
  const groups = new Map();
  for (const match of matches.filter((item) => item.stage === "Group stage")) {
    for (const side of ["home", "away"]) {
      const team = match[side];
      if (!isRealTeam(team)) continue;
      const current = groups.get(team) ?? {
        team,
        path: teamPath(team),
        group: match.group,
        matches: [],
        cities: new Set(),
        stadiums: new Set(),
        opponents: new Set()
      };
      current.matches.push(match);
      current.cities.add(match.city);
      current.stadiums.add(match.stadium);
      current.opponents.add(side === "home" ? match.away : match.home);
      groups.set(team, current);
    }
  }

  return [...groups.values()]
    .map((team) => ({
      ...team,
      matches: team.matches.sort((a, b) => a.date.localeCompare(b.date) || a.kickoffET.localeCompare(b.kickoffET)),
      cities: [...team.cities].sort((a, b) => a.localeCompare(b)),
      stadiums: [...team.stadiums].sort((a, b) => a.localeCompare(b)),
      opponents: [...team.opponents].sort((a, b) => a.localeCompare(b)),
      firstDate: team.matches.map((match) => match.date).sort()[0],
      lastDate: team.matches.map((match) => match.date).sort().at(-1)
    }))
    .sort((a, b) => a.team.localeCompare(b.team));
};

const teamSchema = (team) => [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${team.team} World Cup 2026 Schedule`,
    description: `See the ${team.team} World Cup 2026 schedule with match dates, ET kickoff times, opponents, host cities and stadiums.`,
    author: { "@type": "Organization", name: `${site.brand} editorial team` },
    publisher: { "@type": "Organization", name: site.brand },
    mainEntityOfPage: `${site.url}${team.path}`
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many group matches does ${team.team} play at World Cup 2026?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${team.team} has ${team.matches.length} listed group-stage matches in the wc26schedule data set.`
        }
      },
      {
        "@type": "Question",
        name: `Which cities does ${team.team} play in?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${team.team} is listed in ${team.cities.join(", ")}.`
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "World Cup 2026 Schedule",
        item: `${site.url}/world-cup-2026-schedule/`
      },
      { "@type": "ListItem", position: 3, name: team.team, item: `${site.url}${team.path}` }
    ]
  }
];

const renderTeamPage = (team) =>
  layout({
    title: `${team.team} World Cup 2026 Schedule`,
    description: `See ${team.team} World Cup 2026 fixtures with dates, ET kickoff times, opponents, host cities and stadiums.`,
    canonical: team.path,
    schema: teamSchema(team),
    body: `${hero({
      eyebrow: "Team schedule",
      h1: `${team.team} World Cup 2026 Schedule`,
      intro: `${team.team} is listed in Group ${team.group} with ${team.matches.length} group-stage matches from ${team.firstDate} to ${team.lastDate}. This page brings together opponents, dates, ET kickoff times, cities and stadiums for fans following the team route.`,
      facts: [
        ["Group", team.group],
        ["Matches", `${team.matches.length}`],
        ["Cities", team.cities.join(", ")]
      ],
      primaryHref: "/world-cup-2026-schedule/"
    })}
<main class="main">
  <section class="section">
    <div class="grid">
      <article class="span-8 card"><div class="card-body">
        <p class="eyebrow">Team overview</p>
        <h2>${esc(team.team)} fixtures and route</h2>
        <p>Use this page to follow ${esc(team.team)} by opponent, date, host city and stadium. It is designed for fans who want a team-specific view instead of scanning the full 104-match schedule.</p>
      </div></article>
      <aside class="span-4 card"><div class="card-body">
        <p class="eyebrow">Planning note</p>
        <h3>Group-stage focus</h3>
        <p>This page lists confirmed group-stage fixtures from the current data set. Knockout matches depend on standings and will be connected once results are known.</p>
      </div></aside>
    </div>
  </section>
  <section class="section">
    <h2>${esc(team.team)} match schedule</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Match</th><th>Date</th><th>Time ET</th><th>Opponent</th><th>City</th><th>Stadium</th><th>Group</th></tr></thead>
        <tbody>
          ${team.matches
            .map((match) => {
              const opponent = match.home === team.team ? match.away : match.home;
              return `<tr><td>${match.matchNumber}</td><td>${esc(match.date)}</td><td>${esc(match.kickoffET)} ET</td><td>${esc(opponent)}</td><td><a href="${attr(cityPath(match.citySlug))}">${esc(match.city)}</a></td><td>${esc(match.stadium)}</td><td>Group ${esc(match.group)}</td></tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  </section>
  <section class="section">
    <h2>How to use this team page</h2>
    ${table([
      ["Track opponents", team.opponents.join(", "), "Compare each fixture against the full group schedule."],
      ["Plan travel", team.cities.join(", "), "Open city pages to review stadium and match context."],
      ["Save the schedule", "Use CSV, Excel or PDF downloads.", "Download the full schedule and filter by team."]
    ])}
  </section>
  <section class="section">
    <h2>Related planning pages</h2>
    ${linkGrid([
      ["Full World Cup 2026 schedule", "/world-cup-2026-schedule/"],
      ["Groups guide", "/world-cup-2026-schedule-groups/"],
      ["Download schedule files", "/world-cup-2026-schedule-excel/"],
      ["Ticket guide", "/world-cup-2026-tickets/"]
    ])}
  </section>
  <section class="section">
    <h2>FAQ</h2>
    ${faqHtml([
      [`How many group matches does ${team.team} play?`, `${team.team} has ${team.matches.length} listed group-stage matches in Group ${team.group}.`],
      [`Which cities does ${team.team} play in?`, `${team.team} is listed in ${team.cities.join(", ")}.`],
      [`Can ${team.team} play knockout matches?`, "Knockout fixtures depend on group standings. This page will link to bracket paths once results determine the next round."]
    ])}
  </section>
  <section class="source-note"><strong>Last updated:</strong> ${updated}. Team schedule data is generated from the structured wc26schedule match dataset and should be checked against official sources before travel or ticket decisions.</section>
</main>`
  });

const citySchema = (city) => [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `World Cup 2026 Schedule ${city.city}: Match Dates, Stadium & Fixtures`,
    description: `See the World Cup 2026 schedule for ${city.city}, including match dates, kickoff times, teams, stages, stadium details and local planning notes.`,
    author: { "@type": "Organization", name: `${site.brand} editorial team` },
    publisher: { "@type": "Organization", name: site.brand },
    mainEntityOfPage: `${site.url}${city.path}`
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many World Cup 2026 matches are in ${city.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.city} currently has ${city.matches.length} matches in the wc26schedule data set. Confirm official details before travel or ticket decisions.`
        }
      },
      {
        "@type": "Question",
        name: `Which stadium hosts matches in ${city.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.city} matches are listed at ${city.stadiums.join(", ")}.`
        }
      },
      {
        "@type": "Question",
        name: `What is the best way to use the ${city.city} schedule page?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Use the ${city.city} schedule page to compare local match dates, teams, stages and stadium context, then confirm final travel and ticket decisions with official sources.`
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "World Cup 2026 Schedule Host Cities",
        item: `${site.url}/world-cup-2026-schedule-host-cities/`
      },
      { "@type": "ListItem", position: 3, name: city.city, item: `${site.url}${city.path}` }
    ]
  }
];

const renderCityPage = (city) => {
  const guide = cityGuide(city);
  const title = `World Cup 2026 Schedule ${city.city}: Match Dates, Stadium & Fixtures`;
  const description = `${city.city} World Cup 2026 schedule with match dates, stadium, teams, stages, kickoff times and local planning notes for fans comparing host city fixtures.`;
  const featured = cityFeaturedMatch(city);
  const firstMatch = city.matches[0];
  const knockoutMatches = city.matches.filter((match) => match.stage !== "Group stage");
  const stageSummary = cityStageSummary(city);
  const valueTags = cityValueTags(city);
  const visibleTeams = city.teams.filter(isRealTeam);
  const matchRows = city.matches
    .map(
      (match) => `<article class="city-detail-match-card">
        <div>
          <span>Match ${match.matchNumber}</span>
          <strong>${esc(`${match.home} vs ${match.away}`)}</strong>
          <small>${esc(match.group ? `${match.stage} - Group ${match.group}` : match.stage)}</small>
        </div>
        <div class="matchup">${teamChip(match.home, "Home")}<span>vs</span>${teamChip(match.away, "Away")}</div>
        <dl>
          <div><dt>Date</dt><dd>${esc(match.dateLabel || match.date)}</dd></div>
          <div><dt>Kickoff</dt><dd>${esc(match.kickoffET)} ET</dd></div>
          <div><dt>Venue</dt><dd>${esc(match.stadium)}</dd></div>
        </dl>
        <a href="${attr(matchDetailPath(match))}">Open match details</a>
      </article>`
    )
    .join("");

  return layout({
    title,
    description,
    canonical: city.path,
    schema: citySchema(city),
    body: `<section class="hero city-detail-hero" style="--city-image: url('${attr(cityImagePath(city))}')">
  <div class="hero-inner">
    <div>
      <p class="eyebrow">${esc(cityRouteBadge(city))}</p>
      <h1>${esc(title)}</h1>
      <p class="hero-copy">${esc(guide.lead)}</p>
      <div class="hero-actions">
        <a class="button" href="#city-fixtures">View ${esc(city.city)} fixtures</a>
        <a class="button secondary" href="/world-cup-2026-schedule-host-cities/">Compare host cities</a>
      </div>
    </div>
    <aside class="hero-panel city-detail-hero-panel">
      <strong class="hero-panel-title">City schedule snapshot</strong>
      <p>${esc(guide.planningAngle)}</p>
      <div class="download-checklist" aria-label="${attr(city.city)} schedule snapshot">
        <span><strong>${city.matches.length}</strong>matches</span>
        <span><strong>${esc(cityDateWindow(city))}</strong>date window</span>
        <span><strong>${knockoutMatches.length}</strong>knockout matches</span>
        <span><strong>${esc(city.stadiums.join(", "))}</strong>stadium</span>
      </div>
    </aside>
  </div>
</section>
<main class="main">
  <section class="section city-detail-overview">
    <div class="city-detail-media">
      <img src="${attr(cityImagePath(city))}" alt="${attr(`${city.city} World Cup 2026 schedule host city guide`)}" loading="eager" decoding="async">
      <div>
        ${valueTags.map((tag) => `<span>${esc(tag)}</span>`).join("")}
      </div>
    </div>
    <div class="city-detail-copy">
      <p class="eyebrow">City match planner</p>
      <h2>${esc(city.city)} Match Dates and Venue Snapshot</h2>
      <p>${esc(`${city.city} hosts ${city.matches.length} listed World Cup 2026 matches from ${shortDate(city.firstDate)} to ${shortDate(city.lastDate)} at ${city.stadiums.join(", ")}. The local schedule covers ${stageSummary.join(", ")}, so this page is designed to help you decide whether the city fits a team route, a travel window, a knockout-stage plan or a stadium-focused trip.`)}</p>
      <p>${esc(guide.travelNote)}</p>
      <div class="city-detail-stat-grid">
        <div><strong>${city.matches.length}</strong><span>total fixtures</span></div>
        <div><strong>${visibleTeams.length}</strong><span>listed teams</span></div>
        <div><strong>${city.stages.length}</strong><span>stage types</span></div>
        <div><strong>${knockoutMatches.length}</strong><span>knockout fixtures</span></div>
      </div>
    </div>
  </section>
  <section class="section" id="city-fixtures">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Local timeline</p>
        <h2>${esc(city.city)} Match Timeline</h2>
        <p>Scan each local fixture by match number, team pairing, date, kickoff time and tournament stage before opening the detailed match page.</p>
      </div>
      <a class="button light" href="/world-cup-2026-schedule/?city=${attr(encodeURIComponent(city.city))}#full-schedule">Open full table</a>
    </div>
    <div class="city-detail-match-grid">
      ${matchRows}
    </div>
  </section>
  <section class="section">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Teams and stages</p>
        <h2>Teams and Stages Playing in ${esc(city.city)}</h2>
        <p>Use this section when you are deciding whether to follow a national team, chase a knockout route or choose the city because of its stadium and date window.</p>
      </div>
      <strong class="pill">${esc(city.country)}</strong>
    </div>
    <div class="city-detail-team-cloud">
      ${visibleTeams.map((team) => teamChip(team)).join("")}
    </div>
    <div class="host-city-paths">
      <article class="host-city-path"><span>Featured fixture</span><strong>${esc(`#${featured.matchNumber} ${featured.home} vs ${featured.away}`)}</strong><p>${esc(`${featured.stage}${featured.group ? ` - Group ${featured.group}` : ""} on ${featured.dateLabel || featured.date}.`)}</p></article>
      <article class="host-city-path"><span>Stage mix</span><strong>${esc(stageSummary.join(", "))}</strong><p>${esc(`${city.city} is strongest when your plan depends on ${cityPlanningFit(city).toLowerCase()}`)}</p></article>
      <article class="host-city-path"><span>First local match</span><strong>${esc(`#${firstMatch.matchNumber} ${firstMatch.home} vs ${firstMatch.away}`)}</strong><p>${esc(`${firstMatch.dateLabel || firstMatch.date} at ${firstMatch.kickoffET} ET. Use this to check arrival timing before adding later fixtures.`)}</p></article>
    </div>
  </section>
  <section class="section">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Planning notes</p>
        <h2>Stadium, Travel and Ticket Planning Notes</h2>
        <p>These notes turn the fixture list into a practical planning page. They are not a substitute for official stadium, host-city or ticket guidance.</p>
      </div>
    </div>
    <div class="host-city-source-grid">
      <article><span>Stadium access</span><strong>${esc(city.stadiums.join(", "))}</strong><p>${esc(guide.stadiumNote)}</p><a href="/world-cup-2026-tickets/">Check ticket guidance</a></article>
      <article><span>Travel fit</span><strong>${esc(city.travelFit)}</strong><p>${esc(guide.travelNote)}</p><a href="/world-cup-2026-schedule-host-cities/">Compare cities</a></article>
      <article><span>Ticket priority</span><strong>${esc(cityRouteBadge(city))}</strong><p>${esc(guide.ticketNote)}</p><a href="/world-cup-2026-schedule-pdf/">Download planning files</a></article>
    </div>
  </section>
  <section class="section">
    <h2>Full ${esc(city.city)} Fixture Table</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Match</th><th>Date</th><th>Time ET</th><th>Stage</th><th>Group</th><th>Teams</th><th>Stadium</th><th>Details</th></tr></thead>
        <tbody>
          ${city.matches
            .map(
              (match) =>
                `<tr><td>${match.matchNumber}</td><td>${esc(match.date)}</td><td>${esc(match.kickoffET)} ET</td><td>${esc(match.stage)}</td><td>${esc(match.group || "-")}</td><td>${teamLink(match.home)} v ${teamLink(match.away)}</td><td>${esc(match.stadium)}</td><td><a href="${attr(matchDetailPath(match))}">Match details</a></td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </section>
  <section class="section">
    <h2>How to Use the ${esc(city.city)} City Schedule</h2>
    ${table([
      ["Choose the anchor match", `#${featured.matchNumber} ${featured.home} vs ${featured.away}`, "Start from the fixture with the highest planning value, then add nearby matches only if the dates work."],
      ["Compare the date window", `${cityDateWindow(city)}`, "Check whether the city fits your arrival and departure plan before booking hotels or flights."],
      ["Confirm stadium context", city.stadiums.join(", "), "Use official venue and host-city guidance for gates, transport, prohibited items and local event operations."],
      ["Move to match details", `${city.matches.length} local match pages`, "Open individual match pages when you need team context, countdown timing, same-group matches or route links."]
    ])}
  </section>
  <section class="section">
    <h2>Related Planning Pages</h2>
    ${linkGrid([
      ["Full World Cup 2026 schedule", "/world-cup-2026-schedule/"],
      ["All host cities", "/world-cup-2026-schedule-host-cities/"],
      ["Ticket guide", "/world-cup-2026-tickets/"],
      ["PDF downloads", "/world-cup-2026-schedule-pdf/"],
      ["Excel schedule planner", "/world-cup-2026-schedule-excel/"],
      [`${city.city} first match details`, matchDetailPath(firstMatch)]
    ])}
  </section>
  <section class="section">
    <h2>${esc(city.city)} World Cup 2026 Schedule FAQ</h2>
    ${faqHtml([
      [`How many World Cup 2026 matches are in ${city.city}?`, `${city.city} currently has ${city.matches.length} listed matches in the wc26schedule data set, covering ${stageSummary.join(", ")}.`],
      [`Which stadium hosts World Cup 2026 matches in ${city.city}?`, `${city.city} matches are listed at ${city.stadiums.join(", ")}. Always check official stadium and host-city guidance before match day.`],
      [`What is the most important ${city.city} fixture to check first?`, `Start with #${featured.matchNumber} ${featured.home} vs ${featured.away}, because it has the strongest stage value on this city page: ${featured.stage}.`],
      [`Can I use this page for ${city.city} travel planning?`, `Yes, use it to compare local fixture dates, teams, stages and stadium context. Confirm transport, ticket, hotel and event operations with official sources before making paid decisions.`],
      [`Can I download the ${city.city} schedule?`, "The current download files include the full tournament schedule in PDF, Excel and CSV formats. Use the city page for local context, then use downloads when you need an offline planning file."]
    ])}
  </section>
  <section class="source-note"><strong>Last updated:</strong> ${updated}. Match data is generated from the structured wc26schedule dataset and should be checked against official sources before travel or ticket decisions.</section>
</main>`
  });
};

const matchPageTitle = (match) => `Match ${match.matchNumber}: ${match.home} vs ${match.away}`;

const matchTimeShort = (match) => `${match.date} - ${match.kickoffET} ET`;

const relatedMatchCard = (match, currentMatch, note = "") => {
  const isCurrent = match.matchNumber === currentMatch.matchNumber;
  return `<a class="related-match-card${isCurrent ? " is-current" : ""}" href="${attr(matchDetailPath(match))}">
    <span>${isCurrent ? "Current match" : `Match ${match.matchNumber}`}</span>
    <strong>${esc(`${match.home} vs ${match.away}`)}</strong>
    <small>${esc(match.group ? `${match.stage} - Group ${match.group}` : match.stage)}</small>
    <em>${esc(matchTimeShort(match))}</em>
    <b>${esc(note || `${match.city} - ${match.stadium}`)}</b>
  </a>`;
};

const sameGroupMatches = (match) =>
  match.group
    ? matches
        .filter((item) => item.group === match.group && item.stage === "Group stage")
        .sort((a, b) => a.date.localeCompare(b.date) || a.kickoffET.localeCompare(b.kickoffET))
    : [];

const teamRouteMatches = (team, currentMatch) =>
  isRealTeam(team)
    ? matches
        .filter((item) => item.stage === "Group stage" && (item.home === team || item.away === team))
        .sort((a, b) => a.date.localeCompare(b.date) || a.kickoffET.localeCompare(b.kickoffET))
    : [];

const teamRouteSummary = (team, currentMatch) => {
  if (!isRealTeam(team)) {
    return `${team} is a bracket placeholder in the current schedule data. The exact participant will depend on earlier World Cup 2026 results, so use this page for date, venue and timing planning until the team is confirmed.`;
  }

  const teamMatches = matches
    .filter((item) => item.stage === "Group stage" && (item.home === team || item.away === team))
    .sort((a, b) => a.date.localeCompare(b.date) || a.kickoffET.localeCompare(b.kickoffET));
  const opponents = teamMatches
    .map((item) => (item.home === team ? item.away : item.home))
    .filter((opponent) => opponent !== currentMatch.home && opponent !== currentMatch.away);
  const cities = [...new Set(teamMatches.map((item) => item.city))];

  if (!teamMatches.length) {
    return `${team} is listed for this match in the current schedule data. Open the team page when available to connect this match with the broader team route.`;
  }

  return `${team} has ${teamMatches.length} listed group-stage fixtures in this data set, with matches in ${cities.join(", ")}. Besides this match, the route also points toward ${opponents.length ? opponents.join(", ") : "the rest of the group schedule"}, which helps fans compare rest days, travel distance and kickoff windows before deciding which fixtures to follow.`;
};

const matchStageContext = (match) => {
  if (match.stage === "Group stage") {
    return `This is a Group ${match.group} fixture, so the result contributes directly to the first-round table. For fans, that makes the match useful beyond the single kickoff: it connects to points, goal difference, qualification scenarios and the order of later group matches. If you are following either team, use this page together with the team schedule pages and the full group guide so you can see where this match sits in the three-game group route.`;
  }
  if (/final/i.test(match.stage)) {
    return `This match is part of the final-week tournament path, where timing, ticket planning and venue confirmation become especially important. The participant labels may depend on earlier knockout results, so this page focuses on the fixed planning details that can already be used: match number, kickoff, city, stadium and official-source reminders.`;
  }
  return `This is a knockout-stage fixture, so the listed teams or placeholders depend on the bracket path. The fixed planning value is still clear: the match number, date, kickoff, host city and stadium are available for schedule comparison, while the final participants should be confirmed through official results before travel, tickets or broadcast plans are locked in.`;
};

const matchFaqs = (match, view) => [
  [
    `When is ${matchPageTitle(match)}?`,
    `${matchPageTitle(match)} is listed for ${match.dateLabel} at ${match.kickoffET} ET. The computed UTC kickoff is ${view["Kickoff UTC"]}, and the venue local time is ${view["Venue local time"]}.`
  ],
  [
    `Where is ${matchPageTitle(match)} played?`,
    `${matchPageTitle(match)} is listed in ${match.city} at ${match.stadium}. Use the linked city guide for more host-city context, stadium grouping and schedule planning.`
  ],
  [
    `Is this match part of the group stage or knockout stage?`,
    match.stage === "Group stage"
      ? `This match is part of the Group ${match.group} schedule. It should be read together with the other Group ${match.group} fixtures.`
      : `This match is listed as ${match.stage}. Participants may depend on earlier results if the match uses bracket placeholders.`
  ],
  [
    "Can I use this page for ticket or travel decisions?",
    "Use this page as a planning reference, then confirm paid or time-sensitive decisions with FIFA, official ticket channels, the host city, the stadium and authorized broadcasters."
  ]
];

const matchSchema = (match, view) => {
  const city = cityMeta[match.city] ?? { country: "" };
  const competitors = [match.home, match.away]
    .filter(isRealTeam)
    .map((team) => ({
      "@type": "SportsTeam",
      name: team,
      url: `${site.url}${teamPath(team)}`
    }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${matchPageTitle(match)} - World Cup 2026 Match Details`,
      description: `${matchPageTitle(match)} schedule details with kickoff time, venue, city, stage, group, team links and source notes.`,
      author: { "@type": "Organization", name: `${site.brand} editorial team` },
      publisher: { "@type": "Organization", name: site.brand },
      mainEntityOfPage: `${site.url}${matchDetailPath(match)}`
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${matchPageTitle(match)} - FIFA World Cup 2026`,
      startDate: kickoffUtcIso(match),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      sport: "Soccer",
      location: {
        "@type": "Place",
        name: match.stadium,
        address: {
          "@type": "PostalAddress",
          addressLocality: match.city,
          addressCountry: city.country
        }
      },
      competitor: competitors,
      organizer: { "@type": "Organization", name: "FIFA" },
      url: `${site.url}${matchDetailPath(match)}`
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: matchFaqs(match, view).map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "World Cup 2026 Schedule",
          item: `${site.url}/world-cup-2026-schedule/`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `Match ${match.matchNumber}`,
          item: `${site.url}${matchDetailPath(match)}`
        }
      ]
    }
  ];
};

const renderMatchPage = (match) => {
  const view = matchView(match);
  const city = cityMeta[match.city] ?? { country: "" };
  const previousMatch = matches.find((item) => item.matchNumber === match.matchNumber - 1);
  const nextMatch = matches.find((item) => item.matchNumber === match.matchNumber + 1);
  const realTeams = [match.home, match.away].filter(isRealTeam);
  const groupMatches = sameGroupMatches(match);
  const homeRouteMatches = teamRouteMatches(match.home, match);
  const awayRouteMatches = teamRouteMatches(match.away, match);
  const links = [
    ["Full World Cup 2026 schedule", "/world-cup-2026-schedule/"],
    [`${match.city} city guide`, cityPath(match.citySlug)],
    ["Download schedule files", "/world-cup-2026-schedule-excel/"],
    ["Ticket guide", "/world-cup-2026-tickets/"]
  ];
  for (const team of realTeams) links.unshift([`${team} schedule`, teamPath(team)]);
  if (previousMatch) links.push([`Previous match: ${previousMatch.home} vs ${previousMatch.away}`, matchDetailPath(previousMatch)]);
  if (nextMatch) links.push([`Next match: ${nextMatch.home} vs ${nextMatch.away}`, matchDetailPath(nextMatch)]);
  const timezoneOptions = [
    ["America/New_York", "Eastern Time"],
    ["America/Los_Angeles", "Pacific Time"],
    ["America/Mexico_City", "Mexico City"],
    ["America/Toronto", "Toronto"],
    ["America/Vancouver", "Vancouver"],
    ["Europe/London", "London"],
    ["Europe/Madrid", "Madrid"],
    ["Europe/Paris", "Paris"],
    ["Africa/Johannesburg", "Johannesburg"],
    ["Asia/Dubai", "Dubai"],
    ["Asia/Kolkata", "India"],
    ["Asia/Shanghai", "China"],
    ["Asia/Tokyo", "Tokyo"],
    ["Australia/Sydney", "Sydney"]
  ];

  return layout({
    title: `${matchPageTitle(match)} - World Cup 2026 Match Details`,
    description: `${matchPageTitle(match)} schedule details: ${match.dateLabel}, ${match.kickoffET} ET, ${match.city}, ${match.stadium}, ${match.stage}${match.group ? ` Group ${match.group}` : ""}.`,
    canonical: matchDetailPath(match),
    schema: matchSchema(match, view),
    body: `${hero({
      eyebrow: "Match details",
      h1: `${matchPageTitle(match)}`,
      intro: `${matchPageTitle(match)} is listed for ${match.dateLabel} at ${match.kickoffET} ET in ${match.city}. The fixture is part of ${match.stage}${match.group ? `, Group ${match.group}` : ""}, and the venue is ${match.stadium}. This page turns the schedule row into a planning page with kickoff conversions, team-route context, city links and official-source reminders.`,
      facts: [
        ["Stage", match.group ? `${match.stage} - Group ${match.group}` : match.stage],
        ["Kickoff", `${match.kickoffET} ET`],
        ["Venue", `${match.stadium}, ${match.city}`]
      ],
      actions: [
        ["Back to full schedule", "/world-cup-2026-schedule/", "primary"],
        ["Open city guide", cityPath(match.citySlug), "secondary"]
      ],
      primaryHref: "/world-cup-2026-schedule/"
    })}
<main class="main">
  <section class="section match-detail-overview" data-match-center data-kickoff-utc="${attr(kickoffUtcIso(match))}">
    <div class="match-center-board">
      <div class="match-center-topline">
        <span>Match ${match.matchNumber}</span>
        <span>${esc(match.group ? `${match.stage} - Group ${match.group}` : match.stage)}</span>
        <span data-match-status>Scheduled</span>
      </div>
      <div class="match-center-main">
        <article class="match-team-card">
          ${teamChip(match.home, "Home")}
        </article>
        <div class="match-center-countdown" aria-label="Match countdown">
          <span>Kickoff countdown</span>
          <div class="countdown-grid compact">
            <div><strong data-match-days>--</strong><span>Days</span></div>
            <div><strong data-match-hours>--</strong><span>Hours</span></div>
            <div><strong data-match-minutes>--</strong><span>Min</span></div>
            <div><strong data-match-seconds>--</strong><span>Sec</span></div>
          </div>
        </div>
        <article class="match-team-card">
          ${teamChip(match.away, "Away")}
        </article>
      </div>
      <div class="match-center-actions">
        <a class="button" href="/world-cup-2026-schedule/">Full schedule</a>
        <a class="button secondary" href="${attr(cityPath(match.citySlug))}">City guide</a>
        <a class="button secondary" href="/world-cup-2026-tickets/">Ticket guide</a>
      </div>
    </div>
    <div class="match-time-panel">
      <div>
        <span>Source kickoff</span>
        <strong>${esc(match.kickoffET)} ET</strong>
        <small>${esc(match.dateLabel)}</small>
      </div>
      <div>
        <span>Venue local</span>
        <strong>${esc(view["Venue local time"])}</strong>
        <small>${esc(`${match.stadium}, ${match.city}`)}</small>
      </div>
      <div>
        <span>Your time</span>
        <strong data-match-user-time>Detecting timezone...</strong>
        <label>Timezone
          <select data-match-timezone>
            ${timezoneOptions.map(([value, label]) => `<option value="${attr(value)}">${esc(label)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div>
        <span>Planning path</span>
        <strong>${esc(city.country || "Host market")}</strong>
        <small>${esc(match.sourceStatus)}</small>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="grid">
      <article class="span-8 card"><div class="card-body">
        <p class="eyebrow">Match overview</p>
        <h2>${esc(matchPageTitle(match))} schedule context</h2>
        <p>${esc(matchStageContext(match))}</p>
        <p>${esc(`${match.home} vs ${match.away} is useful to track from several angles: the official match number, the source ET kickoff time, the computed UTC time, the venue local time, the host city and the stadium. Keeping those fields together reduces the chance of mixing source time with local time when you are planning a watch party, comparing TV windows, coordinating travel or building a personal World Cup 2026 calendar.`)}</p>
      </div></article>
      <aside class="span-4 card"><div class="card-body">
        <p class="eyebrow">Verification note</p>
        <h3>Confirm final details</h3>
        <p>This page is generated from the structured wc26schedule match data. Before buying tickets, booking travel or making paid plans, verify the latest information with FIFA, official ticket sources, the host city, the stadium and authorized broadcasters.</p>
      </div></aside>
    </div>
  </section>
  <section class="section">
    <h2>Kickoff Time and Time Zone Details</h2>
    ${table([
      ["Source date", match.dateLabel, "The date attached to the source schedule row."],
      ["Source kickoff", `${match.kickoffET} ET`, "Use this as the baseline when comparing against official schedule materials."],
      ["UTC kickoff", view["Kickoff UTC"], "Useful for calendar imports, international planning and technical schedule checks."],
      ["Venue local time", view["Venue local time"], `Computed for ${match.city}, ${city.country || "host city"}.`]
    ])}
    <p>The full schedule page can convert every fixture into your selected timezone. This match page keeps the source fields visible so you can compare the official ET listing with UTC and the host-city local time. That distinction matters for fans outside North America, because a late match in the host city can become the next calendar day in Europe, Africa, Asia or Oceania.</p>
  </section>
  <section class="section">
    <h2>Team Route Context</h2>
    <div class="grid">
      <article class="span-6 card"><div class="card-body">
        <p class="eyebrow">Home side</p>
        <h3>${esc(match.home)}</h3>
        <p>${esc(teamRouteSummary(match.home, match))}</p>
      </div></article>
      <article class="span-6 card"><div class="card-body">
        <p class="eyebrow">Away side</p>
        <h3>${esc(match.away)}</h3>
        <p>${esc(teamRouteSummary(match.away, match))}</p>
      </div></article>
    </div>
  </section>
  ${
    groupMatches.length
      ? `<section class="section related-match-section">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Same group path</p>
        <h2>Group ${esc(match.group)} Matches Around This Fixture</h2>
        <p>Use these Group ${esc(match.group)} fixtures to understand how ${esc(match.home)} vs ${esc(match.away)} fits into the wider group route, rest-day pattern and qualification picture.</p>
      </div>
      <a class="button light" href="/world-cup-2026-schedule-groups/">Open groups guide</a>
    </div>
    <div class="related-match-grid">
      ${groupMatches
        .map((item) =>
          relatedMatchCard(
            item,
            match,
            item.matchNumber === match.matchNumber ? `${item.city} - current fixture` : `${item.city} - ${item.stadium}`
          )
        )
        .join("")}
    </div>
  </section>`
      : ""
  }
  <section class="section related-match-section">
    <div class="section-heading-row">
      <div>
        <p class="eyebrow">Team routes</p>
        <h2>Follow Each Team's Group Schedule</h2>
        <p>These route cards keep users moving from one match detail page to the next without returning to the full 104-match table.</p>
      </div>
    </div>
    <div class="team-route-grid">
      <article>
        <div class="team-route-heading">
          ${teamChip(match.home, "Home")}
          ${isRealTeam(match.home) ? `<a href="${attr(teamPath(match.home))}">Open team page</a>` : ""}
        </div>
        <div class="related-match-list">
          ${
            homeRouteMatches.length
              ? homeRouteMatches
                  .map((item) =>
                    relatedMatchCard(
                      item,
                      match,
                      item.matchNumber === match.matchNumber
                        ? "Current fixture"
                        : `Opponent: ${item.home === match.home ? item.away : item.home}`
                    )
                  )
                  .join("")
              : relatedMatchCard(match, match, "Route depends on bracket confirmation")
          }
        </div>
      </article>
      <article>
        <div class="team-route-heading">
          ${teamChip(match.away, "Away")}
          ${isRealTeam(match.away) ? `<a href="${attr(teamPath(match.away))}">Open team page</a>` : ""}
        </div>
        <div class="related-match-list">
          ${
            awayRouteMatches.length
              ? awayRouteMatches
                  .map((item) =>
                    relatedMatchCard(
                      item,
                      match,
                      item.matchNumber === match.matchNumber
                        ? "Current fixture"
                        : `Opponent: ${item.home === match.away ? item.away : item.home}`
                    )
                  )
                  .join("")
              : relatedMatchCard(match, match, "Route depends on bracket confirmation")
          }
        </div>
      </article>
    </div>
  </section>
  <section class="section">
    <h2>Venue and City Planning</h2>
    <p>${esc(`${match.city} hosts this fixture at ${match.stadium}. The city page groups every listed World Cup 2026 match in the same host market, which is more useful than reading this fixture in isolation if you are comparing multi-match travel routes. Use the city guide to see the local match cluster, then return to this page when you need the exact team, time and source-note fields for this specific fixture.`)}</p>
    ${table([
      ["Host city", match.city, "Open the city page to compare every local fixture."],
      ["Host country", city.country || "Listed host market", "Use official city and stadium sources for transport and venue operations."],
      ["Stadium", match.stadium, "Confirm entry, access and matchday information before attending."],
      ["Source status", match.sourceStatus, "Keep this field visible when auditing data changes."]
    ])}
  </section>
  <section class="section">
    <h2>How to Use This Match Detail Page</h2>
    ${table([
      ["Check the match", `${match.home} vs ${match.away}`, "Use the matchup, match number and stage before moving into tickets or TV planning."],
      ["Check the time", `${match.kickoffET} ET and ${view["Venue local time"]}`, "Compare source time with venue local time and your own timezone."],
      ["Check the place", `${match.stadium}, ${match.city}`, "Open the city guide for wider host-city context."],
      ["Check the route", match.stage === "Group stage" ? `Group ${match.group}` : match.stage, "Connect this page with team pages, group pages and the bracket path."]
    ])}
  </section>
  <section class="section">
    <h2>Related Match Planning Links</h2>
    ${linkGrid(links)}
  </section>
  <section class="section">
    <h2>FAQ</h2>
    ${faqHtml(matchFaqs(match, view))}
  </section>
  <section class="source-note"><strong>Last updated:</strong> ${updated}. ${esc(scheduleMeta.note)} Primary source: <a href="${attr(scheduleMeta.sourceUrl)}">${esc(scheduleMeta.sourceLabel)}</a>. Mapping source: <a href="${attr(scheduleMeta.mappingSourceUrl)}">${esc(scheduleMeta.mappingSourceLabel)}</a>.</section>
</main>`
  });
};

const scheduleRows = () => matches.map(matchView);

const scheduleCsv = () =>
  [
    scheduleHeaders.join(","),
    ...scheduleRows().map((row) => scheduleHeaders.map((header) => csvValue(row[header])).join(","))
  ].join("\n");

const xml = (value) => esc(value).replaceAll("'", "&apos;");

const worksheet = (name, rows, options = {}) => {
  const widths = options.widths || [];
  const titleRows = new Set(options.titleRows || []);
  const header = options.header !== false;
  const rowStyle = (index) => {
    if (titleRows.has(index)) return "Title";
    if (header && index === 0) return "Header";
    return index % 2 === 0 ? "Even" : "Text";
  };

  return `<Worksheet ss:Name="${xml(name)}">
  <Table>
    ${widths.map((width) => `<Column ss:Width="${width}"/>`).join("\n")}
    ${rows
      .map(
        (row, rowIndex) =>
          `<Row ss:AutoFitHeight="1">${row
            .map(
              (cell) =>
                `<Cell ss:StyleID="${rowStyle(rowIndex)}"><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${xml(cell ?? "")}</Data></Cell>`
            )
            .join("")}</Row>`
      )
      .join("\n")}
  </Table>
</Worksheet>`;
};

const venueRows = () => {
  const venues = new Map();
  for (const match of matches) {
    const key = `${match.city}|${match.stadium}`;
    const meta = cityMeta[match.city] ?? { country: "" };
    const current = venues.get(key) ?? {
      city: match.city,
      country: meta.country,
      stadium: match.stadium,
      matches: 0,
      firstDate: match.date,
      lastDate: match.date
    };
    current.matches += 1;
    current.firstDate = current.firstDate < match.date ? current.firstDate : match.date;
    current.lastDate = current.lastDate > match.date ? current.lastDate : match.date;
    venues.set(key, current);
  }
  return [...venues.values()]
    .sort((a, b) => a.city.localeCompare(b.city))
    .map((venue) => [venue.city, venue.country, venue.stadium, venue.matches, venue.firstDate, venue.lastDate]);
};

const groupRows = () => {
  const teams = [];
  for (const match of matches.filter((item) => item.group)) {
    teams.push([match.group, match.home]);
    teams.push([match.group, match.away]);
  }
  const unique = new Map();
  for (const [group, team] of teams) unique.set(`${group}|${team}`, [group, team]);
  return [...unique.values()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
};

const dateSummaryRows = () => {
  const byDate = new Map();
  for (const match of matches) {
    const current = byDate.get(match.date) ?? {
      date: match.date,
      day: match.dateLabel,
      matches: [],
      cities: new Set(),
      stages: new Set()
    };
    current.matches.push(match);
    current.cities.add(match.city);
    current.stages.add(match.stage);
    byDate.set(match.date, current);
  }
  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => [
      item.date,
      item.day,
      item.matches.length,
      item.matches[0]?.kickoffET || "",
      [...item.stages].join(", "),
      [...item.cities].join(", "),
      item.matches.map((match) => `#${match.matchNumber}`).join(", ")
    ]);
};

const teamSummaryRows = () => {
  const byTeam = new Map();
  for (const match of matches.filter((item) => item.stage === "Group stage")) {
    for (const team of [match.home, match.away].filter(isRealTeam)) {
      const current = byTeam.get(team) ?? {
        team,
        code: teamCode(team),
        group: match.group || "",
        matches: [],
        opponents: new Set(),
        cities: new Set()
      };
      current.matches.push(match);
      current.opponents.add(match.home === team ? match.away : match.home);
      current.cities.add(match.city);
      byTeam.set(team, current);
    }
  }
  return [...byTeam.values()]
    .sort((a, b) => a.team.localeCompare(b.team))
    .map((item) => [
      item.team,
      item.code,
      item.group,
      item.matches.length,
      [...item.opponents].join(", "),
      [...item.cities].join(", "),
      item.matches.map((match) => `#${match.matchNumber}`).join(", ")
    ]);
};

const scheduleSpreadsheetHtml = () => {
  const rows = scheduleRows();
  const fullRows = [scheduleHeaders, ...rows.map((row) => scheduleHeaders.map((header) => row[header]))];
  const groupStageRows = [
    scheduleHeaders,
    ...rows.filter((row) => row.Stage === "Group stage").map((row) => scheduleHeaders.map((header) => row[header]))
  ];
  const knockoutRows = [
    scheduleHeaders,
    ...rows.filter((row) => row.Stage !== "Group stage").map((row) => scheduleHeaders.map((header) => row[header]))
  ];

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Arial" ss:Size="10"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Title"><Font ss:FontName="Arial" ss:Size="16" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#062F2A" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Header"><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B5D50" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8A63C"/></Borders></Style>
  <Style ss:ID="Text"><Font ss:FontName="Arial" ss:Size="10" ss:Color="#13221F"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Even"><Font ss:FontName="Arial" ss:Size="10" ss:Color="#13221F"/><Interior ss:Color="#F4F8F2" ss:Pattern="Solid"/></Style>
 </Styles>
 ${worksheet("README", [
   ["wc26schedule World Cup 2026 workbook"],
   ["Generated", updated],
   ["Best use", "Filter by team, city, date, stage or venue."],
   ["Time notes", "Kickoff ET is source time. UTC and venue local time are computed for planning convenience."],
   ["Workbook sheets", "All Matches, Group Stage, Knockout, By Date, By Team, Venues and Groups."],
   ["Primary source", scheduleMeta.sourceUrl],
   ["Mapping source", scheduleMeta.mappingSourceUrl],
   ["Official PDF reference", "FWC26 Match Schedule_v17_10042026_EN.pdf was used as a visual reference for the downloadable schedule style."],
   ["Reminder", "Confirm official details before travel, tickets or broadcast decisions."]
 ], { header: false, titleRows: [0], widths: [170, 700] })}
 ${worksheet("All Matches", fullRows, { widths: [60, 80, 150, 80, 120, 130, 110, 55, 140, 75, 140, 75, 150, 110, 180, 120, 230, 140] })}
 ${worksheet("Group Stage", groupStageRows, { widths: [60, 80, 150, 80, 120, 130, 110, 55, 140, 75, 140, 75, 150, 110, 180, 120, 230, 140] })}
 ${worksheet("Knockout", knockoutRows, { widths: [60, 80, 150, 80, 120, 130, 110, 55, 140, 75, 140, 75, 150, 110, 180, 120, 230, 140] })}
 ${worksheet("By Date", [["Date", "Day", "Matches", "First kickoff ET", "Stages", "Host cities", "Match numbers"], ...dateSummaryRows()], { widths: [90, 160, 70, 110, 210, 520, 260] })}
 ${worksheet("By Team", [["Team", "Code", "Group", "Matches", "Opponents", "Host cities", "Match numbers"], ...teamSummaryRows()], { widths: [150, 65, 65, 70, 360, 300, 180] })}
 ${worksheet("Venues", [["City", "Host country", "Stadium", "Matches", "First match date", "Last match date"], ...venueRows()], { widths: [160, 120, 220, 70, 120, 120] })}
 ${worksheet("Groups", [["Group", "Team"], ...groupRows()], { widths: [70, 170] })}
</Workbook>`;
};

const pdfEscape = (value) =>
  String(value)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");

const generatePdf = ({ includeDetails = true } = {}) => {
  const pageW = 1191;
  const pageH = 842;
  const colors = {
    dark: "0.040 0.070 0.065",
    panel: "0.070 0.120 0.180",
    grid: "0.260 0.285 0.295",
    line: "0.105 0.130 0.135",
    white: "1 1 1",
    muted: "0.690 0.760 0.790",
    gold: "0.847 0.651 0.235",
    green: "0.090 0.520 0.390",
    teal: "0.310 0.720 0.700",
    orange: "0.960 0.420 0.090"
  };
  const groupColors = {
    A: "0.360 0.780 0.440",
    B: "0.860 0.120 0.140",
    C: "0.920 0.820 0.300",
    D: "0.100 0.400 0.720",
    E: "0.980 0.520 0.120",
    F: "0.000 0.520 0.420",
    G: "0.460 0.410 0.700",
    H: "0.300 0.720 0.760",
    I: "0.780 0.120 0.480",
    J: "0.640 0.090 0.220",
    K: "0.740 0.330 0.180",
    L: "0.370 0.260 0.620"
  };
  const cityOrder = [
    "Vancouver",
    "Seattle",
    "San Francisco Bay Area",
    "Los Angeles",
    "Guadalajara",
    "Mexico City",
    "Monterrey",
    "Houston",
    "Dallas",
    "Kansas City",
    "Atlanta",
    "Miami",
    "Toronto",
    "Boston",
    "Philadelphia",
    "New York New Jersey"
  ];
  const regionColor = (city) => {
    if (["Vancouver", "Seattle", "San Francisco Bay Area", "Los Angeles"].includes(city)) return colors.teal;
    if (["Guadalajara", "Mexico City", "Monterrey"].includes(city)) return "0.650 0.840 0.250";
    if (["Toronto", "Boston", "Philadelphia", "New York New Jersey"].includes(city)) return "0.970 0.470 0.390";
    return "0.370 0.740 0.430";
  };
  const matchFill = (match) => {
    if (match.stage !== "Group stage") return /semi|round of 16/i.test(match.stage) ? colors.teal : colors.orange;
    return groupColors[match.group] || colors.green;
  };
  const dates = [...new Set(matches.map((match) => match.date))].sort();
  const dateLabelShort = (date) => {
    const parsed = new Date(`${date}T00:00:00Z`);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(parsed);
  };
  const weekdayShort = (date) => {
    const parsed = new Date(`${date}T00:00:00Z`);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" }).format(parsed);
  };
  const ops = [];
  const setFill = (color) => `${color} rg`;
  const setStroke = (color) => `${color} RG`;
  const rect = (x, yTop, w, h, fill, stroke = "") =>
    `${fill ? `${setFill(fill)}\n` : ""}${stroke ? `${setStroke(stroke)}\n` : ""}${x.toFixed(2)} ${(pageH - yTop - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? "B" : fill ? "f" : "S"}`;
  const text = (value, x, yTop, size = 9, font = "F1", color = colors.white) =>
    `BT /${font} ${size} Tf ${setFill(color)} ${x.toFixed(2)} ${(pageH - yTop).toFixed(2)} Td (${pdfEscape(value)}) Tj ET`;
  const line = (x1, y1Top, x2, y2Top, color = colors.line, width = 0.6) =>
    `${setStroke(color)} ${width} w ${x1.toFixed(2)} ${(pageH - y1Top).toFixed(2)} m ${x2.toFixed(2)} ${(pageH - y2Top).toFixed(2)} l S`;

  const matrixOps = [];
  matrixOps.push(rect(0, 0, pageW, pageH, colors.dark));
  matrixOps.push(text("FIFA WORLD CUP 2026", 470, 42, 22, "F2", colors.white));
  matrixOps.push(text("MATCH SCHEDULE", 42, 90, 30, "F2", colors.white));
  matrixOps.push(text("wc26schedule printable planning file. Match times use ET; verify official details before travel or tickets.", 42, 126, 10, "F1", colors.muted));

  const gridX = 188;
  const cityX = 56;
  const headerY = 146;
  const gridY = 184;
  const cityW = 132;
  const gridW = pageW - gridX - 42;
  const colW = gridW / dates.length;
  const rowH = 34;
  const gridH = cityOrder.length * rowH;
  matrixOps.push(rect(cityX, gridY, cityW, gridH, "0.170 0.190 0.190", colors.line));
  matrixOps.push(rect(gridX, gridY, gridW, gridH, "0.230 0.245 0.250", colors.line));

  dates.forEach((date, index) => {
    const x = gridX + index * colW;
    const stageSample = matches.find((match) => match.date === date);
    const fill = stageSample?.stage === "Group stage" ? "0.930 0.930 0.900" : /round of 16|semi/i.test(stageSample?.stage || "") ? colors.teal : colors.orange;
    matrixOps.push(rect(x, headerY, colW, 38, fill, colors.dark));
    matrixOps.push(text(weekdayShort(date), x + 2, headerY + 12, 5.5, "F2", stageSample?.stage === "Group stage" ? colors.dark : colors.white));
    matrixOps.push(text(dateLabelShort(date), x + 2, headerY + 25, 5.5, "F1", stageSample?.stage === "Group stage" ? colors.dark : colors.white));
    matrixOps.push(line(x, gridY, x, gridY + gridH, colors.line, 0.45));
  });
  matrixOps.push(line(gridX + gridW, gridY, gridX + gridW, gridY + gridH, colors.line, 0.45));

  cityOrder.forEach((city, rowIndex) => {
    const y = gridY + rowIndex * rowH;
    matrixOps.push(rect(cityX, y, cityW, rowH, regionColor(city), colors.line));
    matrixOps.push(text(city.toUpperCase().replace("NEW YORK NEW JERSEY", "NEW YORK / NEW JERSEY"), cityX + 8, y + 22, city.length > 18 ? 8 : 10, "F2", colors.dark));
    matrixOps.push(line(cityX, y, gridX + gridW, y, colors.line, 0.6));
  });
  matrixOps.push(line(cityX, gridY + gridH, gridX + gridW, gridY + gridH, colors.line, 0.6));

  for (const match of matches) {
    const rowIndex = cityOrder.indexOf(match.city);
    const colIndex = dates.indexOf(match.date);
    if (rowIndex < 0 || colIndex < 0) continue;
    const x = gridX + colIndex * colW + 1.2;
    const y = gridY + rowIndex * rowH + 2;
    const w = Math.max(18, colW - 2.4);
    const h = rowH - 4;
    matrixOps.push(rect(x, y, w, h, matchFill(match), ""));
    matrixOps.push(text(String(match.matchNumber), x + 2, y + 7, 5.4, "F2", colors.white));
    matrixOps.push(text(match.kickoffET, x + 2, y + 14, 4.8, "F1", colors.white));
    matrixOps.push(text(compactTeamLabel(match.home).slice(0, 8), x + 2, y + 22, 5.8, "F2", colors.white));
    matrixOps.push(text(compactTeamLabel(match.away).slice(0, 8), x + 2, y + 30, 5.8, "F2", colors.white));
  }

  const legendY = 755;
  matrixOps.push(text("Group color blocks show group-stage fixtures; orange/teal blocks show knockout fixtures. City rows follow the host-city matrix style used in the official FIFA schedule reference.", 42, legendY, 9, "F1", colors.muted));
  matrixOps.push(text(`Generated ${updated} by wc26schedule | Primary source: FIFA schedule PDF`, 42, legendY + 18, 8, "F1", colors.muted));
  ops.push(matrixOps.join("\n"));

  if (includeDetails) {
    const detailRows = matches.map((match) => {
      const view = matchView(match);
      return [
        `#${match.matchNumber}`,
        match.dateLabel,
        `${match.kickoffET} ET`,
        `${compactTeamLabel(match.home)} ${match.home} v ${compactTeamLabel(match.away)} ${match.away}`,
        match.group ? `${match.stage} G${match.group}` : match.stage,
        `${match.city} - ${match.stadium}`,
        view["Venue local time"]
      ];
    });
    const rowsPerPage = 23;
    const col = [42, 86, 210, 292, 545, 675, 985];
    const headers = ["Match", "Date", "ET", "Teams", "Stage", "Venue", "Venue local"];
    for (let start = 0; start < detailRows.length; start += rowsPerPage) {
      const pageOps = [];
      pageOps.push(rect(0, 0, pageW, pageH, "0.970 0.980 0.955"));
      pageOps.push(rect(0, 0, pageW, 72, colors.dark));
      pageOps.push(text("World Cup 2026 Match Schedule Details", 42, 44, 18, "F2", colors.white));
      pageOps.push(text(`Rows ${start + 1}-${Math.min(start + rowsPerPage, detailRows.length)} of ${detailRows.length}`, 1000, 44, 10, "F2", colors.gold));
      pageOps.push(rect(36, 92, 1120, 28, colors.green));
      headers.forEach((header, index) => pageOps.push(text(header, col[index], 111, 8, "F2", colors.white)));
      detailRows.slice(start, start + rowsPerPage).forEach((row, rowIndex) => {
        const y = 126 + rowIndex * 28;
        pageOps.push(rect(36, y, 1120, 27, rowIndex % 2 === 0 ? "1 1 1" : "0.940 0.965 0.940", "0.820 0.870 0.830"));
        row.forEach((cell, index) => {
          const size = index === 3 || index === 5 ? 7.2 : 7.8;
          pageOps.push(text(String(cell).slice(0, index === 5 ? 44 : index === 3 ? 48 : 28), col[index], y + 17, size, index === 0 ? "F2" : "F1", colors.dark));
        });
      });
      pageOps.push(text("Source note: schedule data follows the structured wc26schedule dataset based on FIFA source material. Confirm final details with official FIFA channels before paid planning.", 42, 792, 8, "F1", "0.290 0.360 0.340"));
      ops.push(pageOps.join("\n"));
    }
  }

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds = [];
  for (const content of ops) {
    const streamId = addObject(`<< /Length ${Buffer.byteLength(content, "binary")} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent PARENT_PLACEHOLDER /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  for (const pageId of pageIds) {
    objects[pageId - 1] = objects[pageId - 1].replace("PARENT_PLACEHOLDER", `${pagesId} 0 R`);
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

const generateStageOverviewPdf = () => {
  const pageW = 1191;
  const pageH = 842;
  const colors = {
    dark: "0.050 0.120 0.200",
    darkAlt: "0.080 0.170 0.280",
    line: "0.600 0.720 0.820",
    white: "1 1 1",
    muted: "0.760 0.860 0.920",
    gold: "0.847 0.651 0.235",
    green: "0.090 0.520 0.390",
    teal: "0.310 0.720 0.700",
    orange: "0.960 0.420 0.090"
  };
  const stageColors = {
    "Round of 32": colors.orange,
    "Round of 16": colors.teal,
    "Quarter-finals": "0.960 0.500 0.160",
    "Semi-finals": "0.260 0.690 0.680",
    "Third-place play-off": "0.720 0.560 0.120",
    Final: "0.980 0.820 0.280"
  };
  const groupColors = {
    A: "0.300 0.720 0.360",
    B: "0.920 0.120 0.140",
    C: "0.920 0.820 0.300",
    D: "0.100 0.400 0.720",
    E: "0.980 0.520 0.120",
    F: "0.000 0.520 0.420",
    G: "0.460 0.410 0.700",
    H: "0.300 0.720 0.760",
    I: "0.780 0.120 0.480",
    J: "0.640 0.090 0.220",
    K: "0.740 0.330 0.180",
    L: "0.370 0.260 0.620"
  };
  const cityOrder = [
    "Vancouver",
    "Seattle",
    "San Francisco Bay Area",
    "Los Angeles",
    "Guadalajara",
    "Mexico City",
    "Monterrey",
    "Houston",
    "Dallas",
    "Kansas City",
    "Atlanta",
    "Miami",
    "Toronto",
    "Boston",
    "Philadelphia",
    "New York New Jersey"
  ];
  const regionColor = (city) => {
    if (["Vancouver", "Seattle", "San Francisco Bay Area", "Los Angeles"].includes(city)) return "0.080 0.360 0.560";
    if (["Guadalajara", "Mexico City", "Monterrey"].includes(city)) return "0.090 0.480 0.280";
    if (["Toronto", "Boston", "Philadelphia", "New York New Jersey"].includes(city)) return "0.780 0.160 0.180";
    return "0.130 0.450 0.660";
  };
  const dateLabelShort = (date) => {
    const parsed = new Date(`${date}T00:00:00Z`);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(parsed);
  };
  const weekdayShort = (date) => {
    const parsed = new Date(`${date}T00:00:00Z`);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" }).format(parsed);
  };
  const venueLocalHour = (match) => (matchView(match)["Venue local time"] || "").split(" ")[1] || match.kickoffET;
  const setFill = (color) => `${color} rg`;
  const setStroke = (color) => `${color} RG`;
  const rect = (x, yTop, w, h, fill, stroke = "") =>
    `${fill ? `${setFill(fill)}\n` : ""}${stroke ? `${setStroke(stroke)}\n` : ""}${x.toFixed(2)} ${(pageH - yTop - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? "B" : fill ? "f" : "S"}`;
  const text = (value, x, yTop, size = 9, font = "F1", color = colors.white) =>
    `BT /${font} ${size} Tf ${setFill(color)} ${x.toFixed(2)} ${(pageH - yTop).toFixed(2)} Td (${pdfEscape(value)}) Tj ET`;
  const line = (x1, y1Top, x2, y2Top, color = colors.line, width = 0.5) =>
    `${setStroke(color)} ${width} w ${x1.toFixed(2)} ${(pageH - y1Top).toFixed(2)} m ${x2.toFixed(2)} ${(pageH - y2Top).toFixed(2)} l S`;
  const blockColor = (match) => (match.stage === "Group stage" ? groupColors[match.group] || colors.green : stageColors[match.stage] || colors.orange);

  const pageOpsFor = ({ title, subtitle, pageMatches, note }) => {
    const dates = [...new Set(pageMatches.map((match) => match.date))].sort();
    const gridX = 208;
    const cityX = 64;
    const headerY = 210;
    const gridY = 250;
    const cityW = 144;
    const gridW = pageW - gridX - 58;
    const colW = gridW / dates.length;
    const rowH = 29;
    const gridH = cityOrder.length * rowH;
    const ops = [];
    ops.push(rect(0, 0, pageW, pageH, colors.dark));
    ops.push(rect(0, 0, pageW, 160, colors.darkAlt));
    ops.push(text("wc26schedule", 64, 66, 13, "F2", colors.gold));
    ops.push(text(title, 64, 105, 34, "F2", colors.white));
    ops.push(text(subtitle, 64, 136, 10, "F1", colors.muted));
    ops.push(text(note, 64, 186, 10, "F2", colors.white));

    dates.forEach((date, index) => {
      const x = gridX + index * colW;
      ops.push(text(weekdayShort(date), x + 3, headerY + 12, 6.2, "F2", colors.white));
      ops.push(text(dateLabelShort(date), x + 3, headerY + 26, 6.2, "F1", colors.muted));
      ops.push(line(x, gridY, x, gridY + gridH, "0.220 0.360 0.480", 0.45));
    });
    ops.push(line(gridX + gridW, gridY, gridX + gridW, gridY + gridH, "0.220 0.360 0.480", 0.45));

    cityOrder.forEach((city, rowIndex) => {
      const y = gridY + rowIndex * rowH;
      ops.push(rect(cityX, y, cityW, rowH, regionColor(city), ""));
      ops.push(text(city.toUpperCase().replace("NEW YORK NEW JERSEY", "NEW YORK"), cityX + 8, y + 18, city.length > 18 ? 7 : 9, "F2", colors.white));
      ops.push(line(cityX, y, gridX + gridW, y, city.includes("Toronto") || city.includes("Atlanta") || city.includes("Guadalajara") ? "0.800 0.180 0.220" : "0.230 0.410 0.560", 0.5));
    });
    ops.push(line(cityX, gridY + gridH, gridX + gridW, gridY + gridH, "0.230 0.410 0.560", 0.5));

    for (const match of pageMatches) {
      const rowIndex = cityOrder.indexOf(match.city);
      const colIndex = dates.indexOf(match.date);
      if (rowIndex < 0 || colIndex < 0) continue;
      const x = gridX + colIndex * colW + 2;
      const y = gridY + rowIndex * rowH + 3;
      const w = Math.max(30, colW - 4);
      const h = rowH - 6;
      const matchup = `${compactTeamLabel(match.home)} v ${compactTeamLabel(match.away)}`;
      ops.push(rect(x, y, w, h, blockColor(match), ""));
      ops.push(text(`M${match.matchNumber}`, x + 3, y + 7, 5.6, "F2", colors.white));
      ops.push(text(matchup.slice(0, 14), x + 3, y + 15, 5.4, "F2", colors.white));
      ops.push(text(venueLocalHour(match), x + 3, y + 22, 5.2, "F1", colors.white));
    }

    const groups = "Group A-L colors and knockout-stage blocks are generated from wc26schedule data. Times shown as venue local time.";
    ops.push(text(groups, 64, 748, 9, "F1", colors.muted));
    ops.push(text(`Generated ${updated}. Confirm official details before travel, tickets or paid planning.`, 64, 770, 8, "F1", colors.muted));
    return ops.join("\n");
  };

  const ops = [
    pageOpsFor({
      title: "World Cup 2026 Group Stage Schedule",
      subtitle: "Host-city grid for matches M1-M72, grouped by local match date and city.",
      note: "Group Stage Fixtures",
      pageMatches: matches.filter((match) => match.stage === "Group stage"),
    }),
    pageOpsFor({
      title: "World Cup 2026 Knockout Stage Schedule",
      subtitle: "Round of 32 through Final, organized by host city and local match date.",
      note: "Knockout Stage Matches",
      pageMatches: matches.filter((match) => match.stage !== "Group stage"),
    })
  ];

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds = [];
  for (const content of ops) {
    const streamId = addObject(`<< /Length ${Buffer.byteLength(content, "binary")} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent PARENT_PLACEHOLDER /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R >>`
    );
    pageIds.push(pageId);
  }
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  for (const pageId of pageIds) {
    objects[pageId - 1] = objects[pageId - 1].replace("PARENT_PLACEHOLDER", `${pagesId} 0 R`);
  }
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await write("downloads/world-cup-2026-schedule.csv", scheduleCsv());
await write("downloads/world-cup-2026-schedule.xls", scheduleSpreadsheetHtml());
await write("downloads/world-cup-2026-schedule.pdf", generatePdf());
await write("downloads/world-cup-2026-schedule-overview.pdf", generatePdf({ includeDetails: false }));
await write("downloads/world-cup-2026-stage-overview.pdf", generateStageOverviewPdf());
for (const [source, target] of siteAssetFiles) {
  const targetPath = join(dist, target);
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(join(root, source), targetPath);
}
await write(
  "schedule.js",
  `(() => {
  const rows = Array.from(document.querySelectorAll("[data-match-row]"));
  if (!rows.length) return;
  const dateView = document.querySelector('[data-schedule-view="date"]');
  const teamView = document.querySelector('[data-schedule-view="team"]');
  const cityView = document.querySelector('[data-schedule-view="city"]');
  const views = Array.from(document.querySelectorAll("[data-schedule-view]"));
  const viewButtons = Array.from(document.querySelectorAll("[data-view-toggle]"));
  const timezoneSelect = document.querySelector("[data-timezone-select]");
  const timezoneSummary = document.querySelector("[data-timezone-summary]");
  const activeContext = document.querySelector("[data-active-context]");
  const activeFilters = document.querySelector("[data-active-filters]");
  const clearButtons = Array.from(document.querySelectorAll("[data-clear-filters]"));
  const emptyState = document.querySelector("[data-empty-state]");
  const localDateRange = document.querySelector("[data-local-date-range]");
  const currentTime = document.querySelector("[data-current-time]");
  const nextCountdown = document.querySelector("[data-next-countdown]");
  const nextMatchLabel = document.querySelector("[data-next-match-label]");
  const nextHome = document.querySelector("[data-next-home]");
  const nextAway = document.querySelector("[data-next-away]");
  const nextMeta = document.querySelector("[data-next-meta]");
  const nextDetail = document.querySelector("[data-next-detail]");
  const nextDays = document.querySelector("[data-next-days]");
  const nextHours = document.querySelector("[data-next-hours]");
  const nextMinutes = document.querySelector("[data-next-minutes]");
  const nextSeconds = document.querySelector("[data-next-seconds]");
  const upcomingRail = document.querySelector("[data-upcoming-rail]");
  const upcomingRange = document.querySelector("[data-upcoming-range]");
  const upcomingScope = document.querySelector("[data-upcoming-scope]");
  const upcomingPrev = document.querySelector("[data-upcoming-prev]");
  const upcomingNext = document.querySelector("[data-upcoming-next]");
  const upcomingViewAll = document.querySelector("[data-upcoming-view-all]");
  const timezoneStorageKey = "wc26schedule-timezone";
  const nowOverride = Date.parse(document.documentElement.dataset.now || "");
  let activeView = "table";
  let cards = [];
  let dateGroups = [];
  let aggregateCards = [];
  let aggregateMatches = [];
  let upcomingPage = 0;
  let upcomingFilterSignature = "";
  let upcomingRenderSignature = "";
  let upcomingTotal = 0;
  let upcomingNeedsScroll = false;

  const search = document.querySelector("[data-filter-search]");
  const stage = document.querySelector("[data-filter-stage]");
  const group = document.querySelector("[data-filter-group]");
  const date = document.querySelector("[data-filter-date]");
  const city = document.querySelector("[data-filter-city]");
  const team = document.querySelector("[data-filter-team]");
  const count = document.querySelector("[data-schedule-count]");

  const readSavedTimezone = () => {
    try {
      return window.localStorage.getItem(timezoneStorageKey);
    } catch {
      return "";
    }
  };

  const saveTimezone = (timezone) => {
    try {
      window.localStorage.setItem(timezoneStorageKey, timezone);
    } catch {}
  };

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
  if (timezoneSelect && !Array.from(timezoneSelect.options).some((option) => option.value === detectedTimezone)) {
    timezoneSelect.add(new Option(detectedTimezone.replaceAll("_", " "), detectedTimezone), 1);
  }
  if (timezoneSelect) {
    const savedTimezone = readSavedTimezone();
    timezoneSelect.value = Array.from(timezoneSelect.options).some((option) => option.value === savedTimezone)
      ? savedTimezone
      : detectedTimezone;
  }

  const selectedTimezone = () => timezoneSelect?.value || detectedTimezone || "America/New_York";
  const now = () => (Number.isNaN(nowOverride) ? new Date() : new Date(nowOverride));

  const localDateKey = (date, timezone) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return value.year + "-" + value.month + "-" + value.day;
  };

  const localDateLabel = (date, timezone) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);

  const localTimeLabel = (date, timezone) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }).format(date);

  const compactTimeLabel = (date, timezone) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }).format(date);

  const localHour = (date, timezone) => {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(date)
      .find((item) => item.type === "hour");
    return Number(part?.value || 0);
  };

  const watchWindow = (hour) => {
    if (hour >= 17 && hour <= 21) return ["Prime time", "prime"];
    if (hour >= 12 && hour <= 16) return ["Afternoon", "afternoon"];
    if (hour >= 6 && hour <= 11) return ["Morning", "morning"];
    if (hour >= 22 || hour <= 1) return ["Late night", "late"];
    return ["Overnight", "overnight"];
  };

  const countdownLabel = (target, reference = now()) => {
    const diff = target - reference;
    if (diff <= 0) return "Kickoff time reached";
    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return days + "d " + hours + "h";
    if (hours > 0) return hours + "h " + minutes + "m";
    return minutes + "m";
  };

  const countdownParts = (target, reference = now()) => {
    const diff = Math.max(0, target - reference);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const setCountdownParts = (target, reference = now()) => {
    const parts = countdownParts(target, reference);
    if (nextDays) nextDays.textContent = String(parts.days).padStart(2, "0");
    if (nextHours) nextHours.textContent = String(parts.hours).padStart(2, "0");
    if (nextMinutes) nextMinutes.textContent = String(parts.minutes).padStart(2, "0");
    if (nextSeconds) nextSeconds.textContent = String(parts.seconds).padStart(2, "0");
  };

  const matchStatusLabel = (target, reference = now()) => {
    const diffMinutes = Math.floor((target - reference) / 60000);
    if (diffMinutes <= -120) return "Completed or in progress";
    if (diffMinutes <= 0) return "Kickoff time reached";
    if (diffMinutes <= 60) return "Starts in " + diffMinutes + "m";
    if (diffMinutes < 1440) return "Starts in " + Math.floor(diffMinutes / 60) + "h";
    return "Starts in " + Math.floor(diffMinutes / 1440) + "d";
  };

  const filterValues = () => ({
    searchValue: (search?.value || "").trim().toLowerCase(),
    stageValue: stage?.value || "",
    groupValue: group?.value || "",
    dateValue: date?.value || "",
    cityValue: city?.value || "",
    teamValue: team?.value || ""
  });

  const rowMatchesCurrentFilters = (row) => {
    const values = filterValues();
    const matchesSearch = !values.searchValue || row.dataset.search.includes(values.searchValue);
    const matchesStage = !values.stageValue || row.dataset.stage === values.stageValue;
    const matchesGroup = !values.groupValue || row.dataset.group === values.groupValue;
    const matchesDate = !values.dateValue || row.dataset.localDate === values.dateValue;
    const matchesCity = !values.cityValue || row.dataset.city === values.cityValue;
    const matchesTeam = !values.teamValue || row.dataset.home === values.teamValue || row.dataset.away === values.teamValue;
    return matchesSearch && matchesStage && matchesGroup && matchesDate && matchesCity && matchesTeam;
  };

  const upcomingScopeLabel = () => {
    const values = filterValues();
    const pieces = [];
    if (values.teamValue) pieces.push(values.teamValue);
    if (values.cityValue) pieces.push(values.cityValue);
    if (values.stageValue) pieces.push(values.stageValue);
    if (values.groupValue) pieces.push("Group " + values.groupValue);
    if (values.dateValue && date?.selectedOptions?.[0]) pieces.push(date.selectedOptions[0].textContent);
    if (values.searchValue) pieces.push("search: " + (search?.value || "").trim());
    return pieces.length
      ? "Filtered upcoming matches for " + pieces.join(" / ") + "."
      : "Showing upcoming matches from the full schedule.";
  };

  const activeUpcomingSignature = () => JSON.stringify(filterValues());

  const upcomingPageSize = () => {
    if (window.matchMedia("(max-width: 860px)").matches) return 1;
    if (window.matchMedia("(max-width: 1100px)").matches) return 2;
    return 4;
  };

  const updateUpcomingControls = () => {
    const size = upcomingPageSize();
    const maxPage = Math.max(0, Math.ceil(upcomingTotal / size) - 1);
    upcomingPage = Math.min(Math.max(0, upcomingPage), maxPage);
    const start = upcomingTotal ? upcomingPage * size : 0;
    const end = Math.min(start + size, upcomingTotal);
    if (upcomingRange) {
      upcomingRange.textContent = upcomingTotal
        ? "Showing " + (start + 1) + "-" + end + " of " + upcomingTotal
        : "No upcoming matches";
    }
    if (upcomingPrev) upcomingPrev.disabled = upcomingPage === 0 || upcomingTotal === 0;
    if (upcomingNext) upcomingNext.disabled = upcomingPage >= maxPage || upcomingTotal === 0;
  };

  const scrollUpcomingRailToPage = (behavior = "smooth") => {
    if (!upcomingRail) return;
    const start = upcomingPage * upcomingPageSize();
    const target = upcomingRail.querySelector('[data-upcoming-index="' + start + '"]');
    if (!target) {
      upcomingRail.scrollTo({ left: 0, behavior });
      return;
    }
    upcomingRail.scrollTo({ left: target.offsetLeft - upcomingRail.offsetLeft, behavior });
  };

  const syncUpcomingPageFromScroll = () => {
    if (!upcomingRail || !upcomingTotal) return;
    const cards = Array.from(upcomingRail.querySelectorAll("[data-upcoming-index]"));
    if (!cards.length) return;
    const size = upcomingPageSize();
    const railLeft = upcomingRail.scrollLeft;
    const nearest = cards.reduce(
      (best, card) => {
        const distance = Math.abs(card.offsetLeft - upcomingRail.offsetLeft - railLeft);
        return distance < best.distance ? { distance, index: Number(card.dataset.upcomingIndex || 0) } : best;
      },
      { distance: Infinity, index: 0 }
    );
    upcomingPage = Math.floor(nearest.index / size);
    updateUpcomingControls();
  };

  const renderUpcomingRail = (upcomingMatches, timezone) => {
    if (!upcomingRail) return;
    upcomingTotal = upcomingMatches.length;

    if (upcomingScope) upcomingScope.textContent = upcomingScopeLabel();

    if (!upcomingMatches.length) {
      upcomingRenderSignature = "empty";
      upcomingRail.innerHTML =
        '<article class="upcoming-empty"><strong>No upcoming matches match the active filters.</strong><span>Clear filters or switch to the full schedule table to continue browsing.</span></article>';
      updateUpcomingControls();
      return;
    }

    const renderSignature =
      timezone + "|" + upcomingMatches.map(({ row }) => row.dataset.matchNumber).join(",");
    if (renderSignature !== upcomingRenderSignature) {
      upcomingRenderSignature = renderSignature;
      upcomingRail.innerHTML = upcomingMatches
        .map(({ row, kickoff }, index) => {
        const cells = row.querySelectorAll("td");
        const home = teamHtml(row, cells, "home");
        const away = teamHtml(row, cells, "away");
        return (
          '<article class="upcoming-match-card" data-upcoming-index="' +
          index +
          '">' +
          '<div class="upcoming-card-top"><span class="stage-pill">' +
          row.dataset.stage +
          (row.dataset.group ? " - Group " + row.dataset.group : "") +
          '</span><span>#' +
          row.dataset.matchNumber +
          '</span></div><div class="upcoming-teams">' +
          home +
          '<span>vs</span>' +
          away +
          '</div><div class="upcoming-card-meta"><strong>' +
          localTimeLabel(kickoff, timezone) +
          '</strong><span class="watch-tag" data-watch-type="' +
          row.dataset.watchType +
          '">' +
          row.dataset.watchWindow +
          '</span><small>' +
          row.dataset.city +
          " - " +
          escapeHtml(cells[9].textContent.trim()) +
          '</small></div><div class="upcoming-card-actions"><a href="' +
          row.dataset.detailUrl +
          '">Match details -></a><span>' +
          countdownLabel(kickoff) +
          '</span></div></article>'
        );
      })
      .join("");
    } else {
      upcomingMatches.forEach(({ kickoff }, index) => {
        const countdown = upcomingRail.querySelector('[data-upcoming-index="' + index + '"] .upcoming-card-actions span');
        if (countdown) countdown.textContent = countdownLabel(kickoff);
      });
    }
    updateUpcomingControls();
    if (upcomingNeedsScroll) {
      scrollUpcomingRailToPage(upcomingPage === 0 ? "auto" : "smooth");
      upcomingNeedsScroll = false;
    }
  };

  const updateLiveTime = () => {
    const timezone = selectedTimezone();
    const current = now();
    const nextFilterSignature = activeUpcomingSignature();
    if (nextFilterSignature !== upcomingFilterSignature) {
      upcomingFilterSignature = nextFilterSignature;
      upcomingPage = 0;
      upcomingNeedsScroll = true;
    }
    if (currentTime) currentTime.textContent = compactTimeLabel(current, timezone);
    const allUpcomingMatches = rows
      .map((row) => ({ row, kickoff: new Date(row.dataset.kickoffUtc) }))
      .filter((item) => item.kickoff > current)
      .sort((a, b) => a.kickoff - b.kickoff);
    const upcomingMatches = allUpcomingMatches.filter(({ row }) => rowMatchesCurrentFilters(row));
    const upcoming = upcomingMatches[0];
    if (upcoming) {
      if (nextCountdown) nextCountdown.textContent = countdownLabel(upcoming.kickoff, current);
      setCountdownParts(upcoming.kickoff, current);
      if (nextHome) nextHome.textContent = upcoming.row.dataset.home;
      if (nextAway) nextAway.textContent = upcoming.row.dataset.away;
      if (nextMeta) {
        nextMeta.textContent =
          localTimeLabel(upcoming.kickoff, timezone) +
          " - " +
          upcoming.row.dataset.city +
          " - " +
          upcoming.row.querySelectorAll("td")[9].textContent.trim();
      }
      if (nextDetail) nextDetail.setAttribute("href", upcoming.row.dataset.detailUrl || "#match-" + upcoming.row.dataset.matchNumber);
      if (nextMatchLabel) {
        nextMatchLabel.textContent =
          "Match " +
          upcoming.row.dataset.matchNumber +
          ": " +
          upcoming.row.dataset.home +
          " vs " +
          upcoming.row.dataset.away +
          " - " +
          localTimeLabel(upcoming.kickoff, timezone);
      }
      renderUpcomingRail(upcomingMatches, timezone);
    } else {
      const fallbackUpcoming = allUpcomingMatches[0];
      if (nextCountdown) nextCountdown.textContent = fallbackUpcoming ? "No filtered match" : "Tournament complete";
      if (nextMatchLabel) {
        nextMatchLabel.textContent = fallbackUpcoming
          ? "No future matches match the active filters."
          : "No future matches remain in the current schedule data.";
      }
      if (nextHome) nextHome.textContent = fallbackUpcoming ? "No filtered" : "Tournament";
      if (nextAway) nextAway.textContent = fallbackUpcoming ? "match" : "complete";
      if (nextMeta) {
        nextMeta.textContent = fallbackUpcoming
          ? "Clear filters to return to the next match in the full schedule."
          : "No future matches remain in the current schedule data.";
      }
      setCountdownParts(current, current);
      renderUpcomingRail([], timezone);
    }
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const teamHtml = (row, cells, side) => {
    const links = cells[3].querySelectorAll("a");
    const fallback = side === "home" ? row.dataset.home : row.dataset.away;
    const sourceChip = links[side === "home" ? 0 : 1];
    const label = side === "home" ? "Home" : "Away";
    const code = escapeHtml(sourceChip?.querySelector("b")?.textContent || fallback.slice(0, 3).toUpperCase());
    return sourceChip
      ? sourceChip.outerHTML
      : '<span class="team-chip is-placeholder"><span>' + label + '</span><em><b>' + code + '</b><strong>' + escapeHtml(fallback) + '</strong></em></span>';
  };

  const chipName = (chip) => chip?.querySelector("strong")?.textContent?.trim() || "";
  const chipCode = (chip) => chip?.querySelector("b")?.textContent?.trim() || "";
  const chipPath = (chip) => chip?.getAttribute("href") || "";
  const sortedRows = () => [...rows].sort((a, b) => new Date(a.dataset.kickoffUtc) - new Date(b.dataset.kickoffUtc));

  const aggregateMatchShell = (row, type) => {
    const item = document.createElement("article");
    item.className = "aggregate-match";
    item.dataset.aggregateMatch = "";
    item.dataset.aggregateType = type;
    copyMatchData(row, item);
    return item;
  };

  const buildTeamView = () => {
    if (!teamView) return;
    teamView.innerHTML = "";
    const groups = new Map();

    for (const row of sortedRows()) {
      const cells = row.querySelectorAll("td");
      const chips = Array.from(cells[3].querySelectorAll("a.team-chip"));
      for (const chip of chips) {
        const name = chipName(chip);
        if (!name) continue;
        if (!groups.has(name)) {
          groups.set(name, {
            name,
            code: chipCode(chip),
            chip: chip.outerHTML,
            path: chipPath(chip),
            rows: []
          });
        }
        groups.get(name).rows.push(row);
      }
    }

    const intro = document.createElement("div");
    intro.className = "aggregate-view-heading";
    intro.innerHTML =
      '<div><p class="eyebrow">Team view</p><h3>Confirmed Team Schedules</h3></div><span><span data-team-group-count>' +
      groups.size +
      '</span> teams</span>';
    teamView.append(intro);

    const grid = document.createElement("div");
    grid.className = "aggregate-card-grid";

    for (const group of [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))) {
      const cities = new Set(group.rows.map((row) => row.dataset.city));
      const stages = new Set(group.rows.map((row) => row.dataset.stage));
      const card = document.createElement("section");
      card.className = "aggregate-card team-aggregate-card";
      card.dataset.aggregateCard = "";
      card.dataset.aggregateType = "team";
      card.dataset.teamGroup = group.name;
      card.dataset.search = (group.name + " " + group.code + " " + [...cities].join(" ") + " " + [...stages].join(" ")).toLowerCase();
      card.innerHTML =
        '<div class="aggregate-card-header"><div>' +
        group.chip +
        '</div><dl class="aggregate-stats"><div><dt>Matches</dt><dd data-aggregate-count>' +
        group.rows.length +
        '</dd></div><div><dt>Cities</dt><dd>' +
        cities.size +
        '</dd></div></dl></div><div class="aggregate-match-list"></div><div class="aggregate-actions">' +
        (group.path ? '<a href="' + group.path + '">Open team page</a>' : "") +
        '</div>';
      const list = card.querySelector(".aggregate-match-list");

      for (const row of group.rows) {
        const cells = row.querySelectorAll("td");
        const isHome = row.dataset.home === group.name;
        const opponent = isHome ? row.dataset.away : row.dataset.home;
        const opponentChip = teamHtml(row, cells, isHome ? "away" : "home");
        const item = aggregateMatchShell(row, "team");
        item.dataset.teamGroup = group.name;
        item.innerHTML =
          '<div><strong>Match ' +
          row.dataset.matchNumber +
          '</strong><span>' +
          row.dataset.stage +
          (row.dataset.group ? " - Group " + row.dataset.group : "") +
          '</span></div><div class="aggregate-opponent"><span>' +
          (isHome ? "vs" : "at") +
          '</span>' +
          opponentChip +
          '</div><div class="aggregate-time"><strong>' +
          row.dataset.localTimeValue +
          '</strong><span class="watch-tag" data-watch-type="' +
          row.dataset.watchType +
          '">' +
          row.dataset.watchWindow +
          '</span></div><div class="aggregate-place"><a href="' +
          cells[8].querySelector("a").getAttribute("href") +
          '">' +
          row.dataset.city +
          '</a><span>' +
          escapeHtml(cells[9].textContent.trim()) +
          '</span><a href="' +
          row.dataset.detailUrl +
          '">Match details</a></div>';
        list.append(item);
      }

      grid.append(card);
    }

    teamView.append(grid);
  };

  const buildCityView = () => {
    if (!cityView) return;
    cityView.innerHTML = "";
    const groups = new Map();

    for (const row of sortedRows()) {
      const cells = row.querySelectorAll("td");
      const cityName = row.dataset.city;
      if (!groups.has(cityName)) {
        groups.set(cityName, {
          name: cityName,
          path: cells[8].querySelector("a").getAttribute("href"),
          stadiums: new Set(),
          stages: new Set(),
          rows: []
        });
      }
      const group = groups.get(cityName);
      group.stadiums.add(cells[9].textContent.trim());
      group.stages.add(row.dataset.stage);
      group.rows.push(row);
    }

    const intro = document.createElement("div");
    intro.className = "aggregate-view-heading";
    intro.innerHTML =
      '<div><p class="eyebrow">City view</p><h3>Host City Match Groups</h3></div><span><span data-city-group-count>' +
      groups.size +
      '</span> cities</span>';
    cityView.append(intro);

    const grid = document.createElement("div");
    grid.className = "aggregate-card-grid city-card-grid";

    for (const group of [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))) {
      const card = document.createElement("section");
      card.className = "aggregate-card city-aggregate-card";
      card.dataset.aggregateCard = "";
      card.dataset.aggregateType = "city";
      card.dataset.cityGroup = group.name;
      card.dataset.search = (group.name + " " + [...group.stadiums].join(" ") + " " + [...group.stages].join(" ")).toLowerCase();
      card.innerHTML =
        '<div class="aggregate-card-header city-card-header"><div><p class="eyebrow">Host city</p><h3><a href="' +
        group.path +
        '">' +
        group.name +
        '</a></h3><p>' +
        [...group.stadiums].map(escapeHtml).join(", ") +
        '</p></div><dl class="aggregate-stats"><div><dt>Matches</dt><dd data-aggregate-count>' +
        group.rows.length +
        '</dd></div><div><dt>Stages</dt><dd>' +
        group.stages.size +
        '</dd></div></dl></div><div class="aggregate-match-list"></div><div class="aggregate-actions"><a href="' +
        group.path +
        '">Open city guide</a></div>';
      const list = card.querySelector(".aggregate-match-list");

      for (const row of group.rows) {
        const cells = row.querySelectorAll("td");
        const item = aggregateMatchShell(row, "city");
        item.dataset.cityGroup = group.name;
        item.innerHTML =
          '<div><strong>Match ' +
          row.dataset.matchNumber +
          '</strong><span>' +
          row.dataset.stage +
          (row.dataset.group ? " - Group " + row.dataset.group : "") +
          '</span></div><div class="aggregate-matchup">' +
          cells[3].innerHTML +
          '</div><div class="aggregate-time"><strong>' +
          row.dataset.localTimeValue +
          '</strong><span class="watch-tag" data-watch-type="' +
          row.dataset.watchType +
          '">' +
          row.dataset.watchWindow +
          '</span></div><div class="aggregate-place"><span>' +
          escapeHtml(cells[9].textContent.trim()) +
          '</span><a href="' +
          row.dataset.detailUrl +
          '">Match details</a></div>';
        list.append(item);
      }

      grid.append(card);
    }

    cityView.append(grid);
  };

  const buildAggregateViews = () => {
    buildTeamView();
    buildCityView();
    aggregateCards = Array.from(document.querySelectorAll("[data-aggregate-card]"));
    aggregateMatches = Array.from(document.querySelectorAll("[data-aggregate-match]"));
  };

  const syncDateOptions = () => {
    if (!date) return;
    const currentValue = date.value;
    const options = new Map();
    for (const row of rows) {
      if (row.dataset.localDate) options.set(row.dataset.localDate, row.dataset.localDateLabel || row.dataset.localDate);
    }
    date.innerHTML = '<option value="">All local dates</option>';
    for (const [value, label] of [...options.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      date.add(new Option(label, value));
    }
    date.value = options.has(currentValue) ? currentValue : "";
    if (localDateRange) {
      const values = [...options.values()];
      localDateRange.textContent = values.length
        ? values[0] + " to " + values[values.length - 1]
        : "Dates follow your selected timezone.";
    }
  };

  const updateTimeDisplays = () => {
    const timezone = selectedTimezone();
    for (const row of rows) {
      const kickoff = new Date(row.dataset.kickoffUtc);
      const hour = localHour(kickoff, timezone);
      const [label, type] = watchWindow(hour);
      row.dataset.localDate = localDateKey(kickoff, timezone);
      row.dataset.localDateLabel = localDateLabel(kickoff, timezone);
      row.dataset.localTimeValue = localTimeLabel(kickoff, timezone);
      row.dataset.watchWindow = label;
      row.dataset.watchType = type;
      row.dataset.matchStatus = matchStatusLabel(kickoff);
      const localTime = row.querySelector("[data-local-time]");
      const watchTag = row.querySelector("[data-watch-tag]");
      if (localTime) localTime.textContent = row.dataset.localTimeValue;
      if (watchTag) {
        watchTag.textContent = label;
        watchTag.dataset.watchType = type;
      }
    }
    updateLiveTime();
    if (timezoneSummary) {
      timezoneSummary.textContent =
        "Showing local kickoff times in " +
        timezone.replaceAll("_", " ") +
        ". The date filter and Date cards both use this local date.";
    }
  };

  const controlLabel = (control) => {
    if (!control?.value) return "";
    if (control.tagName === "SELECT") return control.selectedOptions[0]?.textContent || control.value;
    return control.value;
  };

  const updateActiveFilters = () => {
    if (!activeFilters) return;
    const filters = [
      ["Search", search, "search"],
      ["Stage", stage, "stage"],
      ["Group", group, "group"],
      ["Local date", date, "date"],
      ["City", city, "city"],
      ["Team", team, "team"]
    ].filter(([, control]) => control?.value);

    activeFilters.innerHTML = filters.length
      ? filters
          .map(
            ([label, control, key]) =>
              '<button type="button" data-clear-filter="' +
              key +
              '">' +
              label +
              ": " +
              escapeHtml(controlLabel(control)) +
              "</button>"
          )
          .join("")
      : '<span>No filters active</span>';
  };

  const copyMatchData = (source, target) => {
    [
      "matchNumber",
      "stage",
      "group",
      "date",
      "dateLabel",
      "kickoffUtc",
      "detailUrl",
      "localDate",
      "localDateLabel",
      "localTimeValue",
      "watchWindow",
      "watchType",
      "matchStatus",
      "city",
      "home",
      "away",
      "search"
    ].forEach((key) => {
      target.dataset[key] = source.dataset[key] || "";
    });
  };

  const buildDateCards = () => {
    if (!dateView) return;
    dateView.innerHTML = "";
    const groups = new Map();
    const sortedRows = [...rows].sort(
      (a, b) => new Date(a.dataset.kickoffUtc) - new Date(b.dataset.kickoffUtc)
    );
    for (const row of sortedRows) {
      const date = row.dataset.localDate || row.dataset.date;
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date).push(row);
    }

    for (const [date, groupRows] of groups.entries()) {
      const section = document.createElement("section");
      section.className = "date-group";
      section.dataset.dateGroup = "";
      section.dataset.dateValue = date;
      section.innerHTML =
        '<div class="date-group-heading">' +
        '<div><p class="eyebrow">' +
        date +
        '</p><h3>' +
        (groupRows[0].dataset.localDateLabel || groupRows[0].dataset.dateLabel || date) +
        '</h3></div><span><span data-date-count>' +
        groupRows.length +
        '</span> matches</span></div><div class="match-card-grid"></div>';
      const grid = section.querySelector(".match-card-grid");

      for (const row of groupRows) {
        const cells = row.querySelectorAll("td");
        const home = teamHtml(row, cells, "home");
        const away = teamHtml(row, cells, "away");
        const article = document.createElement("article");
        article.className = "match-card";
        article.dataset.matchCard = "";
        copyMatchData(row, article);
        article.innerHTML =
          '<div class="match-card-top"><strong class="match-number-badge">Match ' +
          row.dataset.matchNumber +
          '</strong><span class="stage-pill">' +
          row.dataset.stage +
          (row.dataset.group ? " - Group " + row.dataset.group : "") +
          '</span></div><div class="match-card-teams">' +
          '<div class="team-line">' +
          home +
          '</div><span>vs</span><div class="team-line">' +
          away +
          '</div></div><div class="match-card-time"><strong data-card-local-time>' +
          row.dataset.localTimeValue +
          '</strong><span class="watch-tag" data-watch-type="' +
          row.dataset.watchType +
          '">' +
          row.dataset.watchWindow +
          '</span></div><div class="match-status" data-card-status>' +
          row.dataset.matchStatus +
          '</div><dl class="match-card-meta"><div><dt>Source time</dt><dd>' +
          cells[6].textContent.replace(" ET", "").trim() +
          '</dd></div><div><dt>Host city</dt><dd>' +
          cells[8].innerHTML +
          '</dd></div><div><dt>Stadium</dt><dd>' +
          cells[9].textContent.trim() +
          '</dd></div></dl><div class="match-card-actions"><a href="' +
          row.dataset.detailUrl +
          '">Match details</a><a href="' +
          cells[8].querySelector("a").getAttribute("href") +
          '">City guide</a></div>';
        grid.append(article);
      }

      dateView.append(section);
    }

    cards = Array.from(document.querySelectorAll("[data-match-card]"));
    dateGroups = Array.from(document.querySelectorAll("[data-date-group]"));
  };

  const matchesFilters = (item, searchValue, stageValue, groupValue, dateValue, cityValue, teamValue) => {
    const matchesSearch = !searchValue || item.dataset.search.includes(searchValue);
    const matchesStage = !stageValue || item.dataset.stage === stageValue;
    const matchesGroup = !groupValue || item.dataset.group === groupValue;
    const matchesDate = !dateValue || item.dataset.localDate === dateValue;
    const matchesCity = !cityValue || item.dataset.city === cityValue;
    const matchesTeam =
      !teamValue || item.dataset.home === teamValue || item.dataset.away === teamValue;
    return matchesSearch && matchesStage && matchesGroup && matchesDate && matchesCity && matchesTeam;
  };

  const matchesAggregateFilters = (item, searchValue, stageValue, groupValue, dateValue, cityValue, teamValue) => {
    const matchesSearch = !searchValue || item.dataset.search.includes(searchValue);
    const matchesStage = !stageValue || item.dataset.stage === stageValue;
    const matchesGroup = !groupValue || item.dataset.group === groupValue;
    const matchesDate = !dateValue || item.dataset.localDate === dateValue;
    const matchesCity =
      !cityValue ||
      (item.dataset.aggregateType === "city" ? item.dataset.cityGroup === cityValue : item.dataset.city === cityValue);
    const matchesTeam =
      !teamValue ||
      (item.dataset.aggregateType === "team"
        ? item.dataset.teamGroup === teamValue
        : item.dataset.home === teamValue || item.dataset.away === teamValue);
    return matchesSearch && matchesStage && matchesGroup && matchesDate && matchesCity && matchesTeam;
  };

  const setView = (nextView) => {
    activeView = nextView;
    updateTimeDisplays();
    if (nextView === "date") buildDateCards();
    if (nextView === "team" || nextView === "city") buildAggregateViews();
    for (const view of views) {
      view.hidden = view.dataset.scheduleView !== nextView;
    }
    for (const button of viewButtons) {
      const active = button.dataset.viewToggle === nextView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    }
  };

  const apply = () => {
    const searchValue = (search?.value || "").trim().toLowerCase();
    const stageValue = stage?.value || "";
    const groupValue = group?.value || "";
    const dateValue = date?.value || "";
    const cityValue = city?.value || "";
    const teamValue = team?.value || "";
    let visible = 0;

    for (const row of rows) {
      const show = matchesFilters(row, searchValue, stageValue, groupValue, dateValue, cityValue, teamValue);
      row.hidden = !show;
      if (show) visible += 1;
    }

    for (const card of cards) {
      card.hidden = !matchesFilters(card, searchValue, stageValue, groupValue, dateValue, cityValue, teamValue);
    }

    for (const item of aggregateMatches) {
      item.hidden = !matchesAggregateFilters(item, searchValue, stageValue, groupValue, dateValue, cityValue, teamValue);
    }

    for (const card of aggregateCards) {
      const visibleItems = Array.from(card.querySelectorAll("[data-aggregate-match]")).filter(
        (item) => !item.hidden
      );
      const aggregateCount = card.querySelector("[data-aggregate-count]");
      card.hidden = visibleItems.length === 0;
      if (aggregateCount) aggregateCount.textContent = String(visibleItems.length);
    }

    for (const dateGroup of dateGroups) {
      const visibleCards = Array.from(dateGroup.querySelectorAll("[data-match-card]")).filter(
        (card) => !card.hidden
      );
      const dateCount = dateGroup.querySelector("[data-date-count]");
      dateGroup.hidden = visibleCards.length === 0;
      if (dateCount) dateCount.textContent = String(visibleCards.length);
    }

    if (count) count.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible !== 0;
    if (activeContext) {
      const pieces = [selectedTimezone().replaceAll("_", " ")];
      if (dateValue && date?.selectedOptions?.[0]) pieces.push(date.selectedOptions[0].textContent);
      if (stageValue) pieces.push(stageValue);
      if (teamValue) pieces.push(teamValue);
      if (cityValue) pieces.push(cityValue);
      activeContext.textContent = "Showing " + visible + " matches for " + pieces.join(" / ") + ".";
    }
    updateActiveFilters();
    updateLiveTime();
  };

  [search, stage, group, date, city, team].forEach((control) => {
    if (!control) return;
    control.addEventListener("input", apply);
    control.addEventListener("change", apply);
  });

  timezoneSelect?.addEventListener("change", () => {
    saveTimezone(selectedTimezone());
    updateTimeDisplays();
    syncDateOptions();
    populateHeroPlanner(heroPlannerMode);
    if (activeView === "date") buildDateCards();
    if (activeView === "team" || activeView === "city") buildAggregateViews();
    apply();
  });

  clearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      [search, stage, group, date, city, team].forEach((control) => {
        if (control) control.value = "";
      });
      apply();
    });
  });

  activeFilters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-clear-filter]");
    if (!button) return;
    const controls = { search, stage, group, date, city, team };
    const control = controls[button.dataset.clearFilter];
    if (control) control.value = "";
    apply();
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      setView(button.dataset.viewToggle);
      apply();
    });
  });

  upcomingPrev?.addEventListener("click", () => {
    upcomingPage = Math.max(0, upcomingPage - 1);
    upcomingNeedsScroll = true;
    updateLiveTime();
  });

  upcomingNext?.addEventListener("click", () => {
    upcomingPage += 1;
    upcomingNeedsScroll = true;
    updateLiveTime();
  });

  upcomingRail?.addEventListener("scroll", () => {
    window.requestAnimationFrame(syncUpcomingPageFromScroll);
  });

  window.addEventListener("resize", () => {
    updateUpcomingControls();
    scrollUpcomingRailToPage("auto");
  });

  upcomingViewAll?.addEventListener("click", () => {
    if (team?.value) setView("team");
    else if (city?.value) setView("city");
    else if (date?.value) setView("date");
    else setView("table");
    apply();
    scrollToSchedule();
  });

  const scrollToSchedule = () => {
    document.querySelector("#full-schedule")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.querySelectorAll("[data-hero-panel-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.heroPanelTab;
      document.querySelectorAll("[data-hero-panel-tab]").forEach((tab) => {
        tab.setAttribute("aria-selected", String(tab === button));
      });
      document.querySelectorAll("[data-hero-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.heroPanel !== target;
      });
    });
  });

  const clearFilterValues = () => {
    [search, stage, group, date, city, team].forEach((control) => {
      if (control) control.value = "";
    });
  };

  const heroPlanner = document.querySelector("[data-hero-planner]");
  const heroPlannerModeButtons = Array.from(document.querySelectorAll("[data-hero-planner-mode]"));
  const heroPlannerSelect = document.querySelector("[data-hero-planner-select]");
  const heroPlannerLabel = document.querySelector("[data-hero-planner-label]");
  const heroPlannerCount = document.querySelector("[data-hero-planner-count]");
  const heroPlannerNext = document.querySelector("[data-hero-planner-next]");
  const heroPlannerTarget = document.querySelector("[data-hero-planner-target]");
  const heroPlannerApply = document.querySelector("[data-hero-planner-apply]");
  const heroPlannerDetail = document.querySelector("[data-hero-planner-detail]");
  let heroPlannerMode = "team";

  const isConfirmedTeamName = (value) =>
    value &&
    !value.includes("/") &&
    !/^W\\d+$/i.test(value) &&
    !/^L\\d+$/i.test(value) &&
    !/^\\d[A-Z]+$/i.test(value) &&
    !/^Winner/i.test(value) &&
    !/^Loser/i.test(value) &&
    value !== "TBD";

  const uniqueOptions = (entries) =>
    [...new Map(entries.filter(([value]) => value).map(([value, label]) => [value, label || value])).entries()].sort((a, b) =>
      a[1].localeCompare(b[1])
    );

  const heroPlannerOptions = () => {
    if (heroPlannerMode === "team") {
      return uniqueOptions(rows.flatMap((row) => [[row.dataset.home, row.dataset.home], [row.dataset.away, row.dataset.away]]).filter(([value]) => isConfirmedTeamName(value)));
    }
    if (heroPlannerMode === "city") {
      return uniqueOptions(rows.map((row) => [row.dataset.city, row.dataset.city]));
    }
    if (heroPlannerMode === "stage") {
      return uniqueOptions(rows.map((row) => [row.dataset.stage, row.dataset.stage]));
    }
    return uniqueOptions(rows.map((row) => [row.dataset.localDate, row.dataset.localDateLabel || row.dataset.localDate]));
  };

  const heroPlannerMatches = () => {
    const value = heroPlannerSelect?.value || "";
    if (!value) return [];
    return sortedRows().filter((row) => {
      if (heroPlannerMode === "team") return row.dataset.home === value || row.dataset.away === value;
      if (heroPlannerMode === "city") return row.dataset.city === value;
      if (heroPlannerMode === "stage") return row.dataset.stage === value;
      return row.dataset.localDate === value;
    });
  };

  const heroPlannerTargetView = () => {
    if (heroPlannerMode === "team") return "team";
    if (heroPlannerMode === "city") return "city";
    if (heroPlannerMode === "date") return "date";
    return "table";
  };

  const heroPlannerDestinationLabel = () => {
    if (heroPlannerMode === "team") return "Team View";
    if (heroPlannerMode === "city") return "City View";
    if (heroPlannerMode === "date") return "Date Cards";
    return "Full Schedule Table";
  };

  const highlightPlannerTarget = (target) => {
    document.querySelectorAll(".planner-target-highlight").forEach((item) => {
      item.classList.remove("planner-target-highlight");
    });
    if (!target) return;
    target.classList.add("planner-target-highlight");
    window.setTimeout(() => target.classList.remove("planner-target-highlight"), 2600);
  };

  const scrollToPlannerDestination = () => {
    const value = heroPlannerSelect?.value || "";
    let target = null;
    if (heroPlannerMode === "team") {
      target = Array.from(document.querySelectorAll('[data-schedule-view="team"] [data-aggregate-card]')).find(
        (card) => card.dataset.teamGroup === value
      );
    } else if (heroPlannerMode === "city") {
      target = Array.from(document.querySelectorAll('[data-schedule-view="city"] [data-aggregate-card]')).find(
        (card) => card.dataset.cityGroup === value
      );
    } else if (heroPlannerMode === "date") {
      target = Array.from(document.querySelectorAll("[data-date-group]")).find((group) => group.dataset.dateValue === value);
    } else {
      target = rows.find((row) => !row.hidden);
    }
    const fallback = document.querySelector('[data-schedule-view="' + heroPlannerTargetView() + '"]') || document.querySelector("#full-schedule");
    const destination = target || fallback;
    destination?.scrollIntoView({ behavior: "smooth", block: target ? "center" : "start" });
    highlightPlannerTarget(target);
  };

  const updateHeroPlannerSummary = () => {
    if (!heroPlanner || !heroPlannerSelect) return;
    const matched = heroPlannerMatches();
    const first = matched[0];
    const value = heroPlannerSelect.value;
    if (heroPlannerCount) {
      heroPlannerCount.textContent =
        matched.length + " matching " + (matched.length === 1 ? "match" : "matches");
    }
    if (heroPlannerNext) {
      heroPlannerNext.textContent = first
        ? "First match: #" +
          first.dataset.matchNumber +
          " " +
          first.dataset.home +
          " vs " +
          first.dataset.away +
          " - " +
          (first.dataset.localTimeValue || first.dataset.dateLabel)
        : "No matches found for this planner choice.";
    }
    if (heroPlannerDetail) {
      heroPlannerDetail.href = first?.dataset.detailUrl || "#full-schedule";
      heroPlannerDetail.textContent = first ? "Open first match" : "No match detail";
    }
    if (heroPlannerTarget) {
      heroPlannerTarget.textContent = matched.length
        ? "Will open " + heroPlannerDestinationLabel() + " and highlight " + value + "."
        : "No destination is available for this choice.";
    }
    if (heroPlannerApply) {
      heroPlannerApply.textContent = matched.length
        ? "Show " + value + " results"
        : "Apply to schedule";
    }
  };

  const populateHeroPlanner = (nextMode = heroPlannerMode) => {
    if (!heroPlanner || !heroPlannerSelect) return;
    heroPlannerMode = nextMode;
    const currentValue = heroPlannerSelect.value;
    const labels = {
      team: "Choose a team",
      city: "Choose a host city",
      date: "Choose a local match date",
      stage: "Choose a tournament stage"
    };
    if (heroPlannerLabel) heroPlannerLabel.textContent = labels[heroPlannerMode] || "Choose a planner option";
    heroPlannerSelect.innerHTML = "";
    for (const [value, label] of heroPlannerOptions()) {
      heroPlannerSelect.add(new Option(label, value));
    }
    if ([...heroPlannerSelect.options].some((option) => option.value === currentValue)) {
      heroPlannerSelect.value = currentValue;
    }
    updateHeroPlannerSummary();
  };

  const applyHeroPlanner = () => {
    if (!heroPlannerSelect?.value) return;
    clearFilterValues();
    if (heroPlannerMode === "team" && team) team.value = heroPlannerSelect.value;
    if (heroPlannerMode === "city" && city) city.value = heroPlannerSelect.value;
    if (heroPlannerMode === "date" && date) date.value = heroPlannerSelect.value;
    if (heroPlannerMode === "stage" && stage) stage.value = heroPlannerSelect.value;
    setView(heroPlannerTargetView());
    apply();
    scrollToPlannerDestination();
  };

  heroPlannerModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      heroPlannerModeButtons.forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
      populateHeroPlanner(button.dataset.heroPlannerMode || "team");
    });
  });

  heroPlannerSelect?.addEventListener("change", updateHeroPlannerSummary);
  heroPlannerApply?.addEventListener("click", applyHeroPlanner);

  document.querySelectorAll("[data-hero-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.heroView;
      if (!view) return;
      setView(view);
      apply();
      scrollToSchedule();
    });
  });

  document.querySelectorAll("[data-hero-quick-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const controls = { search, stage, group, date, city, team };
      const control = controls[button.dataset.heroQuickFilter];
      if (!control) return;
      clearFilterValues();
      control.value = button.dataset.value || "";
      setView(button.dataset.targetView || "table");
      apply();
      scrollToSchedule();
    });
  });

  document.querySelectorAll("[data-hero-match-date]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = rows.find((item) => item.dataset.matchNumber === button.dataset.heroMatchDate);
      if (!row || !date) return;
      updateTimeDisplays();
      syncDateOptions();
      clearFilterValues();
      date.value = row.dataset.localDate || "";
      setView("date");
      apply();
      scrollToSchedule();
    });
  });

  document.querySelectorAll("[data-hero-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      clearFilterValues();
      setView("table");
      apply();
      scrollToSchedule();
    });
  });

  document.querySelectorAll("[data-hero-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      const controls = { search, stage, group, date, city, team };
      const control = controls[button.dataset.heroFocus];
      setView("table");
      apply();
      scrollToSchedule();
      control?.focus({ preventScroll: true });
      window.setTimeout(() => control?.focus({ preventScroll: true }), 250);
    });
  });

  window.setInterval(() => {
    updateLiveTime();
    if (activeView === "date") {
      for (const card of cards) {
        const status = card.querySelector("[data-card-status]");
        if (status && card.dataset.kickoffUtc) {
          status.textContent = matchStatusLabel(new Date(card.dataset.kickoffUtc));
        }
      }
    }
  }, 1000);

  updateTimeDisplays();
  syncDateOptions();
  populateHeroPlanner("team");
  setView("table");
  apply();
})();\n`
);

await write(
  "host-cities.js",
  `(() => {
  const explorer = document.querySelector("[data-city-explorer]");
  if (!explorer) return;

  const cards = Array.from(explorer.querySelectorAll("[data-city-card]"));
  const grid = explorer.querySelector("[data-city-grid]");
  const search = explorer.querySelector("[data-city-search]");
  const country = explorer.querySelector("[data-city-country]");
  const region = explorer.querySelector("[data-city-region]");
  const need = explorer.querySelector("[data-city-need]");
  const sort = explorer.querySelector("[data-city-sort]");
  const resultCount = explorer.querySelector("[data-city-result-count]");
  const presetButtons = Array.from(explorer.querySelectorAll("[data-city-preset]"));
  const regionPresetButtons = Array.from(explorer.querySelectorAll("[data-city-region-preset]"));
  const heroPlanner = document.querySelector("[data-city-hero-planner]");
  const heroCity = document.querySelector("[data-city-hero-city]");
  const heroNeed = document.querySelector("[data-city-hero-need]");
  const heroCount = document.querySelector("[data-city-hero-count]");
  const heroPrimary = document.querySelector("[data-city-hero-primary]");
  const heroSecondary = document.querySelector("[data-city-hero-secondary]");
  const heroApply = document.querySelector("[data-city-hero-apply]");
  const heroReset = document.querySelector("[data-city-hero-reset]");
  const heroPresetButtons = Array.from(document.querySelectorAll("[data-city-hero-preset]"));
  const resultAnchor = document.querySelector("#host-city-results") || explorer;

  const matchesNeedValue = (card, value = "") => {
    const matchCount = Number(card.dataset.matchCount || 0);
    const knockout = Number(card.dataset.knockout || 0);
    if (!value) return true;
    if (value === "high-volume") return matchCount >= 8;
    if (value === "knockout") return knockout > 0;
    if (value === "final-week") return card.dataset.finalWeek === "true";
    if (value === "cross-border") return card.dataset.country !== "United States";
    return true;
  };

  const matchesNeed = (card) => matchesNeedValue(card, need?.value || "");

  const scrollToResults = () => {
    resultAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateUrlPath = ({ reset = false } = {}) => {
    if (reset) {
      window.history.replaceState({}, "", window.location.pathname + "#city-schedule-pages");
      return;
    }
    const params = new URLSearchParams();
    const selectedCity = heroCity?.value || search?.value || "";
    const selectedNeed = heroNeed?.value || need?.value || "";
    if (selectedCity) params.set("city", selectedCity);
    if (selectedNeed) params.set("need", selectedNeed);
    const query = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (query ? "?" + query : "") + "#host-city-results");
  };

  const sortCards = () => {
    const value = sort?.value || "matches";
    const ordered = [...cards].sort((a, b) => {
      if (value === "name") return a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent);
      if (value === "date") return (a.dataset.firstDate || "").localeCompare(b.dataset.firstDate || "");
      return Number(b.dataset.matchCount || 0) - Number(a.dataset.matchCount || 0) ||
        a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent);
    });
    ordered.forEach((card) => grid?.append(card));
  };

  const apply = () => {
    const query = (search?.value || "").trim().toLowerCase();
    const selectedCountry = country?.value || "";
    const selectedRegion = region?.value || "";
    let visible = 0;

    sortCards();
    for (const card of cards) {
      const show =
        (!query || card.dataset.search.includes(query)) &&
        (!selectedCountry || card.dataset.country === selectedCountry) &&
        (!selectedRegion || card.dataset.region === selectedRegion) &&
        matchesNeed(card);
      card.hidden = !show;
      if (show) visible += 1;
    }

    if (resultCount) resultCount.textContent = String(visible);
  };

  const cityName = (card) => card.querySelector("h3")?.textContent.trim() || "";

  const heroMatches = () => {
    const selectedCity = heroCity?.value || "";
    const selectedNeed = heroNeed?.value || "";
    return cards.filter((card) => {
      const matchesCity = !selectedCity || cityName(card) === selectedCity;
      return matchesCity && matchesNeedValue(card, selectedNeed);
    });
  };

  const updateHeroPlanner = () => {
    if (!heroPlanner) return;
    const matched = heroMatches();
    const first = matched[0];
    const needLabel = heroNeed?.selectedOptions?.[0]?.textContent || "all fixture types";
    if (heroCount) {
      heroCount.textContent = matched.length + " " + (matched.length === 1 ? "city" : "cities") + " matched";
    }
    if (heroPrimary) {
      heroPrimary.textContent = first
        ? cityName(first) + " - " + first.dataset.matchCount + " matches"
        : "No host city matches this choice.";
    }
    if (heroSecondary) {
      heroSecondary.textContent = first
        ? "Need: " + needLabel + ". Opens the matching city cards below."
        : "Try all fixture types or reset the planner.";
    }
  };

  const highlightCityCard = (card) => {
    document.querySelectorAll(".planner-target-highlight").forEach((item) => item.classList.remove("planner-target-highlight"));
    if (!card) return;
    card.classList.add("planner-target-highlight");
    window.setTimeout(() => card.classList.remove("planner-target-highlight"), 2600);
  };

  const applyHeroPlanner = ({ scroll = true, updatePath = true } = {}) => {
    const selectedCity = heroCity?.value || "";
    if (search) search.value = selectedCity;
    if (country) country.value = "";
    if (region) region.value = "";
    if (need) need.value = heroNeed?.value || "";
    if (sort) sort.value = selectedCity ? "name" : "matches";
    presetButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    apply();
    const first = cards.find((card) => !card.hidden);
    if (updatePath) updateUrlPath();
    if (scroll) scrollToResults();
    highlightCityCard(first);
  };

  if (heroCity) {
    const options = cards
      .map((card) => cityName(card))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    for (const name of options) heroCity.add(new Option(name, name));
  }

  const readUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    const urlCity = params.get("city") || "";
    const urlNeed = params.get("need") || "";
    if (urlCity && heroCity && Array.from(heroCity.options).some((option) => option.value === urlCity)) {
      heroCity.value = urlCity;
    }
    if (urlNeed && heroNeed && Array.from(heroNeed.options).some((option) => option.value === urlNeed)) {
      heroNeed.value = urlNeed;
    }
    heroPresetButtons.forEach((item) =>
      item.setAttribute("aria-pressed", String(Boolean(urlNeed) && item.dataset.cityHeroPreset === urlNeed))
    );
    if (urlCity || urlNeed) {
      updateHeroPlanner();
      applyHeroPlanner({ scroll: window.location.hash === "#host-city-results", updatePath: false });
    }
  };

  [heroCity, heroNeed].forEach((control) => {
    control?.addEventListener("change", updateHeroPlanner);
    control?.addEventListener("input", updateHeroPlanner);
  });

  heroApply?.addEventListener("click", applyHeroPlanner);
  heroReset?.addEventListener("click", () => {
    if (heroCity) heroCity.value = "";
    if (heroNeed) heroNeed.value = "";
    if (search) search.value = "";
    if (country) country.value = "";
    if (region) region.value = "";
    if (need) need.value = "";
    if (sort) sort.value = "matches";
    presetButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    regionPresetButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    heroPresetButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    updateHeroPlanner();
    apply();
    updateUrlPath({ reset: true });
    explorer.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  heroPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (heroCity) heroCity.value = "";
      if (heroNeed) heroNeed.value = button.dataset.cityHeroPreset || "";
      heroPresetButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      updateHeroPlanner();
      applyHeroPlanner();
    });
  });

  [search, country, region, need, sort].forEach((control) => {
    control?.addEventListener("input", apply);
    control?.addEventListener("change", apply);
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (need) need.value = button.dataset.cityPreset || "";
      if (country && button.dataset.cityPreset === "cross-border") country.value = "";
      if (region) region.value = "";
      presetButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button && Boolean(button.dataset.cityPreset))));
      regionPresetButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      apply();
      explorer.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  regionPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (search) search.value = "";
      if (country) country.value = "";
      if (need) need.value = "";
      if (sort) sort.value = "matches";
      if (region) region.value = button.dataset.cityRegionPreset || "";
      presetButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      regionPresetButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      apply();
      explorer.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  updateHeroPlanner();
  apply();
  readUrlState();
})();\n`
);

await write(
  "groups.js",
  `(() => {
  const explorer = document.querySelector("[data-groups-explorer]");
  if (!explorer) return;

  const cards = Array.from(explorer.querySelectorAll("[data-group-card]"));
  const buttons = Array.from(explorer.querySelectorAll("[data-group-filter]"));
  const resultCount = explorer.querySelector("[data-group-result-count]");
  const resultAnchor = explorer.querySelector("#group-results") || explorer;
  const heroTool = document.querySelector("[data-group-hero-tool]");
  const heroGroup = heroTool?.querySelector("[data-group-hero-group]");
  const heroTeam = heroTool?.querySelector("[data-group-hero-team]");
  const heroModeButtons = Array.from(heroTool?.querySelectorAll("[data-group-hero-mode]") || []);
  const heroFields = Array.from(heroTool?.querySelectorAll("[data-group-hero-field]") || []);
  const heroTeamPreview = heroTool?.querySelector("[data-group-hero-team-preview]");
  const heroCount = heroTool?.querySelector("[data-group-hero-count]");
  const heroPrimary = heroTool?.querySelector("[data-group-hero-primary]");
  const heroSecondary = heroTool?.querySelector("[data-group-hero-secondary]");
  const heroApply = heroTool?.querySelector("[data-group-hero-apply]");
  const heroReset = heroTool?.querySelector("[data-group-hero-reset]");
  const heroStandings = heroTool?.querySelector("[data-group-hero-standings]");
  const heroFirst = heroTool?.querySelector("[data-group-hero-first]");
  const qualificationPanel = explorer.querySelector("[data-group-qualification-panel]");
  const qualificationTitle = explorer.querySelector("[data-qualification-title]");
  const qualificationCopy = explorer.querySelector("[data-qualification-copy]");
  const qualificationTop = explorer.querySelector("[data-qualification-top]");
  const qualificationThird = explorer.querySelector("[data-qualification-third]");
  const qualificationStandings = explorer.querySelector("[data-qualification-standings]");

  const setUrl = (group) => {
    const target = group ? "?group=" + encodeURIComponent(group) + "#group-" + group.toLowerCase() : "#groups-explorer";
    window.history.replaceState({}, "", window.location.pathname + target);
  };

  let heroMode = "group";

  const cardForGroup = (group) => (group ? explorer.querySelector("[data-group-card='" + group + "']") : null);

  const setHeroMode = (mode) => {
    heroMode = mode === "team" ? "team" : "group";
    heroModeButtons.forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.groupHeroMode === heroMode));
    });
    heroFields.forEach((field) => {
      field.hidden = field.dataset.groupHeroField !== heroMode;
    });
  };

  const renderTeamPreview = (group = "") => {
    if (!heroTeamPreview) return;
    const card = cardForGroup(group);
    if (!card) {
      heroTeamPreview.innerHTML = "<span>Choose a group to show its four teams here.</span>";
      return;
    }
    const teams = (card.dataset.groupTeams || "").split(", ").filter(Boolean);
    heroTeamPreview.innerHTML =
      "<strong>Group " + group + " teams</strong><div>" + teams.map((team) => "<span>" + team + "</span>").join("") + "</div>";
  };

  const updateHeroTool = (group = "") => {
    if (!heroTool) return;
    const card = cardForGroup(group);
    if (!card) {
      if (heroCount) heroCount.textContent = cards.length + " groups ready";
      if (heroPrimary) heroPrimary.textContent = "Choose a group or team to jump into the right schedule path.";
      if (heroSecondary) heroSecondary.textContent = "Use this panel to move directly to group cards, standings or the first fixture.";
      if (heroStandings) heroStandings.href = "/world-cup-2026-standings/";
      if (heroFirst) heroFirst.href = "#groups-explorer";
      renderTeamPreview("");
      return;
    }
    const teams = card.dataset.groupTeams || "";
    const first = card.dataset.groupFirst || "the first fixture";
    const cities = card.dataset.groupCities || "the host cities";
    if (heroCount) heroCount.textContent = "Group " + group + " selected";
    if (heroPrimary) heroPrimary.textContent = "Group " + group + ": " + teams;
    if (heroSecondary) heroSecondary.textContent = "First match: " + first + ". Host city route: " + cities + ".";
    if (heroStandings) heroStandings.href = "/world-cup-2026-standings/#group-" + group.toLowerCase();
    if (heroFirst) heroFirst.href = card.dataset.groupFirstPath || "#group-" + group.toLowerCase();
    renderTeamPreview(group);
  };

  const updateQualificationPanel = (group) => {
    if (!qualificationPanel) return;
    const card = cardForGroup(group);
    if (!card) {
      if (qualificationTitle) qualificationTitle.textContent = "All World Cup 2026 Schedule Groups";
      if (qualificationCopy) {
        qualificationCopy.textContent =
          "Every group starts level before the tournament begins. The top two teams from each group advance, while third-place teams move into a cross-group comparison for the remaining Round of 32 places.";
      }
      if (qualificationTop) qualificationTop.textContent = "24 teams qualify directly from first and second place.";
      if (qualificationThird) qualificationThird.textContent = "Eight third-place teams qualify after comparing records across groups.";
      if (qualificationStandings) qualificationStandings.href = "/world-cup-2026-standings/";
      return;
    }
    const teams = card.dataset.groupTeams || "";
    const first = card.dataset.groupFirst || "the first group fixture";
    const last = card.dataset.groupLast || "the final group day";
    const cities = card.dataset.groupCities || "its host cities";
    if (qualificationTitle) qualificationTitle.textContent = "Group " + group + " qualification preview";
    if (qualificationCopy) {
      qualificationCopy.textContent =
        "Group " + group + " includes " + teams + ". Start with " + first + ", then watch the table through " + last + " across " + cities + ".";
    }
    if (qualificationTop) qualificationTop.textContent = "First and second place from Group " + group + " move directly into the Round of 32.";
    if (qualificationThird) qualificationThird.textContent = "Third place in Group " + group + " may still qualify through the best third-place comparison.";
    if (qualificationStandings) qualificationStandings.href = "/world-cup-2026-standings/#group-" + group.toLowerCase();
  };

  const applyGroup = (group = "", { scroll = true, updatePath = true } = {}) => {
    let visible = 0;
    for (const card of cards) {
      const show = !group || card.dataset.groupCard === group;
      card.hidden = !show;
      if (show) visible += 1;
    }
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String((button.dataset.groupFilter || "") === group));
    });
    if (heroGroup && heroGroup.value !== group) heroGroup.value = group;
    if (!group && heroTeam) heroTeam.value = "";
    if (resultCount) resultCount.textContent = String(visible);
    updateHeroTool(group);
    updateQualificationPanel(group);
    if (updatePath) setUrl(group);
    if (scroll) {
      const target = group ? explorer.querySelector("[data-group-card='" + group + "']") : resultAnchor;
      (target || resultAnchor).scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyGroup(button.dataset.groupFilter || "");
    });
  });

  if (heroTool) {
    heroModeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setHeroMode(button.dataset.groupHeroMode);
        updateHeroTool(heroGroup?.value || heroTeam?.selectedOptions[0]?.dataset.group || "");
      });
    });
    heroGroup?.addEventListener("change", () => {
      if (heroTeam) heroTeam.value = "";
      updateHeroTool(heroGroup.value || "");
    });
    heroTeam?.addEventListener("change", () => {
      const group = heroTeam.selectedOptions[0]?.dataset.group || "";
      if (heroGroup) heroGroup.value = group;
      updateHeroTool(group);
    });
    heroApply?.addEventListener("click", () => {
      const group = heroGroup?.value || heroTeam?.selectedOptions[0]?.dataset.group || "";
      applyGroup(group);
    });
    heroReset?.addEventListener("click", () => {
      if (heroGroup) heroGroup.value = "";
      if (heroTeam) heroTeam.value = "";
      setHeroMode("group");
      applyGroup("");
    });
  }

  const params = new URLSearchParams(window.location.search);
  const urlGroup = (params.get("group") || "").toUpperCase();
  if (urlGroup && cards.some((card) => card.dataset.groupCard === urlGroup)) {
    applyGroup(urlGroup, { scroll: window.location.hash.startsWith("#group-"), updatePath: false });
  } else {
    applyGroup("", { scroll: false, updatePath: false });
  }
  setHeroMode("group");
})();\n`
);

await write(
  "match-detail.js",
  `(() => {
  const centers = Array.from(document.querySelectorAll("[data-match-center]"));
  if (!centers.length) return;

  const timezoneStorageKey = "wc26schedule-timezone";
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";

  const readSavedTimezone = () => {
    try {
      return window.localStorage.getItem(timezoneStorageKey);
    } catch {
      return "";
    }
  };

  const saveTimezone = (timezone) => {
    try {
      window.localStorage.setItem(timezoneStorageKey, timezone);
    } catch {}
  };

  const localTimeLabel = (date, timezone) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }).format(date);

  const countdownParts = (target, reference = new Date()) => {
    const diff = Math.max(0, target - reference);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const matchStatusLabel = (target, reference = new Date()) => {
    const diffMinutes = Math.floor((target - reference) / 60000);
    if (diffMinutes <= -120) return "Completed or in progress";
    if (diffMinutes <= 0) return "Kickoff time reached";
    if (diffMinutes <= 60) return "Starts in " + diffMinutes + "m";
    if (diffMinutes < 1440) return "Starts in " + Math.floor(diffMinutes / 60) + "h";
    return "Starts in " + Math.floor(diffMinutes / 1440) + "d";
  };

  const updateCenter = (center) => {
    const kickoff = new Date(center.dataset.kickoffUtc);
    const timezoneSelect = center.querySelector("[data-match-timezone]");
    const timezone = timezoneSelect?.value || detectedTimezone;
    const parts = countdownParts(kickoff);
    const setText = (selector, value) => {
      const node = center.querySelector(selector);
      if (node) node.textContent = value;
    };

    setText("[data-match-days]", String(parts.days).padStart(2, "0"));
    setText("[data-match-hours]", String(parts.hours).padStart(2, "0"));
    setText("[data-match-minutes]", String(parts.minutes).padStart(2, "0"));
    setText("[data-match-seconds]", String(parts.seconds).padStart(2, "0"));
    setText("[data-match-status]", matchStatusLabel(kickoff));
    setText("[data-match-user-time]", localTimeLabel(kickoff, timezone));
  };

  for (const center of centers) {
    const timezoneSelect = center.querySelector("[data-match-timezone]");
    if (timezoneSelect && !Array.from(timezoneSelect.options).some((option) => option.value === detectedTimezone)) {
      timezoneSelect.add(new Option(detectedTimezone.replaceAll("_", " "), detectedTimezone), 1);
    }
    if (timezoneSelect) {
      const savedTimezone = readSavedTimezone();
      timezoneSelect.value = Array.from(timezoneSelect.options).some((option) => option.value === savedTimezone)
        ? savedTimezone
        : detectedTimezone;
      timezoneSelect.addEventListener("change", () => {
        saveTimezone(timezoneSelect.value);
        updateCenter(center);
      });
    }
    updateCenter(center);
  }

  window.setInterval(() => centers.forEach(updateCenter), 1000);
})();\n`
);
await write("index.html", renderHome());

for (const page of pages) {
  await write(join(page.slug, "index.html"), renderPage(page));
}

await write(
  join("world-cup-2026-host-cities", "index.html"),
  redirectPage("/world-cup-2026-schedule-host-cities/")
);

await write(
  join("world-cup-2026-groups", "index.html"),
  redirectPage("/world-cup-2026-schedule-groups/")
);

const cities = citySummaries();
for (const city of cities) {
  await write(join(city.path.replace(/^\/|\/$/g, ""), "index.html"), renderCityPage(city));
}

const teams = teamSummaries();
for (const team of teams) {
  await write(join(team.path.replace(/^\/|\/$/g, ""), "index.html"), renderTeamPage(team));
}

for (const match of matches) {
  await write(join(matchDetailPath(match).replace(/^\/|\/$/g, ""), "index.html"), renderMatchPage(match));
}

await write(
  "robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\nHost: ${site.url}\n`
);

await write("ads.txt", adsTxt());

await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    site.url,
    ...pages.map((page) => `${site.url}/${page.slug}/`),
    ...cities.map((city) => `${site.url}${city.path}`),
    ...teams.map((team) => `${site.url}${team.path}`),
    ...matches.map((match) => `${site.url}${matchDetailPath(match)}`)
  ]
    .map(
      (url) =>
        `  <url><loc>${esc(url)}</loc><lastmod>2026-05-22</lastmod><changefreq>weekly</changefreq><priority>${url === site.url ? "1.0" : "0.8"}</priority></url>`
    )
    .join("\n")}\n</urlset>\n`
);

console.log(`Generated ${pages.length + cities.length + teams.length + matches.length + 1} pages in ${dist}`);
