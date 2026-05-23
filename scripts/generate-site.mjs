import { mkdir, rm, writeFile, copyFile } from "node:fs/promises";
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

const csvValue = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const downloadFiles = [
  {
    label: "Full schedule CSV",
    href: "/downloads/world-cup-2026-schedule.csv",
    description: "Raw match data for Google Sheets, Excel, Airtable or database import."
  },
  {
    label: "Excel workbook",
    href: "/downloads/world-cup-2026-schedule.xls",
    description: "Multi-sheet workbook with full schedule, group stage, knockout, venues and source notes."
  },
  {
    label: "Printable PDF",
    href: "/downloads/world-cup-2026-schedule.pdf",
    description: "Compact PDF grouped by date for offline viewing, printing and trip folders."
  }
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
      <strong class="hero-panel-title">${esc(panelTitle)}</strong>
      ${panelIntro ? `<p>${esc(panelIntro)}</p>` : ""}
      ${rows
        .map(
          ([label, value]) => `<div class="panel-row"><span class="panel-label">${esc(
            label
          )}</span><span class="panel-value">${esc(value)}</span></div>`
        )
        .join("")}
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

const teamLink = (team) =>
  isRealTeam(team) ? `<a href="${attr(teamPath(team))}">${esc(team)}</a>` : esc(team);

const downloadPanel = (page = {}) => {
  const files =
    page.slug === "world-cup-2026-schedule-pdf"
      ? [...downloadFiles].sort((a, b) => (a.label === "Printable PDF" ? -1 : b.label === "Printable PDF" ? 1 : 0))
      : downloadFiles;

  return `<section class="section">
  <h2>${esc(page.downloadHeading ?? "Download schedule files")}</h2>
  <p>${esc(
    page.downloadIntro ??
      "Use these files for offline planning, spreadsheet filtering, trip notes or sharing the tournament calendar with friends."
  )}</p>
  <div class="download-grid">
    ${files
      .map(
        (file) => `<a class="download-card" href="${attr(file.href)}" download>
      <strong>${esc(file.label)}</strong>
      <span>${esc(file.description)}</span>
    </a>`
      )
      .join("")}
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
      name: "How to use the World Cup 2026 schedule PDF",
      description:
        "Download, save, print and verify the World Cup 2026 schedule PDF before using it for travel, watch-party or ticket planning.",
      step: [
        {
          "@type": "HowToStep",
          name: "Download the PDF",
          text: "Use the PDF download link to save the printable schedule to your device."
        },
        {
          "@type": "HowToStep",
          name: "Review the fixture fields",
          text: "Check match number, date, kickoff time, teams, stage, host city and stadium."
        },
        {
          "@type": "HowToStep",
          name: "Compare with live planning pages",
          text: "Use the live schedule, Excel planner and host city pages when you need filters or local context."
        },
        {
          "@type": "HowToStep",
          name: "Confirm official details",
          text: "Verify important travel, ticket and timing decisions with official sources before acting."
        }
      ]
    });
  }

  return schema;
};

const renderPage = (page) => {
  const sections = page.sections
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
  ${downloadsBlock}
  ${cityBlock}
  ${sections}
  <section class="section">
    <h2>${esc(page.usageHeading ?? "How to use this page")}</h2>
    ${table(usageRows)}
  </section>
  <section class="section"><h2>${esc(page.relatedHeading ?? "Related planning pages")}</h2>${linkGrid(page.links)}</section>
  <section class="section"><h2>FAQ</h2>${faqHtml(page.faqs)}</section>
  <section class="source-note"><strong>Last updated:</strong> ${updated}. ${esc(sourceNote)}</section>
</main>`
  });
};

