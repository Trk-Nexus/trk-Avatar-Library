#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* ✅ 1つの .stpack を、trk! に入れる前に検査する（2026-10-31）

   見ること（アプリのインストーラと同じ条件だけ。アプリより厳しくも緩くもしません）：
     ・ZIP として読める（CRC も見る）
     ・pack.json が1つだけ・format が "shadow-taiko-pack"・name がある
     ・pack.json が指すファイルが、すべて入っている
     ・スキンの色が #rrggbb の形をしている（アプリの sanitizeSkinDef と同じ見方）
     ・書体（fonts）は woff2・family は英数字と空白 40 文字まで・weight は 100〜900・license がある
     ・書体を入れるときは、ライセンス全文（OFL.txt など）がパックに入っている（OFL の条件なので不合格にする）
     ・書体の licenseFile（任意・trk232 で追加）は、パックの中の .txt／.md を指し、実在する
     ・release（目録の packs[].version）と url（https だけ）の形

   使い方：
     node tools/verify-pack.mjs packs/foo.stpack
     node tools/verify-pack.mjs packs/*.stpack --json      … 機械が読む形で出す
     （trk-PWA の場所は --trk=… か 環境変数 TRK_PWA。既定は ../trk-PWA）

   終了コード：0＝合格、1＝不合格、2＝使い方の誤り
*/
import fs from "node:fs";
import path from "node:path";
import { openZip, readJsonEntry } from "./lib/zip.mjs";

const PACK_FORMAT = "shadow-taiko-pack";
const MB = 1048576;
const MAX_ENTRY = 500 * MB;          /* trk! の1パックの上限（js/custom.js の PACK_MAX） */
const IMG = ["png", "webp", "jpg", "jpeg"], SND = ["wav", "mp3", "ogg", "m4a"];
const HEX = /^#[0-9a-f]{6}$/i;
/* 書体の宣言（アプリが次の版で読む形。ここが緩いと、アプリ側で落とされます） */
const FONT_PATH = /^[A-Za-z0-9_\-./]{1,120}$/;      /* js/custom.js の PATH_RE と同じ文字だけ */
const FONT_FAMILY = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,39}$/;  /* 英数字と空白・. _ - の 40 文字まで */
const RELEASE = /^[0-9A-Za-z._+-]{1,24}$/;          /* 目録の packs[].version に入る配布版 */
/* 書体のライセンス全文（任意・fonts[].licenseFile）。アプリは trk233 以降で表示する予定 */
const LICENSE_FILE_EXT = ["txt", "md"], MAX_LICENSE_FILE = 256 * 1024;
/* L10／L15（任意）：書体のひとこと（60 文字）と、雰囲気のタグ（8 個・各 16 文字）。
   これまでは目録の外（catalog/font-notes.json・font-tags.json）で足していましたが、
   パック自身にも書けるようにします（trk238 予定の「起動時にパックから索引を作る」に要る）。
   長さなどは、目録を作るとき（build-catalog）と同じ決めごとで見ます */
