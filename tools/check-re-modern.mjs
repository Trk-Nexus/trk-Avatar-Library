#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository gate for the reserved trk-re-modern category, not a visual or legal audit.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORY = 'trk-re-modern';
const ID = /^trk-re-modern-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const date = s => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isFinite(d.valueOf()) && d.toISOString().slice(0,10) === s;
};
const text = x => typeof x === 'string' && !!x.trim() && !/^(?:tbd|todo|未定|未記入|仮|n\/a)$/i.test(x.trim());
const https = value => {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !!u.hostname; } catch { return false; }
};
const fileIsNonempty = (rootDir, rel) => {
  try {
    const dir = fs.realpathSync(rootDir), name = fs.realpathSync(path.join(dir,rel));
    return name.startsWith(dir + path.sep) && fs.statSync(name).isFile() && fs.statSync(name).size > 0;
  } catch { return false; }
};

export function evaluate({catalog, volumes, registry, records, hasFile}) {
  const errors = [];
  const fail = message => errors.push(message);
  if (!Array.isArray(catalog?.skins)) return ['目録の skins が配列ではありません'];
  if (!Array.isArray(volumes?.groups)) return ['巻定義の groups が配列ではありません'];
  if (registry?.format !== 'trk-re-modern-registry' || registry.version !== 1 || !Array.isArray(registry.ids)) return ['trk-re-modern 台帳が不正です'];
  const byId = new Map();
  for (const skin of catalog.skins) {
    if (typeof skin?.id !== 'string') { fail('目録に ID のないスキンがあります'); continue; }
    if (byId.has(skin.id)) fail(`目録の ID が重複しています: ${skin.id}`);
    byId.set(skin.id, skin);
    const named = skin.id.startsWith(`${CATEGORY}-`), tagged = Array.isArray(skin.cat) && skin.cat.includes(CATEGORY);
    if (named !== tagged) fail(`${skin.id}: 予約 ID とカテゴリの両方が必要です`);
  }
  const ids = registry.ids;
  if (ids.some(id => typeof id !== 'string' || !ID.test(id))) fail('台帳に不正な ID があります');
  if (new Set(ids).size !== ids.length) fail('台帳に重複 ID があります');
  const marked = catalog.skins.filter(s => typeof s?.id === 'string' && (s.id.startsWith(`${CATEGORY}-`) || s.cat?.includes?.(CATEGORY))).map(s => s.id);
  for (const id of marked) if (!ids.includes(id)) fail(`${id}: 台帳への登録がありません`);
  for (const id of ids) if (!byId.has(id) || !marked.includes(id)) fail(`${id}: 台帳と正本が一致しません`);
  for (const g of volumes.groups) {
    if (g?.id === CATEGORY || g?.category === CATEGORY) {
      for (const id of g.ids || []) if (!ids.includes(id)) fail(`${id}: 新カテゴリの巻に台帳外の ID があります`);
    }
  }
  for (const id of Object.keys(records)) if (!ids.includes(id)) fail(`${id}: 台帳にない作品記録があります`);
  if (ids.length && !hasFile('gallery/re-modern/index.html')) fail('trk-re-modern の公開一覧・検索ページがありません');
  for (const id of ids.filter(id => typeof id === 'string' && ID.test(id))) {
    const r = records[id];
    if (!r || typeof r !== 'object' || Array.isArray(r)) { fail(`${id}: 作品記録がありません`); continue; }
    if (r.id !== id || r.version !== 1) fail(`${id}: 記録の ID または版が一致しません`);
    if (!Array.isArray(r.directions) || !r.directions.length || new Set(r.directions).size !== r.directions.length || r.directions.some(x=>!['aesthetic','functional','experimental'].includes(x))) fail(`${id}: 方向性を指定してください`);
    const required = {
      concept:['intent','tradeoffs','originality'],
      typography:['family','origin','rationale','license','distribution','fallback'],
      design:['palette','transparency','effects'],
      safety:['readability','exit','motion','forcedColors'],
      permissions:['research','runtimeNetwork','assetRights','browserRequirements'],
      compatibility:['pwa','legacy'],
      verification:['chromium','accessibility','contrast','failureCases','unverified'],
      review:['reviewer','decision','evidence']
    };
    for (const [section, fields] of Object.entries(required)) for (const field of fields) {
      if (!text(r[section]?.[field])) fail(`${id}: ${section}.${field} の説明が必要です`);
    }
    if (!['pack','system','browser-default','original'].includes(r.typography?.origin)) fail(`${id}: typography.origin が不正です`);
    if (r.typography?.sourceUrl !== null && !https(r.typography?.sourceUrl)) fail(`${id}: 書体の出典 URL は HTTPS または null が必要です`);
    if (['pack','original'].includes(r.typography?.origin) && !https(r.typography?.sourceUrl)) fail(`${id}: この書体の入手先または制作根拠が必要です`);
    if (r.typography?.sourceUrl === null && !text(r.typography?.sourceReason)) fail(`${id}: 書体の URL がない理由を説明してください`);
    if (!date(r.review?.date) || r.review?.approved !== true) fail(`${id}: レビュー日と明示的な承認が必要です`);
    if (!Array.isArray(r.references) || !r.references.length) fail(`${id}: 参照資料が必要です`);
    else {
      for (const ref of r.references) {
        if (!['guidance','design','font','other'].includes(ref?.kind) || !text(ref.title) || !https(ref.url) || !date(ref.checked) || !text(ref.relevance)) fail(`${id}: 参照資料に種類・題名・HTTPS URL・確認日・参照理由が必要です`);
      }
      if (!r.references.some(ref => ref?.kind === 'guidance' && /^https:\/\/github\.com\/GoogleChrome\/modern-web-guidance-src\/blob\/[a-f0-9]{40}\/guides\//.test(ref.url))) fail(`${id}: commit 固定の Modern Web Guidance が必要です`);
    }
    for (const file of [`docs/re-modern/${id}.md`, `gallery/re-modern/${id}.html`]) if (!hasFile(file)) fail(`${id}: 公開・レビュー用の ${file} がありません`);
  }
  return errors;
}

export function checkRepository(rootDir = root) {
  const read = rel => JSON.parse(fs.readFileSync(path.join(rootDir, rel), 'utf8'));
  const dir = path.join(rootDir,'catalog/re-modern/records');
  const records = {};
  if (fs.existsSync(dir)) for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) throw Error(`不正な作品記録ファイル: ${name}`);
    const id = name.slice(0,-5);
    if (!ID.test(id)) throw Error(`不正な作品記録ファイル: ${name}`);
    records[id] = read(`catalog/re-modern/records/${name}`);
  }
  const errors = evaluate({catalog:read('catalog/skins.json'),volumes:read('skin-volumes/volumes.json'),registry:read('catalog/re-modern/index.json'),records,hasFile:rel=>fileIsNonempty(rootDir,rel)});
  if (!fileIsNonempty(rootDir, 'docs/trk-re-modern-concept.md')) errors.push('trk-re-modern のコンセプト文書がありません');
  if (!fileIsNonempty(rootDir, 'docs/trk-re-modern-introduction-template.md')) errors.push('trk-re-modern の個別作品紹介・カタログ書式がありません');
  return errors;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = checkRepository();
    if (errors.length) { for (const e of errors) console.error(`❌ ${e}`); process.exitCode = 1; }
    else console.log('✅ trk-re-modern 台帳・必須記録（内容の真偽や実機検証は人が確認）');
  } catch (e) { console.error(`❌ trk-re-modern 検査: ${e.message}`); process.exitCode = 1; }
}
