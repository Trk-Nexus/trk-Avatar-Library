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
// An optional, explicitly supplied author-provided Korean font is used only in
// this isolated study. No download occurs here; reject mismatched bytes.
const neoArg=args.find(x=>x.startsWith('--neo-dir='));
let neoFont,neoLicense;
if(neoArg){
  const dir=path.resolve(neoArg.slice('--neo-dir='.length));
  neoFont=fs.readFileSync(path.join(dir,'neodgm.woff2'));
  neoLicense=fs.readFileSync(path.join(dir,'LICENSE.txt'));
  assert.equal(sha(neoFont),'0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf','NeoDunggeunmo font differs from fixed author source');
  assert.equal(sha(neoLicense),'4d3155f4caba9970c8b386064b398822c29d9181cfba07964ba7b07ccc6cca91','NeoDunggeunmo license differs from fixed author source');
}
let html=fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-font-study/index.html'),'utf8');
if(neoFont){
  const replaceOne=(before,after)=>{
    assert.equal(html.split(before).length,2,`expected exactly one specimen marker: ${before}`);
    html=html.replace(before,after);
  };
  replaceOne('/* OPTIONAL_KOREAN_FONT_STYLE */','@font-face{font-family:NeoDunggeunmo;src:url("assets/neodgm.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}');
  replaceOne('font-family:PixelResearchDotGothic,system-ui,sans-serif','font-family:PixelResearchDotGothic,NeoDunggeunmo,system-ui,sans-serif');
  replaceOne('DotGothic16（見出しのみ）','DotGothic16 ＋ NeoDunggeunmo（見出しのみ）');
  replaceOne('<!-- OPTIONAL_KOREAN_FONT_DETAILS -->','<p>この隔離見本では、DotGothic16 にない韓国語の文字を、ローカルに用意した NeoDunggeunmo で補う組み合わせを試しています。実機・字形のレビューと正式採用は別です。<a href="assets/NeoDunggeunmo-OFL.txt">NeoDunggeunmo のライセンスと著作権表示</a></p>');
}
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),html);
if(neoFont){
  fs.writeFileSync(path.join(out,'assets/neodgm.woff2'),neoFont);
  fs.writeFileSync(path.join(out,'assets/NeoDunggeunmo-OFL.txt'),neoLicense);
}
fs.writeFileSync(path.join(out,'assets/DotGothic16-Regular.woff2'),font);
fs.writeFileSync(path.join(out,'assets/OFL.txt'),ofl);
fs.writeFileSync(path.join(out,'FONT-SOURCE.txt'),`研究用見本（正式配布物ではありません）\nDotGothic16 Regular 400 — SIL Open Font License 1.1\n作者資料: https://github.com/fontworks-fonts/DotGothic16/tree/14517183ab2f75e8bccafc5a0bff6685d268c687\n取得元: @fontsource/dotgothic16@5.3.1 package/files/dotgothic16-japanese-400-normal.woff2\nWOFF2: 396312 bytes; SHA-256 ${sha(font)}\nOFL: SHA-256 ${sha(ofl)}; assets/OFL.txt に全文と著作権表示\n参照する作者資料の commit は WOFF2 の生成元の証明ではありません。\nこの見本は既存のスキン・ノーツ付きパックから書体だけを取り出した一時研究用です。\n表示・字種・権利・実機・利用者設定・PWAへの供給と解除は別途検証が必要です。\n`);
if(neoFont) fs.appendFileSync(path.join(out,'FONT-SOURCE.txt'),`\nNeoDunggeunmo 1.601 — SIL Open Font License 1.1\n作者による配布: https://github.com/neodgm/neodgm-webfont/tree/e0a715695c457d3f8ccd071f88cd71b376a5a23e\nneodgm/neodgm.woff2: ${neoFont.length} bytes; SHA-256 ${sha(neoFont)}\nLICENSE.txt: SHA-256 ${sha(neoLicense)}; assets/NeoDunggeunmo-OFL.txt に全文と著作権表示\nReserved Font Name: NeoDunggeunmo。見本では書体ファイルを改変しません。\n`);
console.log(`研究用見本を準備しました: ${out}\n韓国語補助書体: ${neoFont?'固定版を使用':'なし'}\nローカルで開くためのファイルのみ。PWA設定や正式配布物は変更していません。`);
