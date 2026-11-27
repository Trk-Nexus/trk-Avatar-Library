// SPDX-License-Identifier: GPL-3.0-or-later
// 統合ライブラリUI & trk-PWA 受け渡しハブ 実 Chromium E2E テスト（サブパス配信・外部通信ゼロ・オフライン動作・XSS防御）
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';

const root = resolve(import.meta.dirname, '..');
const prefix = '/trk-Avatar-Library/';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  const reqPath = new URL(req.url, 'http://localhost').pathname;
  if (!reqPath.startsWith(prefix)) {
    res.writeHead(404);
    return res.end();
  }
  const file = resolve(root, '.' + reqPath.slice(prefix.length - 1) + (reqPath.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + sep)) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;

try {
  browser = await playwright.launch({
    args: chromium.args,
    executablePath: process.env.CHROMIUM_PATH || (await chromium.executablePath()),
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  const externalRequests = [];

  page.on('pageerror', (err) => pageErrors.push(err.message));

  // 外部通信を完全遮断し、library.html 側からは外部リクエストが1件も飛ばないことを検証
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(base) || url.startsWith('blob:') || url.startsWith('data:')) {
      return route.continue();
    }
    externalRequests.push(url);
    return route.abort();
  });

  // 1. index.html から統合ライブラリへの遷移
  await page.goto(base + prefix + 'index.html');
  assert.equal(await page.locator('.library-hub-link').count(), 1);
  externalRequests.length = 0; // index.html 側の preconnect 等をリセットし library.html 単体の無通信を検査
  await page.click('.library-hub-link');
  await page.waitForURL((u) => u.pathname.endsWith('/library.html'));

  // Service Worker と初期目録の描画完了を待機
  await page.waitForFunction(() => document.getElementById('stat-skins')?.textContent?.includes('291'), null, {
    timeout: 10000,
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 10000 });
  assert.deepEqual(externalRequests, [], 'library.html は外部通信を一切行わないこと');

  // 2. ヒーロー統計の表示値検証
  assert.equal(await page.textContent('#stat-skins'), '291 種 / 13 巻');
  assert.equal(await page.textContent('#stat-packs'), '30 本（書体 29 本・42 ウェイト）');
  assert.equal(await page.textContent('#stat-pairings'), '14 組・6 役');
  assert.equal(await page.textContent('#stat-remodern'), '正式登録 0 件（制作案 1 件）');
  assert.match(await page.textContent('#stat-pwa-ref'), /^trk325 /);

  // 3. スキンタブ：保留・低可読フィルタと詳細モーダル・言語切替・XSS 防御
  await page.selectOption('#filter-skin-compat', 'holdback');
  assert.equal(await page.textContent('#count-skins'), '3');
  assert.equal(await page.locator('#skins-grid .hub-card').count(), 3);

  await page.locator('#skins-grid .hub-card[data-skin-id="house-edge"] button').first().click();
  assert.equal(await page.locator('#skin-detail-dialog').evaluate((d) => d.open), true);
  assert.match(await page.textContent('#dialog-skin-body'), /見づらさを意図した配色/);
  assert.match(await page.textContent('#dialog-skin-body'), /skin\.shadow-taiko v1/);
  await page.click('#dialog-close-btn');
  assert.equal(await page.locator('#skin-detail-dialog').evaluate((d) => d.open), false);

  await page.selectOption('#filter-skin-compat', 'all');
  await page.selectOption('#hub-locale', 'en');
  await page.fill('#hub-search', 'wizard-cli');
  assert.equal(await page.locator('#skins-grid .hub-card').count(), 1);
  await page.selectOption('#hub-locale', 'ja');

  // XSS ペイロード注入でもスクリプト実行されず安全に 0 件となること
  await page.fill('#hub-search', '<img src=x onerror="window.__hubXss=1">');
  assert.equal(await page.textContent('#count-skins'), '0');
  assert.equal(await page.evaluate(() => window.__hubXss), undefined);
  await page.click('#hub-search-clear');
  assert.equal(await page.textContent('#count-skins'), '291');

  // 4. キーボード操作で書体＆パックタブへ移動し絞り込み検証
  await page.focus('#tab-skins');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getAttribute('#tab-packs', 'aria-selected'), 'true');
  assert.equal(await page.locator('#packs-grid .hub-card').count(), 30);
  await page.locator('#pack-tag-chips .hub-chip', { hasText: '#ドット' }).click();
  assert.equal(await page.locator('#packs-grid .hub-card').count(), 1);
  await page.locator('#pack-tag-chips .hub-chip', { hasText: 'すべてのタグ' }).click();

  // 5. 書体の組み合わせタブ（14組）
  await page.click('#tab-typography');
  assert.equal(await page.locator('#typography-grid .hub-card').count(), 14);

  // 6. trk-re-modern タブ（正式登録0件と制作案・題字候補3種の厳格な分離表示）
  await page.click('#tab-remodern');
  assert.match(await page.textContent('#remodern-canonical-box'), /正式登録数: 0 件/);
  assert.equal(await page.locator('#remodern-drafts-grid .hub-card').count(), 1);
  assert.match(await page.textContent('#remodern-drafts-grid'), /制作案・未登録/);
  assert.equal(await page.locator('#remodern-title-fonts-grid .hub-card').count(), 3);

  // 7. trk-PWA 受け渡し＆ブラウザ内 JSON 事前検査タブ
  await page.click('#tab-pwa');
  assert.match(await page.textContent('#pwa-deferred-scope'), /3Dアバター（VRM \/ VRMA \/ MMD）/);
  assert.equal(await page.locator('#pwa-active-contracts .hub-card').count(), 7);
  assert.equal(await page.locator('#pwa-requested-receivers .hub-card').count(), 7);

  await page.click('#sample-skin-vol');
  assert.match(await page.textContent('#inspector-result'), /検査合格/);
  await page.click('#sample-custom-skin');
  assert.match(await page.textContent('#inspector-result'), /skin\.shadow-taiko v1/);
  await page.click('#sample-title-backup');
  assert.match(await page.textContent('#inspector-result'), /trk-title-font-works-backup v1/);

  await page.fill('#inspector-input', '{broken-json');
  await page.click('#inspector-run');
  assert.match(await page.textContent('#inspector-result'), /JSON として読み取れません/);

  // 8. オフライン状態でのリロード動作検証（Service Worker キャッシュ完結）
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => document.getElementById('stat-skins')?.textContent?.includes('291'), null, {
    timeout: 10000,
  });
  assert.equal(await page.textContent('#stat-packs'), '30 本（書体 29 本・42 ウェイト）');
  await context.setOffline(false);

  assert.deepEqual(pageErrors, [], `ページ実行時エラーが発生しました: ${pageErrors.join('; ')}`);
  console.log('✅ library-hub: 横断検索・受け渡し変換・re-modern分離・JSON検査・XSS防御・オフライン完結');
} finally {
  await browser?.close();
  server.close();
}
