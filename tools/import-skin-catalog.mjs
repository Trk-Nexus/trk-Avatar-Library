#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: catalog/skins.json から js/skins-wizard.js を生成（v2）
//
// 使い方:
//   node tools/import-skin-catalog.mjs --cat=wizard [--check]
//
// 出力: js/skins-wizard.js（手編集禁止）
//   catalog/skins.json 内の指定カテゴリに属するスキンを抽出し、
//   ES モジュール形式でエクスポートする。
//
// 注意:
//   --cli-only は使用しない（該当カテゴリを全件入力）。
//   生成物は js/skins-wizard.js のみ。index.html で
//   js/characters/miku.js の直後に読み込むこと。

import fs from "fs";

const args = process.argv.slice(2);
const catArg = args.find((a) => a.startsWith("--cat="));
const cat = catArg ? catArg.slice("--cat=".length) : null;

if (!cat) {
  console.error("使い方: node tools/import-skin-catalog.mjs --cat=<カテゴリ名>");
  process.exit(1);
}

const inputPath = "catalog/skins.json";
const outputPath = "js/skins-wizard.js";

let doc;
try {
  doc = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
} catch (e) {
  console.error(`読めません: ${inputPath}`);
  process.exit(1);
}

const skins = doc.skins.filter((s) => Array.isArray(s.cat) && s.cat.includes(cat));

if (skins.length === 0) {
  console.error(`カテゴリ "${cat}" に属するスキンは見つかりませんでした`);
  process.exit(1);
}

// 必須項目の検証（colors の 5 色必須など）
const requiredColors = ["bg", "panel", "text", "accent", "gold"];
const invalid = [];
for (const s of skins) {
  const missing = requiredColors.filter((c) => !s.colors?.[c]);
  if (missing.length > 0) {
    invalid.push(`${s.id}: colors.${missing.join(", ")}`);
  }
}
if (invalid.length > 0) {
  console.error("必須項目が不足しています:");
  for (const v of invalid) console.error(`  ${v}`);
  process.exit(1);
}

// スキンを id 順にソート
skins.sort((a, b) => a.id.localeCompare(b.id));

// js/skins-wizard.js を生成
const lines = [];
lines.push("// SPDX-License-Identifier: GPL-3.0-or-later");
lines.push("// 自動生成: tools/import-skin-catalog.mjs --cat=" + cat);
lines.push("// 入力: catalog/skins.json（手編集禁止）");
lines.push("// スキン数: " + skins.length);
lines.push("");
lines.push("const SKINS_WIZARD = [");

for (let i = 0; i < skins.length; i++) {
  const s = skins[i];
  const comma = i < skins.length - 1 ? "," : "";
  lines.push("  {");
  lines.push(`    id: ${JSON.stringify(s.id)},`);
  lines.push(`    label: ${JSON.stringify(s.label)},`);
  lines.push(`    desc: ${JSON.stringify(s.desc)},`);
  lines.push(`    cat: ${JSON.stringify(s.cat)},`);
  if (s.font) lines.push(`    font: ${JSON.stringify(s.font)},`);
  if (s.type) lines.push(`    type: ${JSON.stringify(s.type)},`);
  lines.push(`    colors: ${JSON.stringify(s.colors)},`);
  if (s.shapes) lines.push(`    shapes: ${JSON.stringify(s.shapes)},`);
  if (s.locked !== undefined) lines.push(`    locked: ${s.locked},`);
  if (s.video) lines.push(`    video: ${JSON.stringify(s.video)},`);
  if (s.cli) lines.push(`    cli: ${JSON.stringify(s.cli)},`);
  lines.push(`  }${comma}`);
}

lines.push("];");
lines.push("");
lines.push("export { SKINS_WIZARD };");
lines.push("");

const output = lines.join("\n");
if (args.includes("--check")) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== output) {
    console.error(`不一致: ${outputPath}`);
    process.exit(1);
  }
  console.log(`✅ ${outputPath} は目録と一致（${skins.length} 種）`);
  process.exit(0);
}
fs.mkdirSync("js", { recursive: true });
fs.writeFileSync(outputPath, output, "utf-8");

console.log(`生成完了: ${outputPath}`);
console.log(`カテゴリ: ${cat}`);
console.log(`スキン数: ${skins.length}`);
for (const s of skins) {
  console.log(`  ${s.id}`);
}
