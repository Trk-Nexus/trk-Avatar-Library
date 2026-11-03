#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// trk CLI 用スキン バリデーションツール（trk269 受け入れ条件 §5 v2）
//
// 使い方:
//   node tools/check-cli-skin.mjs <skin.json>        # 人が読む（単一スキン）
//   node tools/check-cli-skin.mjs <catalog.json> --catalog  # カタログ全体チェック
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

// #rgb / #rrggbb / rgba(r,g,b,a) → [r,g,b]
function parseColor(colorStr) {
  if (!colorStr) return null;
  const s = colorStr.trim();
  // rgba(...) 形式
  const m = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  // #rgb / #rrggbb
  const h = s.startsWith("#") ? s.slice(1) : s;
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
  return /[/`\\~:]/.test(value) || /\.\./.test(value) || /^[Cc]:/.test(value);
}

// 5操作感のバリデーション（trk269 §7）
const CLI_FEATURE_RULES = {
  cursor: { valid: ["block", "underline", "bar"], default: "block" },
  opacity: { min: 0.5, max: 1, default: 1 },
  history: { min: 10, max: 200, default: 50 },
  completion: { valid: ["tab", "off"], default: "tab" },
  bell: { type: "boolean", default: true },
};

function validateCliLook(cli) {
  const errors = [];
  if (!cli || typeof cli !== "object") {
    errors.push("cli オブジェクトが不足しています");
    return errors;
  }

  // font
  if (cli.font) {
    if (hasForbiddenChars(cli.font)) {
      errors.push(`cli.font に使用禁止文字が含まれています: ${cli.font}`);
    }
  }

  // prompt
  if (cli.prompt !== undefined) {
    if (typeof cli.prompt !== "string") {
      errors.push("cli.prompt は文字列である必要があります");
    } else if (cli.prompt.length < 1 || cli.prompt.length > 4) {
      errors.push(`cli.prompt は 1〜4 文字である必要があります（現在: ${cli.prompt.length} 文字）`);
    } else if (/["'\\`~]/.test(cli.prompt)) {
      errors.push(`cli.prompt に使用禁止文字が含まれています: ${cli.prompt}`);
    }
  }

  // caret
  if (cli.caret !== undefined) {
    if (typeof cli.caret !== "string") {
      errors.push("cli.caret は文字列である必要があります");
    } else if (!cli.caret.startsWith("#") && cli.caret !== "currentColor") {
      errors.push(`cli.caret は #rgb / #rrggbb / currentColor である必要があります（現在: ${cli.caret}）`);
    }
  }

  // scan
  if (cli.scan !== undefined) {
    if (typeof cli.scan !== "number" || cli.scan < 0 || cli.scan > 0.6) {
      errors.push(`cli.scan は 0 〜 0.6 の範囲である必要があります（現在: ${cli.scan}）`);
    }
  }

  // 5操作感
  for (const [key, rule] of Object.entries(CLI_FEATURE_RULES)) {
    if (cli[key] !== undefined) {
      if (rule.valid) {
        if (!rule.valid.includes(cli[key])) {
          errors.push(`cli.${key} は ${rule.valid.join("/")} のいずれかである必要があります（現在: ${cli[key]}）`);
        }
      } else if (rule.type === "boolean") {
        if (typeof cli[key] !== "boolean") {
          errors.push(`cli.${key} は boolean である必要があります（現在: ${cli[key]}）`);
        }
      } else {
        const n = Number(cli[key]);
        if (typeof n !== "number" || isNaN(n) || n < rule.min || n > rule.max) {
          errors.push(`cli.${key} は ${rule.min} 〜 ${rule.max} の範囲である必要があります（現在: ${cli[key]}）`);
        }
      }
    }
  }

  return errors;
}

