// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: リポジトリ全体のスキンチェック（61 種対象）
// catalog/skins.json の全スキンを check-cli-skin.mjs のロジックでチェックし、
// 結果をサマリー形式で出力する。

import { validateSkin, reasonFromErrors } from "./check-cli-skin.mjs";
import fs from "fs";

const EXIT_OK = 0;
const EXIT_UNREADABLE = 1;

const inputPath = "catalog/skins.json";

let doc;
try {
  doc = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
} catch (e) {
  console.error(`読めません: ${inputPath}`);
  process.exit(EXIT_UNREADABLE);
}

const skins = doc.skins;
const results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

for (const skin of skins) {
  const r = validateSkin(skin);
  if (r.skip) {
    skipped++;
    continue;
  }
  const ok = r.errors.length === 0;
  if (ok) passed++;
  else failed++;
  results.push({ id: r.id, ok, errors: r.errors, reason: reasonFromErrors(r.errors) });
}

console.log(`=== trk269 スキンリポジトリチェック ===`);
console.log(`総スキン数: ${skins.length}`);
console.log(`チェック対象: ${passed + failed}`);
console.log(`スキップ（チェック対象外）: ${skipped}`);
console.log(`合格: ${passed}`);
console.log(`不合格: ${failed}`);

if (failed > 0) {
  console.log("\n不合格スキン:");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  ❌ ${r.id} (reason: ${r.reason})`);
    for (const e of r.errors) console.log(`     ${e}`);
  }
  process.exit(EXIT_UNREADABLE);
}

console.log("\n✅ すべてのチェック対象スキンが合格しました");
process.exit(EXIT_OK);
