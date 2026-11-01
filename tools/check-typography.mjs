#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🎨 書体の組み合わせ（catalog/typography.json）を見る（2026-11-01）

   なぜ要るか：
     「有名な書体を組み合わせたい」という相談を受けて、**組み合わせをデータにしました**。
     ただ、組み合わせは「雰囲気の話」に見えて、実際には
      ・目録に無い family／太さを書いてしまう（アプリ側で FontFace が見つからない）
      ・1 つの組で書体を 4 つ以上使い、画面がちらかる
      ・1 語しか出さない題字に長い文を入れて、はみ出す
     といった**数えられる失敗**をします。ここはその数えられる分だけを見ます。
     見た目（太さ・字間の心地よさ）は gallery/pairings.html で目で見て決めてください。

   見ること：
     ・slots（役）・scales（倍率）・presets（細分化の段階）の形
     ・どの組み合わせも 6 役そろっていて、書体が目録（catalog/index.json）に**実在**するか
     ・family＋太さが目録の fonts[] と一致するか（打ち間違いはここで止まる）
     ・ライセンスが配布できるもの（OFL-1.1 / Apache-2.0）で、licenseFile があるか
     ・1 組で使う家族は 3 つまで（4 つ以上は「ちらかる」ので警告）
     ・見本の文が役に収まる長さか（題字 12 字まで、など）
     ・見本用の woff2（catalog/preview/）があるか（無ければ作り方を出す・警告だけ）
     ・**見本の文の字が、その書体に入っているか**（入っていないと □ になる。ここはエラー）

   使い方：
     node tools/check-typography.mjs
     node tools/check-typography.mjs --json
     node tools/check-typography.mjs --strict   … 警告も失敗にする（CI 用）
*/
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const strict = argv.includes("--strict");

const TYPO = path.join(HERE, "catalog/typography.json");
const INDEX = path.join(HERE, "catalog/index.json");
const PREVIEW = path.join(HERE, "catalog/preview");

const errors = [];
const warnings = [];
const E = m => errors.push(m);
const W = m => warnings.push(m);

function readJson(p, label) {
  if (!fs.existsSync(p)) { E(`${label} がありません（${path.relative(HERE, p)}）`); return null; }
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { E(`${label} が JSON として読めません（${e.message}）`); return null; }
}

const typo = readJson(TYPO, "catalog/typography.json");
const index = readJson(INDEX, "catalog/index.json");
if (!typo || !index) {
  for (const m of errors) console.error(`❌ ${m}`);
  process.exit(1);
}

/* 目録から「パック｜family｜太さ」の索引を作る（実在確認はここだけを見る） */
const fontIndex = new Map();
for (const p of index.packs || []) {
  for (const f of p.fonts || []) {
    fontIndex.set(`${p.file}|${f.family}|${f.weight ?? 400}`, { pack: p.file, ...f });
  }
}
const packsInIndex = new Set((index.packs || []).map(p => p.file));

/* 1. 全体の形 */
if (typo.version !== 1) E(`typography.json の version は 1 にしてください（${typo.version}）`);
const SLOT_IDS = ["display", "heading", "body", "caption", "numeral", "accent"];
const slotIds = (typo.slots || []).map(s => s.id);
if (slotIds.length !== SLOT_IDS.length || SLOT_IDS.some(id => !slotIds.includes(id))) {
  E(`slots は ${SLOT_IDS.join(" / ")} の 6 つにしてください（いまは ${slotIds.join(" / ") || "なし"}）`);
}
for (const s of typo.slots || []) {
  for (const k of ["id", "label", "where", "purpose"]) {
    if (!s[k]) E(`slots「${s.id || "?"}」に ${k} がありません`);
  }
}
const scaleIds = new Set((typo.scales || []).map(s => s.id));
const badRatio = (typo.scales || []).filter(s => !(typeof s.ratio === "number" && s.ratio > 1 && s.ratio <= 2));
if (badRatio.length) E(`scales の ratio は 1 より大きく 2 以下にしてください（${badRatio.map(s => s.id).join(", ")}）`);
const presetIds = new Set((typo.presets || []).map(p => p.id));
if (!presetIds.has("one")) E("presets に「one」（いまのアプリ＝書体 1 つ）がありません（比較の基準になります）");