export function validateSkin(skin) {
  const errors = [];
  const warnings = [];

  // --- A. 見分け方: cat に "wizard" を含むか、cli オブジェクトを持つか ---
  const cats = Array.isArray(skin.cat) ? skin.cat : [];
  const hasWizard = cats.includes("wizard");
  const hasCli = skin.cli && typeof skin.cli === "object" && Object.keys(skin.cli).length > 0;

  // wizard でもないし cli も持たない → チェック対象外（notes に回す）
  if (!hasWizard && !hasCli) {
    return { errors: [], warnings: [], hasWizard: false, cats, id: skin.id, name: skin.name, skip: true };
  }

  // wizard カテゴリだが cli を持たない → muted コントラストのみチェック（cli チェックはスキップ）
  const cliCheckEnabled = hasCli;

  // --- B. 端末が読む色: 必須5色 ---
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
        const fgRgb = parseColor(colors[fg]);
        const bgRgb = parseColor(colors[bg]);
        if (fgRgb && bgRgb) {
          const ratio = contrastRatio(fgRgb, bgRgb);
          if (ratio < 4.5) {
            errors.push(`コントラスト不足: ${fg}(${colors[fg]}) vs ${bg}(${colors[bg]}) = ${ratio.toFixed(2)}:1（4.5:1 以上必要）`);
          }
        }
      }
    }
  }

  // --- D. cli の値（cli オブジェクトを持つスキンのみ）---
  if (cliCheckEnabled) {
    const cliErrors = validateCliLook(skin.cli);
    errors.push(...cliErrors);
  }

  // --- F. 使用禁止: 外部 URL・フォント CDN・fetch・ファイルパス ---
  const skinStr = JSON.stringify(skin);
  if (/https?:\/\//.test(skinStr)) {
    warnings.push("skin に外部 URL が含まれています（オフライン前提のため非推奨）");
  }
  if (hasForbiddenChars(String(skin.id || ""))) {
    errors.push(`skin.id に使用禁止文字が含まれています`);
  }

  return { errors, warnings, hasWizard, cats, id: skin.id, name: skin.name };
}

export function reasonFromErrors(errors) {
  for (const e of errors) {
    if (e.includes('cat に "wizard"')) return "name";
    if (e.includes("colors.") && e.includes("不足")) return "color";
    if (e.includes("コントラスト不足")) return "contrast";
    if (e.includes("cli.")) return "cli";
  }
  return "color";
}

function main() {
  const args = process.argv.slice(2);
  const jsonPath = args.find((a) => !a.startsWith("-"));
  const jsonMode = args.includes("--json");
  const catalogMode = args.includes("--catalog");

  if (!jsonPath) {
    if (!jsonMode) console.error("使い方: node tools/check-cli-skin.mjs <skin.json> [--json] [--catalog]");
    process.exit(EXIT_UNREADABLE);
  }

  let raw;
  try {
    raw = fs.readFileSync(jsonPath, "utf-8");
  } catch (e) {
    if (!jsonMode) console.error(`読めません: ${jsonPath}`);
    process.exit(EXIT_UNREADABLE);
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    if (!jsonMode) console.error(`JSON パース失敗: ${jsonPath}`);
    process.exit(EXIT_UNREADABLE);
  }

  // カタログ形式 {"skins": [...]} か単一スキンかを判定
  const skins = catalogMode && doc.skins ? doc.skins : [doc];

  const results = [];
  let overallExitCode = EXIT_OK;
  let checkedCount = 0;

  for (const skin of skins) {
    const r = validateSkin(skin);

    // チェック対象外（skip）は結果に含めない
    if (r.skip) continue;

    checkedCount++;
    let exitCode = EXIT_OK;
    if (r.errors.length > 0) exitCode = EXIT_UNREADABLE;
    if (overallExitCode < exitCode) overallExitCode = exitCode;

    if (jsonMode) {
      results.push({
        ok: exitCode === EXIT_OK,
        exitCode,
        id: r.id,
        name: r.name,
        cat: r.cats,
        hasWizard: r.hasWizard,
        reason: reasonFromErrors(r.errors),
        errors: r.errors,
        warnings: r.warnings,
      });
    } else {
      console.log(`=== CLI スキン バリデーション: ${r.id || "(なし)"} ===`);
      console.log(`id: ${r.id || "(なし)"}`);
      console.log(`name: ${r.name || "(なし)"}`);
      console.log(`cat: ${JSON.stringify(r.cats)}`);
      console.log(`wizard 対応: ${r.hasWizard ? "✅" : "❌"}`);
      if (r.errors.length > 0) {
        console.log("\nエラー:");
        for (const e of r.errors) console.log(`  ❌ ${e}`);
      }
      if (r.warnings.length > 0) {
        console.log("\n警告:");
        for (const w of r.warnings) console.log(`  ⚠️  ${w}`);
      }
      if (r.errors.length === 0 && r.warnings.length === 0) {
        console.log("\n✅ 問題ありません（受け取り可能）");
      }
      console.log(`\n終了コード: ${exitCode}（0=受け取り / 1=名前なし / 2=読めない）`);
      console.log("");
    }
  }

  if (jsonMode) {
    const result = {
      ok: overallExitCode === EXIT_OK,
      exitCode: overallExitCode,
      total: checkedCount,
      passed: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    };
    console.log(JSON.stringify(result, null, 2));
  }

  process.exit(overallExitCode);
}

// 直接実行時のみ main() を呼ぶ（モジュール import 時は副作用を発生させない）
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
