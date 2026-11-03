#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Build only the intended public site, not the repository's notes or font packs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'dist/pages');
execFileSync(process.execPath, [path.join(root, 'tools/export-skin-volumes.mjs'), '--check'], {stdio:'inherit'});
fs.rmSync(dest, {recursive:true, force:true});
fs.mkdirSync(dest, {recursive:true});
const copies = ['index.html', 'manifest.json', 'sw.js', 'icon-192.png', 'icon-512.png', 'css', 'js', 'skin-volumes', 'catalog/skins.json'];
const groups = JSON.parse(fs.readFileSync(path.join(root, 'skin-volumes/volumes.json'), 'utf8')).groups;
copies.push(...groups.filter(g => g.preview).map(g => g.preview));
for (const file of copies) {
  const target = path.join(dest, file);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.cpSync(path.join(root, file), target, {recursive:true});
}
console.log('✅ Pages 公開用の静的ファイルを dist/pages に用意しました（公開はしていません）');
