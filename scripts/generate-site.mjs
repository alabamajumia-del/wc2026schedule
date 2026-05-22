import { mkdir, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pages, site } from "../src/content.mjs";
import { matches, scheduleMeta } from "../src/matches.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const updated = "May 22, 2026";

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const attr = esc;

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

const hero = ({ eyebrow, h1, intro, facts, primaryHref = "/world-cup-2026-schedule/" }) => `
<section class="hero">
  <div class="hero-inner">
    <div>
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1>${esc(h1)}</h1>
      <p class="hero-copy">${esc(intro)}</p>
      <div class="hero-actions">
        <a class="button" href="${primaryHref}">Open schedule hub</a>
        <a class="button secondary" href="/world-cup-2026-tickets/">Ticket guide</a>
      </div>
    </div>
    <aside class="hero-panel" aria-label="Quick facts">
      ${facts
        .map(
          ([label, value]) => `<div class="panel-row"><span class="panel-label">${esc(
            label
          )}</span><span class="panel-value">${esc(value)}</span></div>`
        )
        .join("")}
    </aside>
  </div>
</section>`;

const table = (rows) => `<div class="table-wrap">
<table>
  <thead><tr><th>Element</th><th>Purpose</th><th>SEO role</th></tr></thead>
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

const faqHtml = (faqs) => `<div class="card"><div class="card-body">
${faqs
  .map(
    ([question, answer]) =>
      `<div class="faq"><h3>${esc(question)}</h3><p>${esc(answer)}</p></div>`
  )
  .join("")}
</div></div>`;

const pageSchema = (page) => [
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

  return layout({
    title: page.title,
    description: page.description,
    canonical: `/${page.slug}/`,
    schema: pageSchema(page),
    body: `${hero({
      eyebrow: page.keyword,
      h1: page.h1,
      intro: page.intro,
      facts: page.facts
    })}
<main class="main">
  <section class="section">
    <div class="grid">
      <article class="span-8 card"><div class="card-body">
        <p class="eyebrow">Search intent</p>
        <h2>${esc(page.intent)}</h2>
        <p>This page targets <strong>${esc(page.keyword)}</strong> while naturally covering related searches such as ${esc(
          page.longTail.slice(0, 4).join(", ")
        )}. The content answers the user task first, then supports SEO through clear headings, internal links, FAQ answers and source-backed guidance.</p>
        <ul class="tag-list">${page.longTail
          .map((keyword) => `<li>${esc(keyword)}</li>`)
          .join("")}</ul>
      </div></article>
      <aside class="span-4 card"><div class="card-body">
        <p class="eyebrow">SEO brief</p>
        <h3>Page requirements</h3>
        <p>Production copy should reach at least 800 words, keep keyword family density near 3%-5%, include one useful table, FAQ items, source notes and natural internal links.</p>
      </div></aside>
    </div>
  </section>
  ${scheduleBlock}
  ${sections}
  <section class="section">
    <h2>Planning table</h2>
    ${table([
      ["Primary keyword", page.keyword, "Defines the page topic in title, H1, intro and metadata."],
      ["Long-tail coverage", page.longTail.slice(0, 3).join(", "), "Captures related user questions without keyword stuffing."],
      ["Internal links", `${page.links.length} page connections`, "Supports the schedule hub and distributes topical relevance."]
    ])}
  </section>
  <section class="section"><h2>Related planning pages</h2>${linkGrid(page.links)}</section>
  <section class="section"><h2>FAQ</h2>${faqHtml(page.faqs)}</section>
  <section class="source-note"><strong>Last updated:</strong> ${updated}. Sources should be verified against FIFA official schedule, official ticket information, host city sites, stadium sites and authorized broadcaster pages before publishing production claims. wc26schedule is independent and does not sell tickets.</section>
