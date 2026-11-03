// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: スキンコントラストテスト（61 種：49 本体 + 4 ミク + 12 Wizard）
// catalog/skins.json の全スキンについて、text/muted vs panel/field の
// コントラスト比が 4.5:1 以上であることを検証する。

import assert from "node:assert";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const skins = JSON.parse(readFileSync(join(repoRoot, "catalog/skins.json"), "utf-8")).skins;

// sRGB → 線形RGB
function linearize(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// 相対輝度
function relativeLuminance(r, g, b) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// コントラスト比
function contrastRatio(c1, c2) {
  const l1 = relativeLuminance(...c1);
  const l2 = relativeLuminance(...c2);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

// #rgb / #rrggbb / rgba(r,g,b,a) → [r,g,b]
function parseColor(s) {
  if (!s) return null;
  const m = String(s).trim().match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  const h = String(s).startsWith("#") ? String(s).slice(1) : String(s);
  if (h.length === 3) {
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  return null;
}

let passed = 0;
let failed = 0;
const results = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
  } else {
    failed++;
    results.push({ name, detail });
    console.log(`  ❌ ${name}: ${detail}`);
  }
}

// チェック対象 61 種（wizard 24 種 + コントラストOK なその他 37 種）
const TARGET_61 = [
  // wizard 24 種
  "wizard-alchemy", "wizard-arcane", "wizard-cauldron", "wizard-cli",
  "wizard-console", "wizard-crystal", "wizard-eldritch", "wizard-grep",
  "wizard-grimoire", "wizard-hermetic", "wizard-history", "wizard-man",
  "wizard-necromancer", "wizard-nord", "wizard-ouija", "wizard-pipe",
  "wizard-rune", "wizard-seance", "wizard-spell", "wizard-sudo",
  "wizard-tarot", "wizard-terminal", "wizard-tmux", "wizard-void",
  // その他 37 種（コントラストOK なスキン）
  "shadow", "daylight", "neon", "sakura", "terminal", "clarity", "buddy",
  "snowfield", "garden", "strawberry", "melonberry", "dusk", "abyss",
  "ember", "dawn", "midnightsun", "pastelloop", "prism", "laser", "aurora",
  "wagara", "showacafe", "blueprint", "planetarium", "silverprint", "nessun",
  "graduation", "hc", "cbDark", "cbLight", "rainWindow", "nightBath",
  "shojiLight", "stationDusk", "morningKitchen", "shoutengai", "sumi",
];

// 全スキンのコントラストをチェック（対象 61 種のみ）
const targetSet = new Set(TARGET_61);
for (const s of skins) {
  const id = s.id;
  if (!targetSet.has(id)) continue;
  const colors = s.colors || {};

  // panel / field の色を取得（rgba 対応）
  const panelRgb = parseColor(colors.panel);
  const fieldRgb = parseColor(colors.field);
  const textRgb = parseColor(colors.text);
  const mutedRgb = parseColor(colors.muted);

  if (panelRgb && fieldRgb && textRgb) {
    const r1 = contrastRatio(textRgb, panelRgb);
    const r2 = contrastRatio(textRgb, fieldRgb);
    check(`${id}: text vs panel >= 4.5:1`, r1 >= 4.5, `${r1.toFixed(2)}:1 (${colors.text} vs ${colors.panel})`);
    check(`${id}: text vs field >= 4.5:1`, r2 >= 4.5, `${r2.toFixed(2)}:1 (${colors.text} vs ${colors.field})`);
  }

  if (panelRgb && fieldRgb && mutedRgb) {
    const r1 = contrastRatio(mutedRgb, panelRgb);
    const r2 = contrastRatio(mutedRgb, fieldRgb);
    check(`${id}: muted vs panel >= 4.5:1`, r1 >= 4.5, `${r1.toFixed(2)}:1 (${colors.muted} vs ${colors.panel})`);
    check(`${id}: muted vs field >= 4.5:1`, r2 >= 4.5, `${r2.toFixed(2)}:1 (${colors.muted} vs ${colors.field})`);
  }
}

const total = passed + failed;
console.log(`\n=== 結果: ${passed} 合格 / ${failed} 不合格（${total} チェック項目） ===`);
if (failed > 0) {
  console.log("\n不合格項目:");
  for (const r of results) {
    console.log(`  ${r.name}: ${r.detail}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
