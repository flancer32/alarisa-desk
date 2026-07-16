import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

test("desktop PWA resources remain relative to the assigned host scope", async () => {
  const [html, app, manifest, worker] = await Promise.all([
    readFile("web/index.html", "utf8"),
    readFile("web/app.js", "utf8"),
    readFile("web/manifest.webmanifest", "utf8"),
    readFile("web/sw.js", "utf8"),
  ]);
  const parsed = JSON.parse(manifest);

  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /<html lang="en">/);
  assert.doesNotMatch(`${html}\n${app}`, /[\u0400-\u04FF]/);
  assert.match(app, /serviceWorker\.register\('\.\/sw\.js', \{scope: '\.\/'\}\)/);
  assert.match(worker, /alarisa-desk-v3/);
  assert.match(worker, /caches\.delete/);
  assert.equal(parsed.start_url, "./");
  assert.equal(parsed.scope, "./");
  assert.doesNotMatch(worker, /\/mob\//);
  assert.doesNotMatch(worker, /\/api\//);
  assert.doesNotMatch(worker, /\/hooks\//);
});
