// Teste r10 pentru ACORDAJ 2.3.12: versiune coerentă (BUILD.v), pachete i18n aliniate, etichete netraduse (zilnic, coaching, Roata, anunț „Vizualizare”).
// Rulare: node tests/r10-audit.test.mjs   (server local pe loopback; rețeaua externă blocată)
import {createRequire} from 'module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire('/opt/node-tools/package.json');
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 400))); } };
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.json': 'application/json'};
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port + '/';
console.log('ACORDAJ — audit r10');

// 1) pachete i18n: aceeași lungime, același build ca în index.html
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const build = html.match(/const _ACBUILD = "([\d.]+)"/)[1];
const lens = {}, ids = {};
for (const n of ['keys', 'en', 'fr', 'it', 'es', 'pt', 'hu', 'de']) {
  const s = fs.readFileSync(path.join(ROOT, 'i18n', n + '.js'), 'utf8');
  const m = s.match(/^__ACP\("(\w+)","([\d.]+)",(\[[\s\S]*\])\);?\s*$/);
  lens[n] = JSON.parse(m[3]).length; ids[n] = m[2];
}
ok(Object.values(lens).every((v) => v === lens.keys), 'pachetele au aceeași lungime ca keys.js', lens);
ok(Object.values(ids).every((v) => v === build), 'pachetele poartă build-ul din index.html (' + build + ')', ids);
const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
ok(app.version === build, 'app.json și _ACBUILD au aceeași versiune', [app.version, build]);

const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
const ctx = await browser.newContext({viewport: {width: 1200, height: 900}, locale: 'ro-RO'});
await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(base); await page.waitForTimeout(3500); await page.keyboard.press('Escape');
ok(await page.evaluate(() => BUILD.v) === app.version, 'BUILD.v (exporturi, nume cache) = versiunea aplicației');
const ROW = /[ășțĂȘȚşţ]|\b(și|pentru|ce|cu|în)\b/;
for (const lang of ['en', 'de', 'hu']) {
  await page.evaluate((l) => setSet('ui', l), lang); await page.waitForTimeout(3000);
  const left = {};
  for (const v of ['daily', 'coach', 'ares']) {
    await page.evaluate((v2) => { const b = document.querySelector('nav button[data-v="' + v2 + '"]'); if (b) b.click(); }, v); await page.waitForTimeout(600);
    if (v === 'coach') { await page.evaluate(() => { const d = document.querySelector('details.mod'); if (d) d.open = true; }); await page.waitForTimeout(500); }
    const txt = await page.evaluate(() => {
      const w = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT), o = []; let n;
      while ((n = w.nextNode())) { const s = n.nodeValue.trim(); const pe = n.parentElement; if (s.length > 3 && pe && !/SCRIPT|STYLE|TEXTAREA|OPTION/.test(pe.tagName) && getComputedStyle(pe).display !== 'none') o.push(s); }
      return o;
    });
    // etichetele de interfață adăugate în 2.3.12 trebuie să fie traduse
    const must = ['Program pe 4 săptămâni', 'Întrebări de coaching', 'Livrabilul tău', 'Indicator de reușită.', 'Toate exercițiile familiei, rezolvate', 'Sesiune GROW (scrie pentru tine)', 'Obiectiv.', 'Livrabil.', 'Competență antrenată.', 'Metoda.', 'Progres.', 'Citește o fișă neparcursă și notează un lucru care te surprinde.'];
    must.forEach((s) => { if (txt.includes(s)) left[s] = v; });
  }
  ok(Object.keys(left).length === 0, lang + ': etichetele zilnic/coaching nu mai apar în română', left);
  const say = await page.evaluate(async () => { const live = document.querySelector('[aria-live]'); document.querySelector('nav button[data-v="cats"]').click(); await new Promise((r) => setTimeout(r, 300)); return Array.from(document.querySelectorAll('[aria-live]')).map((e) => e.textContent).join('|'); });
  ok(!/Vizualizare/.test(say), lang + ': anunțul de vizualizare nu amestecă româna', say);
}
ok(errs.length === 0, 'fără pageerror', errs);
await browser.close(); srv.close();
console.log('\n' + pass + ' ok, ' + fail + ' eșuate'); process.exit(fail ? 1 : 0);
