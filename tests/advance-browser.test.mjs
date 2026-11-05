// SPDX-License-Identifier: GPL-3.0-or-later
// Real Chromium regression tests for the Phase 10 review (including subpath hosting).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';

const root = resolve(import.meta.dirname, '..');
const prefix = '/trk-Avatar-Library/';
const mime = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png'};
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/seed') { res.writeHead(200, {'Content-Type':'text/html'}); return res.end('<title>seed</title>'); }
  if (!path.startsWith(prefix)) { res.writeHead(404); return res.end(); }
  const file = resolve(root, '.' + path.slice(prefix.length - 1) + (path.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + sep)) { res.writeHead(403); return res.end(); }
  try { const data = await readFile(file); res.writeHead(200, {'Content-Type': mime[extname(file)] || 'application/octet-stream'}); res.end(data); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await playwright.launch({args: chromium.args, executablePath: process.env.CHROMIUM_PATH || await chromium.executablePath(), headless: true});
  const context = await browser.newContext({viewport:{width:1100,height:900}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/seed');
  await page.evaluate(async () => {
    localStorage.setItem('trk-advance-reduce-motion', 'true');
    await caches.open('trk-pwa-sibling');
    await caches.open('trk-avatar-library-obsolete');
  });
  await page.goto(base + prefix + 'index.html');
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, {timeout:10000});
  await page.click('#settings-toggle');

  // M1 + M2: every independently opened section actually renders, and expand/collapse all works.
  const sections = page.locator('.settings-accordion-item');
  assert.equal(await sections.count(), 6);
  for (let i = 0; i < 6; i++) {
    const section = sections.nth(i);
    await section.locator('summary').click();
    assert.equal(await section.evaluate(el => el.open), true);
    assert.equal(await section.locator('.settings-accordion-content').evaluate(el => el.checkVisibility() && getComputedStyle(el).contentVisibility !== 'hidden' && el.getBoundingClientRect().height > 16), true);
    await section.locator('summary').click();
  }
  await page.click('#settings-accordion-expand-all');
  assert.equal(await sections.evaluateAll(els => els.filter(el => el.open).length), 6);
  await page.click('#settings-accordion-collapse-all');
  assert.equal(await sections.evaluateAll(els => els.filter(el => el.open).length), 0);
  await page.locator('#settings-accordion-advance summary').click();

  // M3: only the scroll container is masked; the middle remains opaque.
  await page.check('#settings-advance-edge-fade');
  const mask = await page.locator('#settings-panel').evaluate(el => getComputedStyle(el).maskImage);
  assert.match(mask, /(?:transparent|rgba\(0, 0, 0, 0\)) 0%.*(?:rgb\(0, 0, 0\)|black) 4%.*(?:rgb\(0, 0, 0\)|black) 96%.*(?:transparent|rgba\(0, 0, 0, 0\)) 100%/);
  assert.equal(await page.locator('#settings-accordion-advance .settings-accordion-content').evaluate(el => getComputedStyle(el).maskImage), 'none');
  await page.uncheck('#settings-advance-edge-fade');
  assert.equal(await page.locator('#settings-panel').evaluate(el => getComputedStyle(el).maskImage), 'none');

  // M4: accent-color reflects the skin by default, and can be switched off/on.
  const accent = page.locator('#settings-advance-accent-form-controls');
  assert.notEqual(await accent.evaluate(el => getComputedStyle(el).accentColor), 'auto');
  await accent.uncheck();
  assert.equal(await accent.evaluate(el => getComputedStyle(el).accentColor), 'auto');
  await accent.check();
  assert.notEqual(await accent.evaluate(el => getComputedStyle(el).accentColor), 'auto');

  // M5: only the existing manual control exists; OS reduce motion remains unconditional.
  for (const slug of ['reduce-motion', 'color-ramp', 'command-palette', 'focus-loop', 'pull-to-reveal', 'cursor-anim', 'hidden-hints', 'top-layer', 'pwa-prompt']) {
    assert.equal(await page.locator(`#settings-advance-${slug}`).count(), 0);
  }
  assert.equal(await page.locator('[id^=settings-advance-][type=checkbox]').count(), 10);
  await page.locator('#settings-accordion-terminal summary').click();
  const motion = page.locator('#settings-reduce-motion');
  assert.equal(await motion.isChecked(), false);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')), false);
  await motion.check();
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')), true);
  await motion.uncheck();
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')), false);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.ok(await page.locator('#settings-panel').evaluate(el => parseFloat(getComputedStyle(el).animationDuration) < 0.01));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.uncheck('#settings-advance-anim-enabled');
  assert.equal(await page.locator('#settings-panel').evaluate(el => getComputedStyle(el).animationName), 'none');

  // Persistence and dictionary reset do not disturb the existing motion control.
  await page.check('#settings-advance-edge-fade');
  await motion.check();
  await page.reload();
  await page.click('#settings-toggle');
  await page.locator('#settings-accordion-expand-all').click();
  assert.equal(await page.locator('#settings-advance-edge-fade').isChecked(), true);
  assert.equal(await page.locator('#settings-advance-anim-enabled').isChecked(), false);
  await page.click('#settings-wizard-dict-reset');
  assert.equal(await page.locator('#settings-advance-edge-fade').isChecked(), false);
  assert.equal(await page.locator('#settings-advance-anim-enabled').isChecked(), true);
  assert.equal(await motion.isChecked(), true);
  assert.deepEqual(errors, []);
  await page.keyboard.press('Escape');
  const payload = '<img src=x onerror="window.injected=1">';
  await page.locator('#cli-input').fill(payload);
  await page.locator('#cli-input').press('Enter');
  assert.equal(await page.locator('#cli-term img').count(), 0);
  assert.ok((await page.locator('#cli-term').innerText()).includes(payload));
  assert.equal(await page.evaluate(() => window.injected), undefined);

  // Manifest is scoped to the subdirectory and SW activation leaves sibling caches alone.
  assert.equal(await page.locator('link[rel=manifest]').evaluate(el => new URL(el.href).pathname), prefix + 'manifest.json');
  const manifest = await (await page.request.get(base + prefix + 'manifest.json')).json();
  for (const icon of manifest.icons) assert.equal((await page.request.get(new URL(icon.src, base + prefix + 'manifest.json').href)).status(), 200);
  const keys = await page.evaluate(() => caches.keys());
  assert.ok(keys.includes('trk-pwa-sibling'));
  assert.ok(!keys.includes('trk-avatar-library-obsolete'));
  assert.ok(keys.some(key => key.startsWith('trk-avatar-library-')));
  await context.setOffline(true);
  await page.reload();
  assert.equal(await page.locator('#settings-toggle').count(), 1);
  assert.equal(await page.locator('#settings-panel').evaluate(el => getComputedStyle(el).position), 'fixed');
  await context.setOffline(false);
  // Public volume navigation and actual JSON downloads on a subdirectory-hosted site.
  await page.setViewportSize({width:390,height:844});
  await page.click('.volumes-link');
  assert.equal(await page.locator('.volume').count(), 13);
  const wizard = page.locator('.volume').filter({hasText:'wizard ウィザード'});
  await wizard.locator('summary').click();
  assert.ok((await wizard.innerText()).includes('62 種'));
  const downloadUrl = await wizard.locator('a.download').getAttribute('href');
  const volumeResponse = await page.request.get(new URL(downloadUrl, page.url()).href);
  assert.equal(volumeResponse.status(), 200);
  const volume = await volumeResponse.json();
  assert.equal(volume.count, 62);
  const itemUrl = await wizard.locator('li a').first().getAttribute('href');
  const item = await (await page.request.get(new URL(itemUrl, page.url()).href)).json();
  assert.deepEqual(item, volume.skins[0]);
  await wizard.locator('a').filter({hasText:'見本を見る'}).click();
  assert.equal(await page.locator('.card').count(), 62);
  await page.locator('#q').fill('wizard-abramelin');
  assert.equal(await page.locator('.card').count(), 1);
  assert.ok((await page.locator('.card').innerText()).includes('wizard-abramelin'));
  // Every linked volume preview must execute and render its whole catalog on mobile.
  const definitions = JSON.parse(await readFile(resolve(root, 'skin-volumes/volumes.json'), 'utf8'));
  for (const group of definitions.groups.filter(g => g.preview)) {
    await page.goto(base + prefix + group.preview);
    assert.equal(await page.locator('.card').count(), group.id === 'wizard' ? 62 : group.ids.length, group.id);
    if (group.ids) {
      await page.locator('#q').fill(group.ids[0]);
      assert.ok(await page.locator('.card').count() >= 1, group.id + ': search');
    }
  }
  assert.deepEqual(errors, []);
  console.log('✅ advance wizard: Chromium behavior, persistence, XSS, subpath and offline');
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