const renderScheduleTable = () => {
  const stageOptions = [...new Set(matches.map((match) => match.stage))];
  const groupOptions = [...new Set(matches.map((match) => match.group).filter(Boolean))];
  const dateOptions = [...new Set(matches.map((match) => match.date).filter(Boolean))];
  const cityOptions = [...new Set(matches.map((match) => match.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const teamOptions = [
    ...new Set(matches.flatMap((match) => [match.home, match.away]).filter((team) => team && !team.includes("/") && !team.startsWith("W") && !team.startsWith("2") && !team.startsWith("1") && team !== "TBD"))
  ].sort((a, b) => a.localeCompare(b));

  return `<section class="section schedule-tool" id="full-schedule">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Full schedule table</p>
      <h2>Full World Cup 2026 Match Schedule</h2>
      <p>Use the ${matches.length}-match table to check match number, date, Eastern Time kickoff, teams, stage, group, host city and stadium.</p>
    </div>
    <a class="button light" href="${attr(scheduleMeta.sourceUrl)}">Official source</a>
  </div>
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
    <label>Date
      <select data-filter-date>
        <option value="">All dates</option>
        ${dateOptions.map((date) => `<option value="${attr(date)}">${esc(date)}</option>`).join("")}
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
  <p class="schedule-count"><span data-schedule-count>${matches.length}</span> matches shown</p>
  <div class="table-wrap schedule-table-wrap">
    <table class="schedule-table">
      <thead>
        <tr>
          <th>Match</th>
          <th>Stage</th>
          <th>Group</th>
          <th>Teams</th>
          <th>Kickoff ET</th>
          <th>Date</th>
          <th>City</th>
          <th>Stadium</th>
        </tr>
      </thead>
      <tbody>
        ${matches
          .map((match) => {
            const teams = `${match.home} v ${match.away}`;
            const searchable = [
              match.matchNumber,
              match.stage,
              match.group,
              match.date,
              match.home,
              match.away,
              match.city,
              match.stadium,
              match.kickoffET
            ]
              .join(" ")
              .toLowerCase();
            return `<tr data-match-row data-stage="${attr(match.stage)}" data-group="${attr(match.group)}" data-date="${attr(match.date)}" data-city="${attr(match.city)}" data-home="${attr(match.home)}" data-away="${attr(match.away)}" data-search="${attr(searchable)}">
          <td><strong>${match.matchNumber}</strong></td>
          <td>${esc(match.stage)}</td>
          <td>${match.group ? `Group ${esc(match.group)}` : "-"}</td>
          <td>${teamLink(match.home)} v ${teamLink(match.away)}</td>
          <td>${esc(match.kickoffET)} ET</td>
          <td>${esc(match.date)}</td>
          <td><a href="${attr(cityPath(match.citySlug))}">${esc(match.city)}</a></td>
          <td>${esc(match.stadium)}</td>
        </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>
  <p class="source-note inline-note"><strong>Data note:</strong> ${esc(scheduleMeta.note)} Primary source: <a href="${attr(scheduleMeta.sourceUrl)}">${esc(scheduleMeta.sourceLabel)}</a>. Mapping source: <a href="${attr(scheduleMeta.mappingSourceUrl)}">${esc(scheduleMeta.mappingSourceLabel)}</a>.</p>
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
  "Team 2",
  "City",
  "Host country",
  "Stadium",
  "City slug",
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
    "Team 2": match.away,
    City: match.city,
    "Host country": meta.country,
    Stadium: match.stadium,
    "City slug": match.citySlug,
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

const scheduleRows = () => matches.map(matchView);

const scheduleCsv = () =>
  [
    scheduleHeaders.join(","),
    ...scheduleRows().map((row) => scheduleHeaders.map((header) => csvValue(row[header])).join(","))
  ].join("\n");

const xml = (value) => esc(value).replaceAll("'", "&apos;");

const worksheet = (name, rows) => `<Worksheet ss:Name="${xml(name)}">
  <Table>
    ${rows
      .map(
        (row) =>
          `<Row>${row
            .map(
              (cell) =>
                `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${xml(cell ?? "")}</Data></Cell>`
            )
            .join("")}</Row>`
      )
      .join("\n")}
  </Table>
</Worksheet>`;

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
 ${worksheet("README", [
   ["wc26schedule World Cup 2026 workbook"],
   ["Generated", updated],
   ["Best use", "Filter by team, city, date, stage or venue."],
   ["Time notes", "Kickoff ET is source time. UTC and venue local time are computed for planning convenience."],
   ["Primary source", scheduleMeta.sourceUrl],
   ["Mapping source", scheduleMeta.mappingSourceUrl],
   ["Reminder", "Confirm official details before travel, tickets or broadcast decisions."]
 ])}
 ${worksheet("All Matches", fullRows)}
 ${worksheet("Group Stage", groupStageRows)}
 ${worksheet("Knockout", knockoutRows)}
 ${worksheet("Venues", [["City", "Host country", "Stadium", "Matches", "First match date", "Last match date"], ...venueRows()])}
 ${worksheet("Groups", [["Group", "Team"], ...groupRows()])}
</Workbook>`;
};

const pdfEscape = (value) =>
  String(value)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");

const generatePdf = () => {
  const lines = [
    "wc26schedule World Cup 2026 Schedule",
    `Generated ${updated}. Confirm final details with official sources.`,
    "Grouped by date. Times shown in ET.",
    ""
  ];
  let currentDate = "";
  for (const match of matches) {
    if (match.date !== currentDate) {
      currentDate = match.date;
      lines.push("");
      lines.push(`${match.dateLabel}`);
    }
    lines.push(
      `M${String(match.matchNumber).padStart(3, "0")}  ${match.kickoffET} ET  ${match.home} v ${match.away}  | ${match.stage}${match.group ? ` ${match.group}` : ""} | ${match.city} | ${match.stadium}`
    );
  }

  const pages = [];
  const pageLines = 46;
  for (let i = 0; i < lines.length; i += pageLines) {
    pages.push(lines.slice(i, i + pageLines));
  }

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds = [];
  for (const pageLinesChunk of pages) {
    const content = [
      "BT",
      "/F1 9 Tf",
      "50 760 Td",
      ...pageLinesChunk.flatMap((line, index) => [
        index === 0 ? "" : "0 -15 Td",
        `(${pdfEscape(line).slice(0, 124)}) Tj`
      ]),
      "ET"
    ]
      .filter(Boolean)
      .join("\n");
    const streamId = addObject(`<< /Length ${Buffer.byteLength(content, "binary")} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent PARENT_PLACEHOLDER /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${streamId} 0 R >>`
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
await copyFile(join(root, "src", "styles.css"), join(dist, "styles.css"));
await write("downloads/world-cup-2026-schedule.csv", scheduleCsv());
await write("downloads/world-cup-2026-schedule.xls", scheduleSpreadsheetHtml());
await write("downloads/world-cup-2026-schedule.pdf", generatePdf());
await write(
  "schedule.js",
  `(() => {
  const rows = Array.from(document.querySelectorAll("[data-match-row]"));
  if (!rows.length) return;

  const search = document.querySelector("[data-filter-search]");
  const stage = document.querySelector("[data-filter-stage]");
  const group = document.querySelector("[data-filter-group]");
  const date = document.querySelector("[data-filter-date]");
  const city = document.querySelector("[data-filter-city]");
  const team = document.querySelector("[data-filter-team]");
  const count = document.querySelector("[data-schedule-count]");

  const apply = () => {
    const searchValue = (search?.value || "").trim().toLowerCase();
    const stageValue = stage?.value || "";
    const groupValue = group?.value || "";
    const dateValue = date?.value || "";
    const cityValue = city?.value || "";
    const teamValue = team?.value || "";
    let visible = 0;

    for (const row of rows) {
      const matchesSearch = !searchValue || row.dataset.search.includes(searchValue);
      const matchesStage = !stageValue || row.dataset.stage === stageValue;
      const matchesGroup = !groupValue || row.dataset.group === groupValue;
      const matchesDate = !dateValue || row.dataset.date === dateValue;
      const matchesCity = !cityValue || row.dataset.city === cityValue;
      const matchesTeam =
        !teamValue || row.dataset.home === teamValue || row.dataset.away === teamValue;
      const show = matchesSearch && matchesStage && matchesGroup && matchesDate && matchesCity && matchesTeam;
      row.hidden = !show;
      if (show) visible += 1;
    }

    if (count) count.textContent = String(visible);
  };

  [search, stage, group, date, city, team].forEach((control) => {
    if (control) control.addEventListener("input", apply);
  });
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
    ...teams.map((team) => `${site.url}${team.path}`)
  ]
    .map(
      (url) =>
        `  <url><loc>${esc(url)}</loc><lastmod>2026-05-22</lastmod><changefreq>weekly</changefreq><priority>${url === site.url ? "1.0" : "0.8"}</priority></url>`
    )
    .join("\n")}\n</urlset>\n`
);

console.log(`Generated ${pages.length + cities.length + teams.length + 1} pages in ${dist}`);
