// SPDX-License-Identifier: GPL-3.0-or-later
// Characterize PWA main 1fd6a89. This is not a security audit or a test of trk316.
// TRK_PWA_REVIEW=/path/to/pwa-1fd6a89 node --test tests/re-modern-pwa-import-boundaries.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const dir = process.env.TRK_PWA_REVIEW;
const pins = {
  'remodern-work.js': 'a5b0e07b531f91ab812db81686d52a3d41b6512fafcdefb17761a2ac66352bd5',
  'remodern-ui.js': 'c910b1e4448e19bea8e14d7a6d95bdcfce734cadf89389b1a94e3cd3117f04c0',
  'custom.js': '90e9233be44abfca7a9ae7cefd1edaeb8fa7f7728c8bad0bc5b8b4eacae9fabb',
  'zip-io.js': '5e5b274f8656d469fcc25e95f83a7379fa2c3f36a28e79bcbc83b20d34f2fcbf',
};
const src = {};
if (dir) for (const [file, sha] of Object.entries(pins)) {
  const bytes = fs.readFileSync(path.join(dir, 'js', file));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), sha, `wrong PWA ${file}`);
  src[file] = bytes.toString('utf8');
}
const check = (name, fn) => test(name, {skip: dir ? false : 'set TRK_PWA_REVIEW to PWA 1fd6a89'}, fn);
function workApi() { const ctx = {}; vm.runInNewContext(src['remodern-work.js'], ctx); return ctx.TrkReModernWork; }
check('work limits and flat ordinary font path rejection', () => {
  const w = workApi();
  assert.equal(w.MAX_ZIP_BYTES, 256 * 1024); assert.equal(w.MAX_JSON_BYTES, 32 * 1024); assert.equal(w.MAX_WORKS, 20);
  assert.equal(w.checkEntryNames(['pack.json', 'LICENSE.txt', 'README.md']).ok, true);
  assert.equal(w.checkEntryNames(['pack.json', 'fonts/example.woff2']).reason, 'nested-file');
  assert.equal(w.checkEntryNames(['pack.json', 'example.woff2']).reason, 'extra-file');
});
check('extra name allowlist is prefix based, not content or extension checking', () => {
  const w = workApi();
  // Only the filename check is exercised; this does not imply the PWA loads or executes these entries.
  assert.equal(w.checkEntryNames(['pack.json', 'README.js', 'LICENSE.woff2']).ok, true);
});
check('fixed source has separate work and normal pack paths and separate caps', () => {
  assert.match(src['remodern-ui.js'], /file\.size > WORK\.MAX_ZIP_BYTES/);
  assert.match(src['remodern-ui.js'], /zipEntryBlob\(zip, entry, WORK\.MAX_JSON_BYTES, true\)/);
  assert.match(src['custom.js'], /if \(raw && typeof raw === "object" && raw\.remodern\) throw new PackError\("packIsRemodernWork"\)/);
  assert.match(src['custom.js'], /PACK_MAX = 500 \* PACK_MB, PACK_STORE_MAX = 1024 \* PACK_MB/);
  assert.match(src['custom.js'], /core\.storageLimitsIgnored\(\) \? Infinity : max/);
  assert.match(src['custom.js'], /font:16, license:0\.25/);
  assert.match(src['custom.js'], /packDB\.putIf\(id, record, stats => packProjected\(stats, total\) <= packCap\(PACK_STORE_MAX\)\)/);
});
