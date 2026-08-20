import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

test("desktop PWA resources remain scoped and bypass protected API caching", async () => {
  const [html, app, elements, manifest, worker] = await Promise.all([
    readFile("web/index.html", "utf8"),
    readFile("web/app.js", "utf8"),
    readFile("web/world-picture-elements.js", "utf8"),
    readFile("web/manifest.webmanifest", "utf8"),
    readFile("web/sw.js", "utf8"),
  ]);
  const parsed = JSON.parse(manifest);

  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /<world-picture-tree/);
  assert.match(html, /<world-picture-detail/);
  assert.match(html, /id="world-breadcrumb"/);
  assert.match(app, /serviceWorker\.register\("\.\/sw\.js", \{scope: "\.\/"\}\)/);
  assert.match(elements, /role", "tree"/);
  assert.match(elements, /ArrowDown/);
  assert.match(elements, /world-picture-cross-link/);
  assert.match(elements, /world-picture-drill-down/);
  assert.match(elements, /world-picture-expand/);
  assert.match(elements, /By relation/);
  assert.match(elements, /By object/);
  assert.match(worker, /alarisa-desk-v4/);
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /if \(url\.pathname\.startsWith\("\/api\/"\)\) return/);
  assert.equal(parsed.start_url, "./");
  assert.equal(parsed.scope, "./");
  assert.doesNotMatch(worker, /\/mob\//);
  assert.doesNotMatch(worker, /\/hooks\//);
});