/* 2. 組み合わせ */
const ids = new Set();
const usedFonts = new Set();
const pairings = typo.pairings || [];
if (!pairings.length) E("pairings が 1 つもありません");
for (const p of pairings) {
  const at = `組み合わせ「${p.id || "?"}」`;
  if (!/^[a-z0-9-]+$/.test(String(p.id))) E(`${at}: id は英小文字・数字・- にしてください`);
  if (ids.has(p.id)) E(`${at}: id が重複しています`);
  ids.add(p.id);
  if (!p.name || [...String(p.name)].length > 20) E(`${at}: name は 1〜20 文字にしてください（${[...String(p.name || "")].length} 文字）`);
  if (!p.why || [...String(p.why)].length > 80) E(`${at}: why は 1〜80 文字にしてください（何が合うのか・なぜか）`);
  if (!p.useFor || [...String(p.useFor)].length > 40) E(`${at}: useFor は 1〜40 文字にしてください（どこで使うか）`);
  /* trk! では：どんな曲・どのスキンに合うか（2026-11-02・レビュー B-3）。
     役の定義はゲーム向けなので、「アプリで何に使うか」を 1 行だけ持たせます。 */
  if (!p.trkUse || [...String(p.trkUse)].length > 34) E(`${at}: trkUse は 1〜34 文字にしてください（trk! では、どんな曲・どのスキンに合うか）`);
  if (!Array.isArray(p.tags) || p.tags.length > 3) E(`${at}: tags は 3 つまでにしてください`);
  for (const t of p.tags || []) if ([...String(t)].length > 8) E(`${at}: tags の「${t}」が 8 文字を超えています`);
  /* 組は段階を持たない（`preset` は利用者の設定。書いてあったら「使わない項目」なので知らせる） */
  if (p.preset !== undefined) W(`${at}: 「preset」は組には書きません（段階は利用者の設定です）`);
  if (!scaleIds.has(String(p.scale))) E(`${at}: scale「${p.scale}」が scales にありません`);

  /* 6 役そろっているか・書体が実在するか */
  const fams = new Set();
  const derived = new Set();
  for (const id of SLOT_IDS) {
    const s = (p.slots || {})[id];
    if (!s) { E(`${at}: 役「${id}」がありません`); continue; }
    if (!s.pack || !s.family || !Number.isInteger(s.weight)) {
      E(`${at} の「${id}」: pack・family・weight（整数）を書いてください`); continue;
    }
    const key = `${s.pack}|${s.family}|${s.weight}`;
    const hit = fontIndex.get(key);
    if (!hit) {
      const near = fontIndex.has(`${s.pack}|${s.family}`) || [...fontIndex.keys()].some(k => k.startsWith(`${s.pack}|${s.family}|`));
      E(`${at} の「${id}」: 目録に ${s.family} ${s.weight} がありません${near ? "（太さだけ違う？）" : ""}（${s.pack}）`);
      continue;
    }
    if (!["OFL-1.1", "Apache-2.0"].includes(String(hit.license))) {
      E(`${at} の「${id}」: ${hit.family} のライセンス（${hit.license}）は配布の対象外です`);
    }
    if (!hit.licenseFile) E(`${at} の「${id}」: ${hit.family} に licenseFile がありません（全文の同梱が条件）`);
    fams.add(s.family);
    derived.add(s.pack);
    usedFonts.add(`${s.family}|${s.weight}`);
  }
  /* 「ちらかる」の数え方は、**本文まわりだけ**（題字・見出し・本文・注記）。
     差し色（accent）は 1 語だけ・数字（numeral）は数字だけなので、別家族でも数えません。 */
  const mainFams = new Set(["display", "heading", "body", "caption"].map(id => (p.slots || {})[id]?.family).filter(Boolean));
  if (mainFams.size > 3) {
    W(`${at}: 本文まわりで ${mainFams.size} 家族つかっています（${[...mainFams].join("・")}）。3 つまでにすると、ちらかりません`);
  }
  const declared = [...(p.packs || [])].sort().join(",");
  if (declared !== [...derived].sort().join(",")) {
    E(`${at}: packs[] が slots と合いません（書くなら ${[...derived].join(", ") || "なし"}）`);
  }

  /* 字間・行間 */
  for (const [k, v] of Object.entries(p.tracking || {})) {
    if (!SLOT_IDS.includes(k)) E(`${at}: tracking の「${k}」は役の名前ではありません`);
    if (!(typeof v === "number" && v >= -0.05 && v <= 0.2)) E(`${at}: tracking.${k} は -0.05〜0.2（em）にしてください（${v}）`);
  }
  for (const [k, v] of Object.entries(p.leading || {})) {
    if (!SLOT_IDS.includes(k)) E(`${at}: leading の「${k}」は役の名前ではありません`);
    if (!(typeof v === "number" && v >= 0.9 && v <= 2.4)) E(`${at}: leading.${k} は 0.9〜2.4 にしてください（${v}）`);
  }

  /* 見本の文の長さ（役に収まるか） */
  const LIMIT = { display: 14, heading: 24, body: 70, caption: 34, numeral: 14, accent: 14 };
  for (const id of SLOT_IDS) {
    const t = (p.sample || {})[id];
    if (typeof t !== "string" || !t.length) { E(`${at}: sample.${id} がありません`); continue; }
    const n = [...t].length;
    if (n > LIMIT[id]) W(`${at}: sample.${id} が ${n} 文字です（${LIMIT[id]} 文字までにすると、はみ出しません）`);
  }
}