</main>`
  });
};

const renderScheduleTable = () => {
  const stageOptions = [...new Set(matches.map((match) => match.stage))];
  const groupOptions = [...new Set(matches.map((match) => match.group).filter(Boolean))];
  const teamOptions = [
    ...new Set(matches.flatMap((match) => [match.home, match.away]).filter((team) => team && !team.includes("/") && !team.startsWith("W") && !team.startsWith("2") && !team.startsWith("1") && team !== "TBD"))
  ].sort((a, b) => a.localeCompare(b));

  return `<section class="section schedule-tool" id="full-schedule">
  <div class="section-heading-row">
    <div>
      <p class="eyebrow">Structured match data</p>
      <h2>Full World Cup 2026 fixture table</h2>
      <p>The table below renders ${matches.length} structured match records. Date, city and stadium are nullable until the visual grid from the official schedule PDF is mapped with confidence.</p>
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
              match.home,
              match.away,
              match.kickoffET
            ]
              .join(" ")
              .toLowerCase();
            return `<tr data-match-row data-stage="${attr(match.stage)}" data-group="${attr(match.group)}" data-home="${attr(match.home)}" data-away="${attr(match.away)}" data-search="${attr(searchable)}">
          <td><strong>${match.matchNumber}</strong></td>
          <td>${esc(match.stage)}</td>
          <td>${match.group ? `Group ${esc(match.group)}` : "-"}</td>
          <td>${esc(teams)}</td>
          <td>${esc(match.kickoffET)} ET</td>
          <td>${match.date ? esc(match.date) : '<span class="pending">Pending map</span>'}</td>
          <td>${match.city ? esc(match.city) : '<span class="pending">Pending map</span>'}</td>
          <td>${match.stadium ? esc(match.stadium) : '<span class="pending">Pending map</span>'}</td>
        </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>
  <p class="source-note inline-note"><strong>Data note:</strong> ${esc(scheduleMeta.note)} Source: <a href="${attr(scheduleMeta.sourceUrl)}">${esc(scheduleMeta.sourceLabel)}</a>.</p>
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
        "Plan the tournament by date, team, city, stadium, TV schedule, ticket guide and downloadable tools. This build establishes the SEO-first site structure for worldcup2026schedule.net.",
      facts: [
        ["Brand", site.brand],
        ["Domain", site.domain],
        ["Core keyword", "world cup 2026 schedule"]
      ]
    })}
<main class="main">
  <section class="section">
    <div class="grid">
      <div class="span-8 card"><div class="card-body">
        <p class="eyebrow">Execution focus</p>
        <h2>Build the schedule first, then expand into tools and long-tail pages.</h2>
        <p>wc26schedule is structured around a center-and-spoke SEO model. The full match schedule is the authority page. PDF, Excel, groups, host cities, TV and tickets pages support the core topic while solving distinct user tasks. City and team pages become the next layer once the MVP structure is stable.</p>
        <div class="section-actions">
          <a class="button" href="/world-cup-2026-schedule/">View schedule page</a>
          <a class="button light" href="/world-cup-2026-tickets/">Review ticket guide</a>
        </div>
      </div></div>
      <div class="span-4 card"><div class="card-body">
        <p class="eyebrow">Content rule</p>
        <h3>800+ word pages</h3>
        <p>Core pages should be expanded to 800-1200 words with natural keyword coverage, useful tables, FAQ answers, source notes and internal links. Exact-match repetition should stay controlled.</p>
      </div></div>
    </div>
  </section>
  <section class="section">
    <h2>MVP page map</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Page</th><th>URL</th><th>Primary keyword</th><th>Status</th></tr></thead>
      <tbody>
        ${pages
          .slice(0, 8)
          .map(
            (page) =>
              `<tr><td>${esc(page.nav)}</td><td><a href="/${page.slug}/">/${page.slug}/</a></td><td>${esc(page.keyword)}</td><td>MVP</td></tr>`
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

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await copyFile(join(root, "src", "styles.css"), join(dist, "styles.css"));
await write(
  "schedule.js",
  `(() => {
  const rows = Array.from(document.querySelectorAll("[data-match-row]"));
  if (!rows.length) return;

  const search = document.querySelector("[data-filter-search]");
  const stage = document.querySelector("[data-filter-stage]");
  const group = document.querySelector("[data-filter-group]");
  const team = document.querySelector("[data-filter-team]");
  const count = document.querySelector("[data-schedule-count]");

  const apply = () => {
    const searchValue = (search?.value || "").trim().toLowerCase();
    const stageValue = stage?.value || "";
    const groupValue = group?.value || "";
    const teamValue = team?.value || "";
    let visible = 0;

    for (const row of rows) {
      const matchesSearch = !searchValue || row.dataset.search.includes(searchValue);
      const matchesStage = !stageValue || row.dataset.stage === stageValue;
      const matchesGroup = !groupValue || row.dataset.group === groupValue;
      const matchesTeam =
        !teamValue || row.dataset.home === teamValue || row.dataset.away === teamValue;
      const show = matchesSearch && matchesStage && matchesGroup && matchesTeam;
      row.hidden = !show;
      if (show) visible += 1;
    }

    if (count) count.textContent = String(visible);
  };

  [search, stage, group, team].forEach((control) => {
    if (control) control.addEventListener("input", apply);
  });
})();\n`
);
await write("index.html", renderHome());

for (const page of pages) {
  await write(join(page.slug, "index.html"), renderPage(page));
}

await write(
  "robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\nHost: ${site.url}\n`
);

await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    site.url,
    ...pages.map((page) => `${site.url}/${page.slug}/`)
  ]
    .map(
      (url) =>
        `  <url><loc>${esc(url)}</loc><lastmod>2026-05-22</lastmod><changefreq>weekly</changefreq><priority>${url === site.url ? "1.0" : "0.8"}</priority></url>`
    )
    .join("\n")}\n</urlset>\n`
);

console.log(`Generated ${pages.length + 1} pages in ${dist}`);
