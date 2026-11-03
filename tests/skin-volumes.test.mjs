// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = p => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const catalog = readJson('catalog/skins.json');
const byId = new Map(catalog.skins.map(s => [s.id, s]));
const groups = readJson('skin-volumes/volumes.json').groups;
execFileSync(process.execPath, ['tools/export-skin-volumes.mjs', '--check'], {cwd:root, stdio:'inherit'});
const seen = new Set();
for (const group of groups) {
  const data = readJson(`skin-volumes/${group.id}/skins.json`);
  assert.equal(data.format, 'trk-avatar-library-skins');
  assert.equal(data.count, data.skins.length);
  if (group.ids) assert.deepEqual(data.skins.map(s => s.id), group.ids);
  for (const skin of data.skins) {
    assert.ok(byId.has(skin.id));
    assert.ok(!seen.has(skin.id), `duplicate: ${skin.id}`);
    seen.add(skin.id);
    assert.deepEqual(skin, byId.get(skin.id));
    assert.deepEqual(readJson(`skin-volumes/${group.id}/items/${skin.id}.json`), skin);
  }
}
assert.equal(seen.size, catalog.skins.length);
assert.deepEqual(readJson('skin-volumes/wizard/skins.json').skins.map(s => s.id), catalog.skins.filter(s => s.cat?.includes('wizard')).map(s => s.id));
execFileSync(process.execPath, ['tools/prepare-pages.mjs'], {cwd:root, stdio:'inherit'});
for (const file of ['index.html','sw.js','manifest.json','skin-volumes/index.html','skin-volumes/wizard/skins.json','catalog/skins.json', ...groups.filter(g=>g.preview).map(g=>g.preview)]) {
  assert.ok(existsSync(path.join(root, 'dist/pages', file)), `Pages にない: ${file}`);
}
assert.ok(!existsSync(path.join(root, 'dist/pages/docs')));
assert.ok(!existsSync(path.join(root, 'dist/pages/font-packs')));
assert.deepEqual(readJson('dist/pages/skin-volumes/wizard/skins.json'), readJson('skin-volumes/wizard/skins.json'));
console.log('✅ 巻の分類・元データ・Pages 公開対象');
