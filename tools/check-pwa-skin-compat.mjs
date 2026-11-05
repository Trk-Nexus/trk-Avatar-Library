#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Run the pinned PWA's importer/checker in a temporary directory. Never modify the PWA checkout.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function evaluate(report, declared, baseline) {
  const errors = [];
  if (!report.ok || report.problems?.length) errors.push('PWA の通常検査に不合格があります');
  const actual = new Map();
  for (const p of report.holdbackProblems || []) {
    if (p.reason !== 'contrast' || !p.label) errors.push(`${p.id}: 色以外の問題 ${p.reason}`);
    const labels = actual.get(p.id) || {};
    (labels[p.label] ||= []).push(p.ratio);
    actual.set(p.id, labels);
  }
  for (const id of declared) if (!baseline[id]) errors.push(`${id}: 新しい差し戻し`);
  for (const [id, labels] of actual) {
    if (!declared.has(id)) errors.push(`${id}: 差し戻し一覧と警告が不一致`);
    for (const [label, ratios] of Object.entries(labels)) {
      const limits = baseline[id]?.[label] || [];
      ratios.sort((a, b) => a - b);
      const orderedLimits = [...limits].sort((a, b) => a - b);
      if (ratios.length > limits.length) errors.push(`${id}: ${label} の不合格が増加 (${ratios.length})`);
      if (ratios.some((ratio, i) => !Number.isFinite(ratio) || ratio < orderedLimits[i])) errors.push(`${id}: ${label} の表示比が悪化`);
    }
  }
  return errors;
}
function main() {
  const trk = path.resolve(process.env.TRK_PWA || '');
  if (!process.env.TRK_PWA || !fs.existsSync(path.join(trk, 'tools/import-skin-catalog.mjs'))) throw Error('TRK_PWA に信頼できる trk-PWA チェックアウトを指定してください');
  const baseline = JSON.parse(fs.readFileSync(path.join(root, 'tests/pwa-holdback-baseline.json')));
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog/skins.json')));
  const groups = JSON.parse(fs.readFileSync(path.join(root, 'skin-volumes/volumes.json'))).groups;
  const wizard = catalog.skins.filter(s => s.cat?.includes('wizard')).map(s => s.id);
  const volumes = groups.filter(g => /^vol-\d+$/.test(g.id) || g.id === 'glitch').flatMap(g => g.ids);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'avatar-pwa-skin-'));
  const run = args => {
    const p = spawnSync(process.execPath, args, { cwd: trk, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    if (p.error || p.status !== 0) throw Error(`${args[0]} failed (${p.status}): ${p.error || p.stderr || p.stdout}`);
    return p.stdout;
  };
  try {
    const files = [path.join(tmp, 'wizard.js'), path.join(tmp, 'volumes.js')];
    const cat = path.join(root, 'catalog/skins.json');
    run(['tools/import-skin-catalog.mjs', cat, '--cat=wizard', `--out=${files[0]}`]);
    run(['tools/import-skin-catalog.mjs', cat, '--cat=', '--exclude-cat=wizard', '--only-new', `--volumes=${path.join(root, 'skin-volumes/volumes.json')}`, '--kind=volumes', `--out=${files[1]}`]);
    const declared = new Set();
    for (const [index, file] of files.entries()) {
      const code = fs.readFileSync(file, 'utf8');
      const ids = [...code.matchAll(/\bS\["([A-Za-z0-9_.-]+)"\]\s*=\s*\{/g)].map(m => m[1]);
      const expected = index ? volumes : wizard;
      if (new Set(ids).size !== ids.length || ids.length !== expected.length || expected.some(id => !ids.includes(id))) throw Error(`${file}: 生成された ID が目録と一致しません`);
      const m = code.match(/\bSKIN_HOLDBACK\s*=\s*(\[[^\]]*\])/);
      if (m) for (const id of JSON.parse(m[1])) {
        if (!ids.includes(id) || declared.has(id)) throw Error(`${id}: 不正な差し戻し ID`);
        declared.add(id);
      }
    }
    const report = JSON.parse(run(['tools/check-skin-contrast.mjs', ...files, '--json']));
    if (report.skins !== wizard.length + volumes.length || report.files.length !== 2 || report.files[1].volumes !== groups.length) throw Error('PWA 検査の件数が一致しません');
    const errors = evaluate(report, declared, baseline.holdback);
    if (errors.length) throw Error(errors.join('\n'));
    const result = {ok: true, pwa: spawnSync('git', ['rev-parse', 'HEAD'], {cwd:trk, encoding:'utf8'}).stdout.trim(), skins:report.skins, volumes:groups.length, holdbackIds:[...declared].sort(), holdbackProblems:report.holdbackProblems};
    if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else console.log(`✅ PWA 生成・色検査 ${result.skins} 種／${groups.length} 巻。既知の差し戻し ${declared.size} 種・${report.holdbackProblems.length} 組は未解決（警告は合格ではありません）\n   ${result.holdbackIds.join(', ')}`);
  } finally { fs.rmSync(tmp, {recursive:true, force:true}); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error(`❌ ${e.message}`); process.exitCode = 1; }
}
