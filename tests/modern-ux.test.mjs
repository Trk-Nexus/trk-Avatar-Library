// SPDX-License-Identifier: GPL-3.0-or-later
// trk Modern UX: モダン UX 自動テスト（EVALS に基づく）
// Modern Web Guidance (https://github.com/GoogleChrome/modern-web-guidance-src) に準拠

import assert from "node:assert";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

console.log("=== trk Modern UX テスト（EVALS 基準）===\n");

// --- Phase 1: 基盤整備 ---

// E1. docs/CONTEXT.md の存在と内容
test("E1: docs/CONTEXT.md 存在", () => {
  assert.ok(readFileSync(join(repoRoot, "docs/CONTEXT.md"), "utf-8"));
});

test("E1: CONTEXT.md に設計原則記載", () => {
  const content = readFileSync(join(repoRoot, "docs/CONTEXT.md"), "utf-8");
  assert.ok(content.includes("モダン CSS ファースト"), "モダン CSS ファーストが記載されていません");
  assert.ok(content.includes("アクセシビリティ優先"), "アクセシビリティ優先が記載されていません");
  assert.ok(content.includes("PWA ファースト"), "PWA ファーストが記載されていません");
});

test("E1: CONTEXT.md に Modern Web Guidance 参照URL記載", () => {
  const content = readFileSync(join(repoRoot, "docs/CONTEXT.md"), "utf-8");
  assert.ok(content.includes("modern-web-guidance-src"), "Modern Web Guidance 参照URLが記載されていません");
});

// E2. docs/EVALS.md の存在と内容
test("E2: docs/EVALS.md 存在", () => {
  assert.ok(readFileSync(join(repoRoot, "docs/EVALS.md"), "utf-8"));
});

// E3. prefers-color-scheme 対応（CSS）
test("E3: CSS に prefers-color-scheme 記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("prefers-color-scheme"), "prefers-color-scheme が記載されていません");
});

// E4. CSS カスタムプロパティ体系の統一
test("E4: CSS に --color-* 変数記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("--color-bg"), "--color-bg が記載されていません");
  assert.ok(css.includes("--color-text"), "--color-text が記載されていません");
  assert.ok(css.includes("--color-accent"), "--color-accent が記載されていません");
});

test("E4: CSS に --skin-* 変数記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("--skin-bg"), "--skin-bg が記載されていません");
  assert.ok(css.includes("--skin-panel"), "--skin-panel が記載されていません");
});

// --- Phase 2: モダン CSS 適用 ---

// E6. color-scheme / light-dark()
test("E6: CSS に color-scheme: light dark 記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("color-scheme: light dark"), "color-scheme: light dark が記載されていません");
});

test("E6: CSS に light-dark() 記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("light-dark("), "light-dark() が記載されていません");
});

// E8. アンカーポジショニング
test("E8: CSS にアンカーポジショニング記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("position-anchor"), "position-anchor が記載されていません");
  assert.ok(css.includes("position-try-options"), "position-try-options が記載されていません");
});

// E9. カスタマイズ可能 <select>
test("E9: CSS にカスタムセレクト（appearance: none）記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("appearance: none"), "appearance: none が記載されていません");
});

// E7. accent-color
test("E7: CSS に accent-color 記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("accent-color"), "accent-color が記載されていません");
});

// --- Phase 3: UX コンポーネントのモダン化 ---

// E10. スキンプレビュー モダンUI（index.html、設定パネル内）
test("E10: index.html にスキンプレビューグリッド記載", () => {
  const html = readFileSync(join(repoRoot, "index.html"), "utf-8");
  assert.ok(html.includes('id="skin-preview-grid"'), 'skin-preview-grid IDが記載されていません');
  assert.ok(html.includes('skin-preview-card'), 'skin-preview-card クラスが記載されていません');
});

// E11. CLI ターミナル モダン化（カーソルアニメーション強化）
test("E11: CSS にカーソルアニメーション強化記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("blink-fast"), "blink-fast が記載されていません");
  assert.ok(css.includes("blink-slow"), "blink-slow が記載されていません");
});

// E12. アクセシビリティ（ARIA ラベル、フォーカスリング）
test("E12: index.html に ARIA ラベル記載", () => {
  const html = readFileSync(join(repoRoot, "index.html"), "utf-8");
  assert.ok(html.includes("aria-label"), "aria-label が記載されていません");
  assert.ok(html.includes("aria-live"), "aria-live が記載されていません");
});

test("E12: CSS にフォーカスリング（:focus-visible）記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes(":focus-visible"), ":focus-visible が記載されていません");
});

// E13. レスポンシブ対応（メディアクエリ）
test("E13: CSS にメディアクエリ（レスポンシブ）記載", () => {
  const css = readFileSync(join(repoRoot, "css/style.css"), "utf-8");
  assert.ok(css.includes("@media"), "@media メディアクエリが記載されていません");
  assert.ok(css.includes("max-width: 640px"), "640px ブレークポイントが記載されていません");
});

// --- Phase 4: パフォーマンス・PWA 強化 ---

// E14. Service Worker 戦略
test("E14: sw.js に Service Worker 戦略記載", () => {
  const sw = readFileSync(join(repoRoot, "sw.js"), "utf-8");
  assert.ok(sw.includes("caches.open"), "caches.open が記載されていません");
  assert.ok(sw.includes("skipWaiting"), "skipWaiting が記載されていません");
  assert.ok(sw.includes("clients.claim"), "clients.claim が記載されていません");
});

// E16. Core Web Vitals 測定（index.html）
test("E16: index.html に Core Web Vitals 測定スクリプト記載", () => {
  const html = readFileSync(join(repoRoot, "index.html"), "utf-8");
  assert.ok(html.includes("PerformanceObserver"), "PerformanceObserver が記載されていません");
  assert.ok(html.includes("largest-contentful-paint"), "LCP 測定が記載されていません");
  assert.ok(html.includes("first-input"), "FID 測定が記載されていません");
  assert.ok(html.includes("layout-shift"), "CLS 測定が記載されていません");
});

// E15. リソースヒント（index.html）
test("E15: index.html にリソースヒント記載", () => {
  const html = readFileSync(join(repoRoot, "index.html"), "utf-8");
  assert.ok(html.includes("preconnect"), "preconnect が記載されていません");
  assert.ok(html.includes("dns-prefetch"), "dns-prefetch が記載されていません");
  assert.ok(html.includes("preload"), "preload が記載されていません");
});

// --- セキュリティ（js/data.js） ---

test("セキュリティ: sanitizeCliLook で使用禁止文字拒否", async () => {
  const { sanitizeCliLook } = await import(join(repoRoot, "js/data.js"));
  assert.throws(() => sanitizeCliLook({ font: "C:\\Windows", prompt: ">" }), /使用禁止文字/);
  assert.throws(() => sanitizeCliLook({ font: "../secret", prompt: ">" }), /使用禁止文字/);
  assert.throws(() => sanitizeCliLook({ font: "~", prompt: ">" }), /使用禁止文字/);
});

// --- 全テスト結果 ---

console.log(`\n=== 結果: ${passed} 合格 / ${failed} 不合格 ===`);
process.exit(failed > 0 ? 1 : 0);