const tofuCache = new Map();
/* 2.5 見本の字が、見本用の woff2 に**全部入っているか**（入っていないと、ページと縮刷版に □ が出ます）
   見るのは、見本を本物の書体で出す 4 役（display／heading／body／caption）だけ。 */
import { readWoff2, cmapOf } from "./check-fonts.mjs";
const LIMITS = typo.sampleLimits || { display: 14, heading: 20, body: 30, caption: 14 };
for (const p of pairings) {
  for (const id of Object.keys(LIMITS)) {
    const s = (p.slots || {})[id];
    const text = (p.sample || {})[id];
    if (!s || !text) continue;
    if ([...text].length > LIMITS[id]) {
      E(`${p.id} の「${id}」の見本が ${[...text].length} 文字です（${LIMITS[id]} 文字まで。見本用 woff2 に入らない字は □ になります）`);
      continue;
    }
    const file = path.join(PREVIEW, `${s.family}-${s.weight}.woff2`);
    if (!fs.existsSync(file)) continue;                    /* 無いときは下の警告で言う */
    const key = `${s.family}-${s.weight}`;
    if (!tofuCache.has(key)) {
      try {
        const buf = fs.readFileSync(file);
        const codes = cmapOf(buf, readWoff2(buf));
        tofuCache.set(key, codes || new Set());
      } catch (e) {
        tofuCache.set(key, null);
      }
    }
    const codes = tofuCache.get(key);
    if (!codes) { W(`見本用の ${key} の cmap を読めませんでした（字の有無は未確認）`); continue; }
    const lost = [...new Set([...text])].filter(ch => ch.trim() && !codes.has(ch.codePointAt(0)));
    if (lost.length) E(`${p.id} の「${id}」の見本に、${s.family} ${s.weight} が持っていない字があります（${lost.join(" ")}）→ 見本の文を直すか、別の書体にしてください`);
  }
}

/* 3. 見本用の woff2（無ければ警告。--strict では失敗）
   埋め込むのは**題字・見出し・本文・注記**の 4 役だけ（ページを軽くするため）。
   差し色と数字は、同じ家族があればそれを使い、無ければ端末の書体で出します（ページに「見本外」と出ます）。 */
const SPECIMEN_SLOTS = ["display", "heading", "body", "caption"];
const specimenFonts = new Set();
for (const p of pairings) {
  for (const id of SPECIMEN_SLOTS) {
    const s = (p.slots || {})[id];
    if (s && s.family) specimenFonts.add(`${s.family}|${s.weight}`);
  }
}
const missingPreview = [];
for (const f of specimenFonts) {
  const [family, weight] = f.split("|");
  if (!fs.existsSync(path.join(PREVIEW, `${family}-${weight}.woff2`))) missingPreview.push(`${family}-${weight}`);
}
if (missingPreview.length) {
  W(`見本用の woff2 が ${missingPreview.length} 本ありません（gallery/pairings.html を作る前に、python3 tools/build-preview-fonts.py）`);
}

/* 4. 報告 */
/* 目録と突き合わせやすいように、家族名の一覧も出す（trk-PWA の返事13 §4 のお願い）。
   キーは**足すだけ**（消す・意味を変えるときは、先に書面で知らせます）。 */
const familySet = new Set([...usedFonts].map(k => k.split("|")[0]));
/* 相手側（trk-PWA）は 14 組の写しを持っています。写しが古くないかを**この 1 本で照合できる**ように、
   typography.json の sha256 を出します（2026-11-02・レビュー C-3。キーは足すだけ）。 */
const typoSha256 = crypto.createHash("sha256").update(fs.readFileSync(TYPO)).digest("hex");
const summary = {
  tool: "check-typography", version: 1,
  sha256: typoSha256,
  pairings: pairings.length,
  slots: slotIds.length,
  scales: scaleIds.size,
  presets: [...presetIds],
  families: [...familySet].sort(),
  familyCount: familySet.size,
  fonts: usedFonts.size,

  packs: new Set(pairings.flatMap(p => p.packs || [])).size,
  missingPreview,
  warnings, errors,
  ok: errors.length === 0 && (!strict || warnings.length === 0),
};
if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  for (const m of errors) console.error(`❌ ${m}`);
  for (const m of warnings) console.error(`⚠️  ${m}`);
  if (errors.length) {
    console.error(`\n❌ 書体の組み合わせに問題があります（エラー ${errors.length} 件・警告 ${warnings.length} 件）`);
  } else {
    console.log(`✅ ${pairings.length} 組・${usedFonts.size} 書体・${summary.packs} パック。役 ${slotIds.length} つ、倍率 ${scaleIds.size} 種、細分化 ${presetIds.size} 段（警告 ${warnings.length} 件）`);
    if (!warnings.length) console.log("   見た目は gallery/pairings.html で（実物の見本を埋め込んでいます）");
  }
}
process.exit(summary.ok ? 0 : 1);
