import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pages, site } from "../src/content.mjs";
import { matches, scheduleMeta } from "../src/matches.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const updated = "May 22, 2026";

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
    "src/assets/printable-world-cup-2026-schedule-bracket.pdf",
    "downloads/printable-world-cup-2026-schedule-bracket.pdf"
  ]
];

const nav = () =>
  pages
    .slice(0, 8)
    .map((page) => `<a href="/${page.slug}/">${esc(page.nav)}</a>`)
    .join("");

const layout = ({ title, description, canonical, body, schema = [] }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | ${esc(site.brand)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="canonical" href="${attr(site.url + canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(site.url + canonical)}">
  <meta property="og:site_name" content="${attr(site.brand)}">
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
  <script src="/match-detail.js" defer></script>
  <footer class="footer">
    <div class="footer-inner">
      <strong>${esc(site.brand)}</strong>
      <span>Independent planning guide for ${esc(site.domain)}. Always confirm official schedule, ticket and broadcast details with primary sources.</span>
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
          <a href="/downloads/world-cup-2026-schedule-overview.pdf" download>Download overview PDF</a>
        </div>
      </div>
      <div class="download-checklist" aria-label="PDF download checklist">
        ${rows.map(([label, value]) => `<span><strong>${esc(label)}</strong>${esc(value)}</span>`).join("")}
      </div>
    </div>`
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
      <a class="button light" href="/world-cup-2026-host-cities/">Compare host cities</a>
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
      <a class="button light" href="/world-cup-2026-groups/">Open groups guide</a>
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
        <a class="button" href="/assets/2026-world-cup-full-match-schedule-overview.png" download>Download overview image</a>
        <a class="button light" href="/downloads/world-cup-2026-schedule.pdf" download>Download printable PDF</a>
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
        <a class="button" href="/downloads/world-cup-2026-schedule.pdf" download>Download printable PDF</a>
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
        <a class="button" href="/downloads/world-cup-2026-stage-overview.pdf" download>Download stage overview</a>
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
      <p>For bracket planning, download the bracket PDF and keep the live match pages nearby. The PDF gives you the shape of the route; match detail pages give you the exact city, stadium, time-zone and related team route once a fixture matters to your plan.</p>
      <div class="pdf-feature-actions">
        <a class="button" href="/downloads/printable-world-cup-2026-schedule-bracket.pdf" download>Download bracket PDF</a>
        <a class="button light" href="/world-cup-2026-groups/">Open groups guide</a>
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

const downloadPanel = (page = {}) => {
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

  return `<section class="section">
  <h2>${esc(page.downloadHeading ?? "Download schedule files")}</h2>
  <p>${esc(
    page.downloadIntro ??
      "Use these files for offline planning, spreadsheet filtering, trip notes or sharing the tournament calendar with friends."
  )}</p>
  <div class="download-library">
    <div class="download-group">
      <div class="download-group-heading"><h3>Data downloads</h3><span>Structured files</span></div>
      <div class="download-grid">${dataDownloadFiles.map(card).join("")}</div>
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
  return `<section class="section">
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

  return schema;
};

const renderPage = (page) => {
  const sections =
    page.slug === "world-cup-2026-schedule"
      ? renderScheduleCapabilitySections()
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
    ? downloadPanel(page)
    : "";
  const pdfVisualBlock =
    page.slug === "world-cup-2026-schedule-pdf" ? renderPdfVisualSections() : "";
  const cityBlock = page.slug === "world-cup-2026-host-cities" ? cityIndexPanel() : "";
  const sourceNote =
    page.slug === "world-cup-2026-schedule"
      ? `This page is maintained as an independent fixture planner for fans. Sources: FIFA official schedule, structured match data, host city and stadium references. Editorial note: kickoff times, ticket details and broadcast information may change, so confirm paid or time-sensitive decisions with official sources.`
      : `wc26schedule is an independent planning guide. Sources include FIFA official schedule information, official ticket information, host city sites, stadium sites and authorized broadcaster pages where relevant. Editorial note: times, ticket details and broadcaster information may change, so confirm important decisions with official sources.`;
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

  return layout({
    title: page.title,
    description: page.description,
    canonical: `/${page.slug}/`,
    schema: pageSchema(page),
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
  <section class="section">
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
  </section>
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
      ["Groups guide", "/world-cup-2026-groups/"],
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
    headline: `${city.city} World Cup 2026 Schedule`,
    description: `See the World Cup 2026 schedule for ${city.city}, including match dates, ET kickoff times, stadiums and tournament stages.`,
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
        name: "World Cup 2026 Host Cities",
        item: `${site.url}/world-cup-2026-host-cities/`
      },
      { "@type": "ListItem", position: 3, name: city.city, item: `${site.url}${city.path}` }
    ]
  }
];

const renderCityPage = (city) => {
  const title = `${city.city} World Cup 2026 Schedule`;
  const description = `See ${city.city} World Cup 2026 matches with dates, ET kickoff times, stages, teams and stadium details.`;

  return layout({
    title,
    description,
    canonical: city.path,
    schema: citySchema(city),
    body: `${hero({
      eyebrow: "Host city schedule",
      h1: title,
      intro: `${city.city} hosts ${city.matches.length} World Cup 2026 matches from ${city.firstDate} to ${city.lastDate}. This guide lists the local match schedule, stadium details, stages and planning links for fans comparing city itineraries.`,
      facts: [
        ["Matches", `${city.matches.length}`],
        ["Host country", city.country],
        ["Stadium", city.stadiums.join(", ")]
      ],
      primaryHref: "/world-cup-2026-schedule/"
    })}
<main class="main">
  <section class="section">
    <div class="grid">
      <article class="span-8 card"><div class="card-body">
        <p class="eyebrow">City overview</p>
        <h2>${esc(city.city)} match schedule</h2>
        <p>Use this city page to check every listed match in ${esc(city.city)}, compare dates, review the stadium, and move back to the full schedule when you want to filter by team, stage or date.</p>
      </div></article>
      <aside class="span-4 card"><div class="card-body">
        <p class="eyebrow">Planning note</p>
        <h3>Confirm before booking</h3>
        <p>Times, ticket details, stadium operations and local transport information can change. Use this page as a planning aid and confirm final details with official sources.</p>
      </div></aside>
    </div>
  </section>
  <section class="section">
    <h2>${esc(city.city)} fixtures</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Match</th><th>Date</th><th>Time ET</th><th>Stage</th><th>Group</th><th>Teams</th><th>Stadium</th></tr></thead>
        <tbody>
          ${city.matches
            .map(
              (match) =>
                `<tr><td>${match.matchNumber}</td><td>${esc(match.date)}</td><td>${esc(match.kickoffET)} ET</td><td>${esc(match.stage)}</td><td>${esc(match.group || "-")}</td><td>${esc(`${match.home} v ${match.away}`)}</td><td>${esc(match.stadium)}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </section>
  <section class="section">
    <h2>How to use this city page</h2>
    ${table([
      ["Compare dates", `${city.firstDate} to ${city.lastDate}.`, "Check whether the city fits your travel window."],
      ["Review stages", city.stages.join(", "), "Decide whether you want group-stage, knockout or final-week matches."],
      ["Check stadium", city.stadiums.join(", "), "Confirm access, gates and local operations with official venue sources."]
    ])}
  </section>
  <section class="section">
    <h2>Related planning pages</h2>
    ${linkGrid([
      ["Full World Cup 2026 schedule", "/world-cup-2026-schedule/"],
      ["All host cities", "/world-cup-2026-host-cities/"],
      ["Ticket guide", "/world-cup-2026-tickets/"],
      ["Download schedule files", "/world-cup-2026-schedule-excel/"]
    ])}
  </section>
  <section class="section">
    <h2>FAQ</h2>
    ${faqHtml([
      [`How many World Cup 2026 matches are in ${city.city}?`, `${city.city} currently has ${city.matches.length} matches in the wc26schedule data set, covering ${city.stages.join(", ")}.`],
      [`Which stadium hosts matches in ${city.city}?`, `${city.city} matches are listed at ${city.stadiums.join(", ")}.`],
      [`Can I download the ${city.city} schedule?`, "The current download files include the full schedule. City-specific downloads can be generated from the same data in a later phase."]
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
      <a class="button light" href="/world-cup-2026-groups/">Open groups guide</a>
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
