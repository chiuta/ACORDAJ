// Teste funcții noi (runda 8, 14 octombrie 2026) — Playwright, Chromium headless, rețea blocată.
// Rulare: node tests/fff-r8.test.mjs   (cere /opt/node-tools cu playwright și /opt/pw-browsers/chromium; axe-core opțional prin AXE_PATH)
// [fff-portable] axe-core: FFF_AXE / AXE_PATH, apoi pachetul `axe-core` (npm i -D axe-core). Dacă lipsește: undefined (testele cu axe pică cu mesaj clar).
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => process.env.FFF_AXE || process.env.AXE_PATH || (() => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } })();
import {createRequire} from 'module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(HERE, '..', 'index.html');
const URL_APP = 'file://' + INDEX;
const AXE = process.env.AXE_PATH || __fffAxe();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (cond, name, info) => { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (info === undefined ? '' : ' ' + JSON.stringify(info).slice(0, 500))); } };
const FLAGS = ['--no-sandbox', '--allow-loopback-in-peer-connection', '--disable-features=WebRtcHideLocalIpsWithMdns'];
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: FLAGS});
const net = [], errs = [];
async function mk(o = {}) {
  const ctx = await browser.newContext({viewport: {width: o.w || 1280, height: o.h || 800}, acceptDownloads: true, colorScheme: o.scheme || 'dark', reducedMotion: o.reduced ? 'reduce' : 'no-preference', locale: o.locale || 'ro-RO', bypassCSP: !!o.bypassCSP});
  await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  if (o.init) await ctx.addInitScript(o.init);
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(t)) errs.push('console: ' + t); });
  if (o.goto !== false) await page.goto(o.url || URL_APP);
  return {ctx, page};
}
async function axeRun(page, sel) {
  if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  return page.evaluate(async s => { const r = await window.axe.run(s ? document.querySelector(s) : document, {resultTypes: ['violations']}); return r.violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')); }, sel || null);
}
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
// sintetizator vocal fals: înregistrează textele „citite”
const TTS_MOCK = () => {
  window.__spoken = [];
  class U { constructor(t) { this.text = t; this.voice = null; this.lang = ''; this.rate = 1; } }
  const V = [{name: 'Test RO', lang: 'ro-RO', voiceURI: 'ro', localService: true, default: true}, {name: 'Test EN', lang: 'en-US', voiceURI: 'en', localService: true, default: false}];
  const synth = {getVoices: () => V, speaking: false, addEventListener() {}, removeEventListener() {}, pause() {}, resume() {},
    cancel() { synth.speaking = false; }, speak(u) { synth.speaking = true; setTimeout(() => { window.__spoken.push({text: u.text, lang: u.lang}); synth.speaking = false; if (u.onstart) u.onstart({}); if (u.onend) u.onend({}); }, 5); }};
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: U, configurable: true}); Object.defineProperty(window, 'speechSynthesis', {value: synth, configurable: true});
};
console.log('ACORDAJ — teste funcții noi (căutare după temă, kit, integritate)');
for (const [w, h] of [[1280, 800], [360, 740]]) {
  const {ctx, page} = await mk({w, h});
  await page.waitForTimeout(3800);
  ok(await page.evaluate(() => !!(window.FFF && FFF.search && FFF.bundle && FFF.label)), `kit încărcat (${w}x${h})`);
  ok(await noHScroll(page), `fără depășire orizontală ${w}x${h}`);
  await page.keyboard.press('Escape');
  const ax = await axeRun(page); ok(ax.length === 0, `axe 0 violări (start) ${w}x${h}`, ax);
  await page.locator('#r8-search-btn').click();
  await page.locator('#r8s-q').fill('Isis'); await page.waitForTimeout(500);
  ok(await page.locator('.r8-res li').count() >= 1, `căutare „Isis” dă rezultate ${w}x${h}`);
  const ax2 = await axeRun(page); ok(ax2.length === 0, `axe 0 violări cu căutarea deschisă ${w}x${h}`, ax2);
  ok(await noHScroll(page), `dialog căutare: fără depășire ${w}x${h}`);
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror/CSP la pornire', errs); ok(net.length === 0, '0 cereri de rețea', net);
{
  const {ctx, page} = await mk({});
  await page.waitForTimeout(3800);
  await page.keyboard.press('Escape');
  const self = await page.evaluate(async () => { const r = await selfHash(); return r && r.calc === r.embedded; });
  ok(self === true, 'verificarea de integritate încorporată (EMBED_SHA) trece');
  const nBefore = await page.evaluate(() => ITEMS.length);
  ok(nBefore === 1134, 'cele 1134 de cursuri sunt intacte', nBefore);
  await page.locator('#r8-search-btn').click(); await page.locator('#r8s-q').fill('Merlinn'); await page.waitForTimeout(500);
  const n1 = await page.locator('.r8-res li').count();
  ok(n1 >= 1, 'greșeală de scriere „Merlinn” găsește rezultate', n1);
  const first = (await page.locator('.r8-res li b').first().innerText());
  await page.locator('.r8-res li button').first().click(); await page.waitForTimeout(300);
  ok(!(await page.locator('#r8s-q').isVisible()), 'dialogul se închide după alegere');
  const h1 = await page.locator('#detail .vh').innerText();
  ok(first.toLowerCase().includes(h1.toLowerCase().slice(0, 12)), 'fișa cursului ales este deschisă', [first, h1]);
  // fără diacritice / formă de cuvânt
  await page.locator('#r8-search-btn').click();
  await page.locator('#r8s-q').fill('initiere'); await page.waitForTimeout(450); const a1 = await page.locator('.r8-res li').count();
  await page.locator('#r8s-q').fill('inițiere'); await page.waitForTimeout(450); const a2 = await page.locator('.r8-res li').count();
  ok(a1 >= 1 && a1 === a2, 'cu și fără diacritice dau aceleași rezultate', [a1, a2]);
  await page.locator('#r8s-q').fill('xkqzvw'); await page.waitForTimeout(450);
  ok(await page.locator('.r8-res li').count() === 0, 'fără potrivire: listă goală'); await page.keyboard.press('Escape');
  // căutarea veche rămâne
  await page.locator('#q').fill('808'); await page.waitForTimeout(300);
  ok(await page.locator('#list .it').count() >= 1, 'căutarea existentă din listă filtrează în continuare');
  // copie de siguranță
  await page.locator('#q').fill('');
  await page.locator('#list .it').first().click();
  await page.locator('#bFav').click();
  const bundle = await page.evaluate(async () => JSON.stringify(await FFF.bundle.build()));
  ok(bundle.length > 50 && /"app":"acordaj"/.test(bundle), 'copia .fff.json se construiește pentru acordaj', bundle.slice(0, 120));
  ok(/fav/i.test(bundle), 'copia conține favoritele/progresul');
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror/CSP în tot setul', errs); ok(net.length === 0, '0 cereri de rețea în tot setul', net);
console.log(`\n${pass} ok, ${fail} eșuate`); await browser.close(); process.exit(fail ? 1 : 0);