const NOTE_MAX = 60, TAG_MAX_COUNT = 8, TAG_MAX_LEN = 16;
const URL_RE = /^https:\/\/[^\s"'<>]+$/;            /* アプリは https だけを受け付ける */
const extOf = p => (p.split(".").pop() || "").toLowerCase();

export async function verifyPack(file, opts = {}) {
  const errors = [], warnings = [], notes = [], info = {};
  const bytes = fs.readFileSync(file);
  info.file = path.basename(file);
  info.bytes = bytes.length;
  if (bytes.length > MAX_ENTRY) errors.push(`大きすぎます（${(bytes.length / MB).toFixed(1)} MB・上限 500 MB）`);
  let zipped;
  try { zipped = await openZip(bytes, opts.trk); }
  catch (e) { return { ok:false, errors:["ZIP として読めません（CRC 不一致・壊れた中央ディレクトリなど）"], warnings, notes, info }; }

  const names = zipped.names();
  info.entries = names.length;
  const manifests = names.filter(n => !n.startsWith("__MACOSX/") && /(^|\/)pack\.json$/.test(n));
  if (manifests.length === 0) return { ok:false, errors:["pack.json がありません"], warnings, notes, info };
  if (manifests.length > 1) errors.push(`pack.json が ${manifests.length} 個あります（いちばん上に1つだけ置いてください）`);
  const mf = manifests.sort((a, b) => a.length - b.length)[0];
  const root = mf.slice(0, mf.length - "pack.json".length);
  /* CRC が合わない・展開できないときは、アプリと同じく「読めないパック」として断る */
  let man = null;
  try { man = await readJsonEntry(zipped, mf); }
  catch (e) { errors.push("pack.json を展開できません（CRC 不一致・壊れたデータ）"); }
  if (!man || typeof man !== "object") return { ok:false, errors:["pack.json が JSON として読めません"], warnings, notes, info };
  if (man.format !== PACK_FORMAT) errors.push(`format が "${PACK_FORMAT}" ではありません（"${man.format}"）`);
  info.name = typeof man.name === "string" ? man.name : "";
  info.author = typeof man.author === "string" ? man.author : "";
  info.license = typeof man.license === "string" ? man.license : "";
  info.description = typeof man.description === "string" ? man.description : "";
  if (!info.name) errors.push("name がありません");
  if (info.name.length > 40) errors.push("name が 40 文字を超えています");
  if (!info.license) warnings.push("license がありません（配るなら書いてください）");
  if (info.description.length > 200) warnings.push("description が 200 文字を超えています（アプリは 200 文字で切ります）");

  /* 目録（catalog/index.json）の packs[].version に入る「配布版」。省略すると 1.0.0
     （L8：アプリは pack.json の release と目録の version を比べて「更新あり」を出す。書いておく） */
  if (man.release === undefined) {
    notes.push("release がありません（目録の version は 1.0.0 になります。L8 のとおり、配るパックは書いておくと「更新あり」が効きます）");
  } else {
    if (typeof man.release !== "string" || !RELEASE.test(man.release)) {
      errors.push(`release は英数字と . _ + - の 24 文字までにしてください（"${man.release}"）`);
    } else info.release = man.release;
  }
  /* 目録の packs[].url に入る。https だけ（アプリはリンクにせず、項目として持つだけ） */
  if (man.url !== undefined) {
    const url = typeof man.url === "string" ? man.url.trim() : "";
    if (!URL_RE.test(url)) warnings.push(`url は https:// で始まる形にしてください（目録には載せません: "${man.url}"）`);
    else info.url = url;
  }

  /* pack.json が指すファイル */
  const wanted = [];
  if (man.skin) {
    info.skin = { name: typeof man.skin.name === "string" ? man.skin.name : "" };
    /* アプリの形：colors は { bg, panel, text, accent, gold, bg2? } の入れ物（js/data.js の sanitizeSkinDef と同じ） */
    const c = man.skin.colors;
    info.skin.colors = (c && typeof c === "object" && !Array.isArray(c)) ? Object.keys(c).length : 0;
    if (!c || typeof c !== "object" || Array.isArray(c)) {
      errors.push("skin.colors が入れ物（{bg, panel, text, accent, gold}）ではありません");
    } else {
      for (const k of ["bg", "panel", "text", "accent", "gold"]) {
        if (!HEX.test(String(c[k]))) errors.push(`skin.colors.${k} が #rrggbb ではありません（"${c[k]}"）`);
      }
      if (c.bg2 !== undefined && c.bg2 !== "" && !HEX.test(String(c.bg2))) errors.push("skin.colors.bg2 が #rrggbb ではありません");
      if (man.skin.font && !["default", "mono", "rounded", "serif"].includes(man.skin.font)) {
        warnings.push(`skin.font "${man.skin.font}" はアプリのプリセット（default/mono/rounded/serif）ではありません`);
      }
      /* 目録の packs[].colors（L3・任意）に出す2色。アプリの trk231 はまだ読まない（trk235 以降で一覧に点を出す予定） */
      if (HEX.test(String(c.bg)) && HEX.test(String(c.accent))) {
        info.colors = { stage: String(c.bg).toLowerCase(), accent: String(c.accent).toLowerCase() };
      }
    }
  }
  for (const k of ["don", "ka"]) {
    const n = man.notes && man.notes[k];
    if (!n) continue;
    if (n.color && !HEX.test(n.color)) errors.push(`notes.${k}.color が #rrggbb ではありません`);
    if (n.image) wanted.push({ p:n.image, ext:IMG, kind:"画像" });
  }
  for (const k of ["don", "ka"]) if (man.sounds && man.sounds[k]) wanted.push({ p:man.sounds[k], ext:SND, kind:"効果音" });
  if (man.mascot && man.mascot.vrm) wanted.push({ p:man.mascot.vrm, ext:["vrm"], kind:"VRM" });
  if (man.mascot && man.mascot.motion) wanted.push({ p:man.mascot.motion, ext:["vrma"], kind:"モーション" });
  for (const s of Array.isArray(man.songs) ? man.songs : []) {
    if (s.audio) wanted.push({ p:s.audio, ext:["mp3","m4a","ogg","oga","opus","wav","flac","aac","mp4","webm"], kind:"曲" });
    if (s.background) wanted.push({ p:s.background, ext:IMG, kind:"背景" });
    for (const p of Object.values(s.charts || {})) wanted.push({ p, ext:["json"], kind:"譜面" });
  }
  info.songs = Array.isArray(man.songs) ? man.songs.length : 0;
  let total = 0;
  for (const w of wanted) {
    if (typeof w.p !== "string" || w.p.includes("..") || w.p.startsWith("/")) { errors.push(`${w.kind}のパスが不正です（"${w.p}"）`); continue; }
    if (!w.ext.includes(extOf(w.p))) errors.push(`${w.kind}「${w.p}」の拡張子が ${w.ext.join("/")} ではありません`);
    const entry = zipped.entry(root + w.p);
    if (!entry) { errors.push(`${w.kind}「${w.p}」が入っていません`); continue; }
    total += entry.usize;
  }
  info.payloadBytes = total;

  /* 🅰 書体（このリポジトリの主役。アプリ側の対応は次の版）
     ここで見る形は、そのままアプリの FontFace 登録（docs/LIBRARY-TRK230 §5）に渡せる形にそろえます。 */
  const fonts = Array.isArray(man.fonts) ? man.fonts : [];
  if (man.fonts !== undefined && !Array.isArray(man.fonts)) errors.push("fonts が配列ではありません");
  if (fonts.length > 20) warnings.push(`fonts が ${fonts.length} 件あります（目録は先頭 20 件だけ載せます）`);
  info.fonts = [];
  const fontKeys = new Set();
  for (const f of fonts) {
    if (!f || typeof f !== "object" || Array.isArray(f)) { errors.push("fonts[] にオブジェクトでない項目があります"); continue; }
    const file = typeof f.file === "string" ? f.file.trim() : "";
    const family = typeof f.family === "string" ? f.family.trim() : "";
    const license = typeof f.license === "string" ? f.license.trim() : "";
    const weight = f.weight;
    const licenseFile = typeof f.licenseFile === "string" ? f.licenseFile.trim() : "";
    if (!file) { errors.push("fonts[] に file がない項目があります"); continue; }
    if (!FONT_PATH.test(file) || file.includes("..") || file.startsWith("/")) {
      errors.push(`書体「${file}」のパスが不正です（英数字と _ - . / の 120 文字まで・.. と先頭 / は不可）`);
      continue;   /* パスが不正なものは、ZIP の中を探しに行かない */
    }
    if (extOf(file) !== "woff2") errors.push(`書体「${file}」は woff2 にしてください（web で配る形を1つに決めます）`);
    const entry = zipped.entry(root + file);
    if (!entry) errors.push(`書体「${file}」が入っていません`);
    if (!family) errors.push(`書体「${file}」に family がありません`);
    else if (!FONT_FAMILY.test(family)) errors.push(`書体「${family}」の family は英数字と空白・. _ - の 40 文字までにしてください`);
    if (!license) errors.push(`書体「${family || file}」に license がありません（OFL なら "OFL-1.1"）`);
    else if (!/OFL|Apache|MIT|CC0|public/i.test(license)) warnings.push(`書体「${family}」の license "${license}" は、配布できるか確認してください`);
    if (weight !== undefined && !(Number.isInteger(weight) && weight >= 100 && weight <= 900)) {
      errors.push(`書体「${family || file}」の weight は 100〜900 の整数にしてください（"${weight}"）`);
    }
    /* L7（trk232 からのお願い）：書体のライセンス全文を指す任意の licenseFile。
       「アプリが全文を表示できる」ための宣言なので、実在と形だけを厳しく見ます */
    let licenseFileInfo = "";
    if (f.licenseFile !== undefined) {
      if (typeof f.licenseFile !== "string" || !licenseFile) {
        errors.push(`書体「${family || file}」の licenseFile は文字列にしてください（"${f.licenseFile}"）`);
      } else if (!FONT_PATH.test(licenseFile) || licenseFile.includes("..") || licenseFile.startsWith("/")) {
        errors.push(`書体「${family || file}」の licenseFile「${licenseFile}」のパスが不正です（英数字と _ - . / の 120 文字まで）`);
      } else if (!LICENSE_FILE_EXT.includes(extOf(licenseFile))) {
        errors.push(`書体「${family || file}」の licenseFile は .txt か .md にしてください（"${licenseFile}"）`);
      } else {
        const entryLicense = zipped.entry(root + licenseFile);
        if (!entryLicense) {
          errors.push(`書体「${family || file}」の licenseFile「${licenseFile}」が入っていません`);
        } else if (entryLicense.usize > MAX_LICENSE_FILE) {
          errors.push(`ライセンス全文「${licenseFile}」が大きすぎます（${(entryLicense.usize / 1024).toFixed(1)} KB・上限 256 KB）`);
        } else if (entryLicense.usize < 100) {
          warnings.push(`ライセンス全文「${licenseFile}」が ${entryLicense.usize} B しかありません（全文か確かめてください）`);
        } else {
          licenseFileInfo = licenseFile;
          total += entryLicense.usize;
        }
      }
    }
    /* L10／L15：パック自身に書かれた「ひとこと」と「タグ」（任意・目録側のファイルと二重に書いたら build-catalog が止める） */
    const note = typeof f.note === "string" ? f.note.trim() : "";
    if (note && [...note].length > NOTE_MAX) warnings.push(`書体「${family || file}」の note が ${[...note].length} 文字あります（${NOTE_MAX} 文字まで・目録は切りません）`);
    const tags = [];
    if (f.tags !== undefined) {
      if (!Array.isArray(f.tags)) warnings.push(`書体「${family || file}」の tags が配列ではありません`);
      else {
        for (const t of f.tags) {
          const tag = typeof t === "string" ? t.trim() : "";
          if (!tag) { warnings.push(`書体「${family || file}」の tags に空の語があります`); continue; }
          if ([...tag].length > TAG_MAX_LEN) { warnings.push(`書体「${family || file}」のタグ「${tag}」が ${[...tag].length} 文字あります（${TAG_MAX_LEN} 文字まで）`); continue; }
          if (!tags.includes(tag)) tags.push(tag);
        }
        if (tags.length > TAG_MAX_COUNT) warnings.push(`書体「${family || file}」の tags が ${tags.length} 個あります（${TAG_MAX_COUNT} 個まで）`);
      }
    }
    const key = `${family.toLowerCase()}|${weight === undefined ? 400 : weight}`;
    if (fontKeys.has(key)) warnings.push(`書体「${family}」の weight ${weight === undefined ? 400 : weight} が重複しています`);
    fontKeys.add(key);
    info.fonts.push({ family, file, license, weight,
      ...(licenseFileInfo ? { licenseFile: licenseFileInfo } : {}),
      ...(note ? { note } : {}),
      ...(tags.length ? { tags: tags.slice(0, TAG_MAX_COUNT) } : {}) });
    if (entry) total += entry.usize;
  }
  info.payloadBytes = total;
  if (fonts.length) {
    const lic = names.filter(n => /(^|\/)(OFL|LICENSE|LICENCE|COPYING)(\.txt)?$/i.test(n));
    /* OFL は「ライセンス全文の同梱」が条件なので、警告ではなく不合格にします */
    if (!lic.length) errors.push("書体のライセンス全文（OFL.txt など）が入っていません（OFL は同梱が条件です）");
    else info.licenseFiles = lic;
  }
  return { ok: errors.length === 0, errors, warnings, notes, info };
}

/* --- コマンドとして動かす --- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const asJson = argv.includes("--json");
  const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice(6) || undefined;
  const files = argv.filter(a => !a.startsWith("--"));
  if (!files.length) {
    console.error("使い方: node tools/verify-pack.mjs <file.stpack> [--json] [--trk=/path/to/trk-PWA]");
    process.exit(2);
  }
  let bad = 0;
  const out = [];
  for (const f of files) {
    const r = await verifyPack(f, { trk });
    out.push({ ...r, file: f });
    if (!r.ok) bad++;
    if (!asJson) {
      console.log(`${r.ok ? "✅" : "❌"} ${path.basename(f)}${r.info.name ? ` — ${r.info.name}` : ""}`);
      if (r.info.skin) console.log(`   スキン: ${r.info.skin.name || "(名前なし)"}／色 ${r.info.skin.colors}／曲 ${r.info.songs}`);
      if (r.info.fonts && r.info.fonts.length) console.log(`   書体: ${r.info.fonts.map(x => x.family).join(", ")}`);
      for (const e of r.errors) console.log(`   ❌ ${e}`);
      for (const w of r.warnings) console.log(`   ⚠ ${w}`);
      for (const n of r.notes || []) console.log(`   ℹ ${n}`);
    }
  }
  if (asJson) console.log(JSON.stringify(out, null, 2));
  process.exit(bad ? 1 : 0);
}
