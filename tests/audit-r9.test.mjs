// Teste pentru recomandările auditului (22 octombrie 2026) — Playwright, Chromium headless.
// Rulare: node tests/audit-r9.test.mjs   (cere /opt/node-tools cu playwright și /opt/pw-browsers/chromium)
import {createRequire} from 'module';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire('/opt/node-tools/package.json');
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 400))); } };
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.json': 'application/json'};
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); r.end(d); } }); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
console.log('ACORDAJ — audit r9');
const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, acceptDownloads: true, locale: 'ro-RO'});
const errs = []; const natives = [];
const page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message));
page.on('dialog', d => { natives.push(d.type()); d.dismiss(); });
await page.goto(base); await page.waitForTimeout(4000); await page.keyboard.press('Escape');
// SYNS: cuvinte care există pe Object.prototype nu mai aruncă
const syn = await page.evaluate(() => { try { for (const w of ['constructor', 'toString', 'hasOwnProperty', '__proto__', 'valueOf']) semScores(w + ' liniste'); return 'ok'; } catch (e) { return String(e); } });
ok(syn === 'ok', 'căutarea „≈ sens” cu „constructor”, „toString”, „__proto__” nu aruncă', syn);
// un singur H1
ok(await page.evaluate(() => document.querySelectorAll('h1').length) === 1, 'exact un H1 la pornire');
const views = await page.evaluate(() => [...document.querySelectorAll('nav button[data-v]')].map(b => b.dataset.v).slice(0, 14));
let multi = [];
for (const v of views) { await page.evaluate(v2 => document.querySelector('nav button[data-v="' + v2 + '"]').click(), v); await page.waitForTimeout(250); const n = await page.evaluate(() => document.querySelectorAll('h1').length); if (n !== 1) multi.push([v, n]); }
ok(multi.length === 0, 'exact un H1 în fiecare vizualizare (' + views.length + ')', multi);
// CSV: prefix pentru formule
ok(await page.evaluate(() => csvq('=1+1') === '"\'=1+1"' && csvq('@x') === '"\'@x"' && csvq('-a') === '"\'-a"' && csvq('ok') === '"ok"'), 'csvq prefixează =, +, -, @');
// dialog propriu în loc de confirm()
const dlg = await page.evaluate(async () => { const p = ffAsk('Test?'); await new Promise(r => setTimeout(r, 50)); const d = document.querySelector('dialog.fff-dlg'); const has = !!d && d.open; d.querySelector('.fff-primary').click(); return {has, v: await p}; });
ok(dlg.has && dlg.v === true, 'ffAsk deschide un dialog propriu și întoarce true la „Da”', dlg);
ok(natives.length === 0, 'nicio fereastră nativă alert/confirm/prompt', natives);
// service worker + offline
await page.reload(); await page.waitForTimeout(2500);
const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
ok(reg, 'service worker înregistrat și activ');
await page.waitForTimeout(6000);
const cached = await page.evaluate(async () => { const ks = await caches.keys(); const c = ks.find(k => k.startsWith('fff-acordaj-')); return c ? (await (await caches.open(c)).keys()).length : 0; });
ok(cached >= 2, 'cache-ul offline conține index.html și shell-ul', cached);
await ctx.setOffline(true);
await page.reload({waitUntil: 'domcontentloaded'}); await page.waitForTimeout(3500);
ok(await page.evaluate(() => typeof ITEMS !== 'undefined' && ITEMS.length === 1134), 'repornire offline: cele 1134 de intrări sunt încărcate');
await ctx.setOffline(false);
ok(errs.length === 0, 'fără pageerror', errs);
console.log(`\n${pass} ok, ${fail} eșuate`); await browser.close(); srv.close(); process.exit(fail ? 1 : 0);
