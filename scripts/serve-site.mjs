import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const port = Number(process.env.PORT || 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const resolvePath = async (urlPath) => {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const direct = join(dist, clean === "/" ? "index.html" : clean);
  try {
    const info = await stat(direct);
    if (info.isFile()) return direct;
    if (info.isDirectory()) return join(direct, "index.html");
  } catch {}

  if (!extname(direct)) {
    return join(direct, "index.html");
  }

  return direct;
};

createServer(async (req, res) => {
  if ((req.url || "/").split("?")[0] === "/") {
    res.writeHead(302, { Location: "/world-cup-2026-schedule/" });
    res.end();
    return;
  }

  try {
    const file = await resolvePath(req.url || "/");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    const body = await readFile(join(dist, "404.html"));
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(body);
  }
}).listen(port, () => {
  console.log(`wc26schedule preview running at http://localhost:${port}`);
});
