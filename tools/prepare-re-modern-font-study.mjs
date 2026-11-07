#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Prepare an isolated research specimen from the exact existing font pack.
// No network fetch; the output is ignored by Git and is not a release pack.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openZip} from './lib/zip.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const trk=(args.find(x=>x.startsWith('--trk='))||'').slice(6)||undefined;
const out=path.resolve((args.find(x=>x.startsWith('--out='))||'').slice(6)||path.join(root,'dist/re-modern-font-study'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pack=fs.readFileSync(path.join(root,'font-packs/dotgothic.stpack'));
assert.equal(sha(pack),'fb06c427232cdba238ff7806d79a410b9630e582e74ee5ce8473a78cc7cc6860','existing pack changed; inspect before making a research copy');
const zip=await openZip(pack,trk);
const font=Buffer.from(await zip.read('fonts/DotGothic16-Regular.woff2'));
const ofl=Buffer.from(await zip.read('fonts/OFL.txt'));
assert.equal(sha(font),'a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee');
assert.equal(sha(ofl),'335d6a81ce1afcf64c8bc36334458ba3292ca6fba5d3974895b3ed84ccee530e');
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'docs/re-modern-research/pixel-console-font-study/index.html'),path.join(out,'index.html'));
fs.writeFileSync(path.join(out,'assets/DotGothic16-Regular.woff2'),font);
fs.writeFileSync(path.join(out,'assets/OFL.txt'),ofl);
fs.writeFileSync(path.join(out,'FONT-SOURCE.txt'),`研究用見本（正式配布物ではありません）\nDotGothic16 Regular 400 — SIL Open Font License 1.1\n作者資料: https://github.com/fontworks-fonts/DotGothic16/tree/14517183ab2f75e8bccafc5a0bff6685d268c687\n取得元: @fontsource/dotgothic16@5.3.1 package/files/dotgothic16-japanese-400-normal.woff2\nWOFF2: 396312 bytes; SHA-256 ${sha(font)}\nOFL: SHA-256 ${sha(ofl)}; assets/OFL.txt に全文と著作権表示\n参照する作者資料の commit は WOFF2 の生成元の証明ではありません。\nこの見本は既存のスキン・ノーツ付きパックから書体だけを取り出した一時研究用です。\n表示・字種・権利・実機・利用者設定・PWAへの供給と解除は別途検証が必要です。\n`);
console.log(`研究用見本を準備しました: ${out}\nローカルで開くためのファイルのみ。PWA設定や正式配布物は変更していません。`);
