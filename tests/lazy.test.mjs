// ACORDAJ — dicționarul UI (6 270 rânduri x 8 limbi, ≈6,3 MB) încărcat la cerere din i18n/ (2.3.11).
// Rulare: node tests/lazy.test.mjs   (server local pe loopback; rețeaua externă blocată)
import {createRequire} from 'module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire('/opt/node-tools/package.json');
const {chromium} = require('playwright');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 300))); } };
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json'};
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(0, '127.0.0.1', res));
const BASE = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
const errs = [];
async function mk(ui, o = {}) {
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ro-RO'});
  await ctx.addInitScript(u => { try { if (u !== 'ro' && !localStorage.getItem('acordaj.v1')) localStorage.setItem('acordaj.v1', JSON.stringify({feat: {set: {ui: u}}})); } catch (e) {} }, ui);
  const page = await ctx.newPage(); page.reqs = [];
  page.on('request', r => { if (r.resourceType() !== 'fetch') page.reqs.push(r.url().replace(BASE, '')); });
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if ((m.type() === 'error' && !/Failed to load resource/.test(m.text())) || /Content Security Policy|Refused to/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  if (o.pre) await o.pre(ctx);
  await page.goto(BASE); await page.waitForTimeout(o.wait || 3500);
  return {ctx, page};
}
const state = page => page.evaluate(() => ({ui: SET().ui, op: getComputedStyle(document.body).opacity, nav: [...document.querySelectorAll('nav button, [role=tab]')].slice(0, 6).map(b => b.textContent.trim()).join('|'), title: document.title, wait: document.documentElement.classList.contains('ac-wait')}));
console.log('ACORDAJ — dicționar la cerere');
const sz = fs.statSync(ROOT + '/index.html').size;
console.log('  index.html: ' + (sz / 1e6).toFixed(2) + ' MB');
ok(sz < 3e6, 'index.html < 3 MB');
{
  const {ctx, page} = await mk('ro');
  ok(!page.reqs.some(u => u.startsWith('i18n/')), 'ro: niciun pachet cerut', page.reqs.filter(u => /i18n/.test(u)));
  const s = await state(page); ok(s.op === '1' && !s.wait, 'ro: pagina vizibilă', s);
  await page.evaluate(() => setSet('ui', 'fr')); await page.waitForTimeout(2500);
  const r = page.reqs.filter(u => /^i18n\//.test(u)).map(u => u.split('?')[0]).sort();
  ok(JSON.stringify(r) === JSON.stringify(['i18n/en.js', 'i18n/fr.js', 'i18n/keys.js']), 'schimbare ro→fr: keys + en + fr', r);
  const f = await state(page); ok(/Cours/.test(f.nav) && f.op === '1', 'fr: interfața tradusă', f);
  await page.evaluate(() => setSet('ui', 'ro')); await page.waitForTimeout(1200);
  const b = await state(page); ok(/Cursuri/.test(b.nav), 'înapoi la ro: textul românesc restaurat', b);
  await page.evaluate(() => setSet('ui', 'de')); await page.waitForTimeout(2500);
  const d = await state(page); ok(/Kurse/.test(d.nav) && /Atlas|ACORDAJ/.test(d.title), 'de: tradus după încărcare', d);
  await ctx.close();
}
{
  const {ctx, page} = await mk('en');
  const r = page.reqs.filter(u => /^i18n\//.test(u)).map(u => u.split('?')[0]).sort();
  ok(JSON.stringify(r) === JSON.stringify(['i18n/en.js', 'i18n/keys.js']), 'pornire cu en: doar keys + en', r);
  const s = await state(page); ok(/Courses/.test(s.nav) && s.op === '1' && !s.wait, 'en: interfața tradusă de la început', s);
  await ctx.close();
}
{ // pachet indisponibil
  const {ctx, page} = await mk('es', {wait: 1200, pre: async c => { await c.route(/i18n\/es\.js/, r => r.abort()); }});
  const t = await page.evaluate(() => ({toast: [...document.querySelectorAll('.toast, #toast, [role=status]')].map(e => e.textContent).join('|'), op: getComputedStyle(document.body).opacity, n: document.querySelectorAll('*').length}));
  ok(/idioma/.test(t.toast) && t.op === '1' && t.n > 500, 'es indisponibil: notificare, pagina rămâne utilizabilă', t);
  await ctx.close();
}
{ // SW + offline
  const {ctx, page} = await mk('ro', {wait: 1500});
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, {timeout: 20000}).catch(() => {});
  await page.reload(); await page.waitForTimeout(1500);
  ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'SW controlează pagina');
  await page.waitForTimeout(32000);
  const keys = await page.evaluate(async () => { const o = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) o.push(new URL(r.url).pathname); return o; });
  ok(['keys', 'en', 'fr', 'es', 'de', 'it', 'pt', 'hu'].every(l => keys.some(k => k.endsWith('/i18n/' + l + '.js'))), 'toate pachetele în cache', keys.filter(k => /i18n/.test(k)));
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(2500);
  await page.evaluate(() => setSet('ui', 'it')); await page.waitForTimeout(2500);
  const s = await state(page); ok(/Corsi/.test(s.nav), 'offline: it din cache', s);
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror / CSP', errs.slice(0, 3));
console.log('\n' + pass + ' ok, ' + fail + ' eșuate');
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
