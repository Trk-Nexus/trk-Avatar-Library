#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// trk CLI 用スキン バリデーションツール（trk268 受け入れ条件 §9.4）
//
// 使い方:
//   node tools/check-cli-skin.mjs <skin.json>        # 人が読む
//   node tools/check-cli-skin.mjs <skin.json> --json  # 機械向け（CI 用）
//
// 終了コード:
//   0 = 受け取り（OK）
//   1 = 名前なし（cat に "wizard" が含まれていないなど）
//   2 = 読めない（JSON パース失敗・必須項目欠落・コントラスト不足）

import fs from "fs";

const EXIT_OK = 0;
const EXIT_NAME_MISSING = 1;
const EXIT_UNREADABLE = 2;

// sRGB → 線形RGB
function linearize(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// 相対輝度
function relativeLuminance(r, g, b) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// コントラスト比（1.0 〜 21.0）
function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(...color1);
  const l2 = relativeLuminance(...color2);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

// #rgb / #rrggbb → [r,g,b]
function parseHex(hex) {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  if (h.length === 3) {
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  return null;
}

function hasForbiddenChars(value) {
  if (typeof value !== "string") return false;
  return /[/`\\\\~:]/.test(value) || /\\.\./.test(value) || /^[Cc]:/.test(value);
}

function main() {
  const args = process.argv.slice(2);
  const jsonPath = args.find((a) => !a.startsWith("-"));
  const jsonMode = args.includes("--json");

  if (!jsonPath) {
    if (!jsonMode) console.error("使い方: node tools/check-cli-skin.mjs <skin.json> [--json]");
    process.exit(EXIT_UNREADABLE);
  }

  let raw;
  try {
    raw = fs.readFileSync(jsonPath, "utf-8");
  } catch (e) {
    if (!jsonMode) console.error(`読めません: ${jsonPath}`);
    process.exit(EXIT_UNREADABLE);
  }

  let skin;
  try {
    skin = JSON.parse(raw);
  } catch (e) {
    if (!jsonMode) console.error(`JSON パース失敗: ${jsonPath}`);
    process.exit(EXIT_UNREADABLE);
  }

  const errors = [];
  const warnings = [];

  // --- A. 見分け方: cat に "wizard" を含む ---
  const cats = Array.isArray(skin.cat) ? skin.cat : [];
  const hasWizard = cats.includes("wizard");
  if (!hasWizard) {
    errors.push(`cat に "wizard" が含まれていません（現在: ${JSON.stringify(cats)}）`);
  }

  // --- B. 端末が読む色: ui の 9 変数 ---
  const colors = skin.colors || {};
  const requiredColors = ["bg", "panel", "text", "muted", "field", "border", "accent"];
  for (const c of requiredColors) {
    if (!colors[c]) {
      errors.push(`colors.${c} が不足しています`);
    }
  }

  // --- C. コントラスト ---
  // text/muted vs panel/field: 4.5:1 以上
  for (const fg of ["text", "muted"]) {
    for (const bg of ["panel", "field"]) {
      if (colors[fg] && colors[bg]) {
        const fgRgb = parseHex(colors[fg]);
        const bgRgb = parseHex(colors[bg]);
        if (fgRgb && bgRgb) {
          const ratio = contrastRatio(fgRgb, bgRgb);
          if (ratio < 4.5) {
            errors.push(`コントラスト不足: ${fg}(${colors[fg]}) vs ${bg}(${colors[bg]}) = ${ratio.toFixed(2)}:1（4.5:1 以上必要）`);
          }
        }
      }
    }
  }
  // エラー行 (--j-miss / game.miss) vs field: 3:1 以上（任意だが指定があればチェック）
  if (colors["j-miss"] && colors.field) {
    const missRgb = parseHex(colors["j-miss"]);
    const fieldRgb = parseHex(colors.field);
    if (missRgb && fieldRgb) {
      const ratio = contrastRatio(missRgb, fieldRgb);
      if (ratio < 3) {
        errors.push(`コントラスト不足: j-miss(${colors["j-miss"]}) vs field(${colors.field}) = ${ratio.toFixed(2)}:1（3:1 以上必要）`);
      }
    }
  }

  // --- D. cli の値 ---
  const cli = skin.cli || {};
  if (cli.font && hasForbiddenChars(cli.font)) {
    errors.push(`cli.font に使用禁止文字が含まれています: ${cli.font}`);
  }
  if (cli.prompt && typeof cli.prompt === "string") {
    if (cli.prompt.length < 1 || cli.prompt.length > 4) {
      errors.push(`cli.prompt は 1〜4 文字である必要があります（現在: ${cli.prompt.length} 文字）`);
    }
    if (/["'\\`~]/.test(cli.prompt)) {
      errors.push(`cli.prompt に使用禁止文字が含まれています: ${cli.prompt}`);
    }
  }
  if (cli.caret && typeof cli.caret === "string") {
    if (!cli.caret.startsWith("#") && cli.caret !== "currentColor") {
      errors.push(`cli.caret は #rgb / #rrggbb / currentColor である必要があります（現在: ${cli.caret}）`);
    }
  }
  if (cli.scan !== undefined && typeof cli.scan === "number") {
    if (cli.scan < 0 || cli.scan > 0.6) {
      errors.push(`cli.scan は 0 〜 0.6 の範囲である必要があります（現在: ${cli.scan}）`);
    }
  }

  // --- F. 使用禁止: 外部 URL・フォント CDN・fetch・ファイルパス ---
  const skinStr = JSON.stringify(skin);
  if (/https?:\/\//.test(skinStr)) {
    warnings.push(`skin に外部 URL が含まれています（オフライン前提のため非推奨）`);
  }
  if (hasForbiddenChars(JSON.stringify(skin.id || ""))) {
    errors.push(`skin.id に使用禁止文字が含まれています`);
  }

  // --- 判定 ---
  const exitCode = errors.length > 0 ? EXIT_UNREADABLE : EXIT_OK;

  if (jsonMode) {
    const result = {
      ok: exitCode === EXIT_OK,
      exitCode,
      id: skin.id,
      name: skin.name,
      cat: cats,
      hasWizard,
      errors,
      warnings,
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`=== CLI スキン バリデーション: ${jsonPath} ===`);
    console.log(`id: ${skin.id || "(なし)"}`);
    console.log(`name: ${skin.name || "(なし)"}`);
    console.log(`cat: ${JSON.stringify(cats)}`);
    console.log(`wizard 対応: ${hasWizard ? "✅" : "❌"}`);
    if (errors.length > 0) {
      console.log("\nエラー:");
      for (const e of errors) console.log(`  ❌ ${e}`);
    }
    if (warnings.length > 0) {
      console.log("\n警告:");
      for (const w of warnings) console.log(`  ⚠️  ${w}`);
    }
    if (errors.length === 0 && warnings.length === 0) {
      console.log("\n✅ 問題ありません（受け取り可能）");
    }
    console.log(`\n終了コード: ${exitCode}（0=受け取り / 1=名前なし / 2=読めない）`);
  }

  process.exit(exitCode);
}

main();
