#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Local comparison only. SolidLinker is NOT under the OFL in this fixed source.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const a of args)assert(/^--(?:trk|neo-dir|galmuri-dir|latin-dir|solid-dir|out)=.+$/.test(a),`unknown or empty argument: ${a}`);
for(const k of ['trk','neo-dir','galmuri-dir','latin-dir','solid-dir','out'])assert(args.filter(a=>a.startsWith(`--${k}=`)).length<=1,`duplicate argument: ${k}`);
const val=k=>args.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
const trk=val('trk')||process.env.TRK_PWA,neo=val('neo-dir'),gal=val('galmuri-dir'),latin=val('latin-dir'),solid=val('solid-dir');
assert(trk&&neo&&gal&&latin&&solid,'--trk (or TRK_PWA), --neo-dir, --galmuri-dir, --latin-dir, --solid-dir required');
const out=path.resolve(val('out')||path.join(root,'dist/re-modern-solidlinker-study'));
const ttf=fs.readFileSync(path.join(solid,'x12y16pxSolidLinker.ttf')),source=fs.readFileSync(path.join(solid,'author-index.html'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(ttf.length,25980);assert.equal(sha(ttf),'d84e7e5b244e10f80382af19626092f77d18ab5b4aa92431d243b0142486ba4d','unexpected SolidLinker TTF');
assert.equal(sha(source),'1fe8862f603e95d0e240b8c82aff8c4dd4ccce8bf842f3760e38c5c0a7e8cd62','unexpected author page snapshot');
const author=new TextDecoder('utf-8',{fatal:true}).decode(source);
const match=author.match(/<h2>Original License<\/h2><small>独自ライセンス版フォント利用規約<\/small>([\s\S]*?)<\/section>/);
assert(match,'original-license section not found');
const body=match[1].replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p>/gi,'\n\n').replace(/<[^>]*>/g,'').replace(/&copy;/g,'©').split(/\r?\n/).map(s=>s.trim()).join('\n').replace(/\n{3,}/g,'\n\n').trim();
assert(body.includes('加工・改変・再配布も可能')&&body.includes('© 2018-2025 hicc 患者長ひっく'),'original-license body mismatch');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-solidlinker-study-'));
try{
 const r=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-latin-study.mjs'),`--trk=${trk}`,`--neo-dir=${neo}`,`--galmuri-dir=${gal}`,`--latin-dir=${latin}`,`--out=${temp}`],{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);
 let html=fs.readFileSync(path.join(temp,'index.html'),'utf8');
 const replace=(a,b)=>{assert.equal(html.split(a).length,2,`expected one source marker: ${a}`);html=html.replace(a,()=>b);};
 replace('<title>ピクセル・コンソール — 英字題字の候補比較</title>','<title>ピクセル・コンソール — SolidLinker の輪郭比較</title>');
 replace('<style>','<style>\n@font-face{font-family:StudySolid;src:url("assets/x12y16pxSolidLinker.ttf") format("truetype");font-style:normal;font-weight:400;font-display:swap}');
 replace('#fira:checked ~ .samples .value{font-family:StudyFira,system-ui,sans-serif}','#fira:checked ~ .samples .value{font-family:StudyFira,system-ui,sans-serif}\n#solid:checked ~ .samples .value{font-family:StudySolid,system-ui,sans-serif}\n.value.zero{letter-spacing:0}.value.spaced{letter-spacing:.125em}');
 replace('<h1>英字の表情を比べる</h1>','<h1>つながる輪郭を比べる</h1>');
 replace('固定版 PWA の共通題字と、作品データの英語名で、二つの多言語基準候補と、英字サブ基準候補などを見比べます。','固定版 PWA の共通題字と、作品データの英語名で、SolidLinker と既存の候補を見比べます。');
 replace('Press Start 2P と Fira Code は Fontsource 5.3.0 の Latin subset','SolidLinker は作者提供の未改変 TTF（独自ライセンス）、Press Start 2P と Fira Code は Fontsource 5.3.0 の Latin subset');
 replace('<input type="radio" id="fira" name="font"> <label for="fira">Fira Code（Latin subset）</label>','<input type="radio" id="fira" name="font"> <label for="fira">Fira Code（Latin subset）</label><br>\n<input type="radio" id="solid" name="font"> <label for="solid">SolidLinker（作者の TTF）</label>');
 for(const id of ['brand','label-en','symbols']){
  const pattern=new RegExp(`<p class="value" id="${id}" lang="en">([\\s\\S]*?)</p>`);
  const hits=[...html.matchAll(new RegExp(pattern.source,'g'))];assert.equal(hits.length,1,`expected one sample ${id}`);const text=hits[0][1];
  html=html.replace(pattern,()=>`<p class="meta">字間 0</p><p class="value zero" id="${id}" lang="en">${text}</p><p class="meta">比較用：字間を 0.125em 広げる</p><p class="value spaced" id="${id}-spaced" lang="en">${text}</p>`);
 }
 replace('記号の合字が表示されるかは、書体・ブラウザ・設定に依存します。','SolidLinker の輪郭のつながりは、文字の組合せ・サイズ・字間や描画環境によって異なります。0.125em は構造を比べるための実験値で、作品の指定ではありません。記号の合字が表示されるかは、書体・ブラウザ・設定に依存します。');
 replace('<li><a href="FONT-SOURCE.txt">取得元・ハッシュ・未確認</a></li>','<li><a href="assets/SolidLinker-LICENSE.txt">SolidLinker の作者の独自ライセンス（固定時点）</a></li><li><a href="FONT-SOURCE.txt">取得元・ハッシュ・未確認</a></li>');
 replace('書体ごとに著作権表示とライセンス全文を分けて示します。','書体ごとに著作権表示とライセンス情報を分けて示します。SolidLinker は OFL ではなく、作者ページに記載された独自ライセンスです。');
 fs.mkdirSync(path.join(out,'assets'),{recursive:true});
 for(const name of fs.readdirSync(path.join(temp,'assets')))fs.copyFileSync(path.join(temp,'assets',name),path.join(out,'assets',name));
 fs.writeFileSync(path.join(out,'assets/x12y16pxSolidLinker.ttf'),ttf);
 fs.writeFileSync(path.join(out,'assets/SolidLinker-LICENSE.txt'),'SolidLinker の作者ページからの研究用記録（2026-11-07 に固定版を確認）。\nこれは TTF 内から抽出したものではありません。最新の条件は作者ページを確認してください。\n作者ページ: https://hicchicc.github.io/00ff/\n固定ページ: https://github.com/hicchicc/hicchicc.github.io/blob/f7759490bbd67c37b3e80f81d05c346e08936616/00ff/index.html\n\n--- 以下、独自ライセンス版フォント利用規約 ---\n\n'+body+'\n');
 const sourceInfo=fs.readFileSync(path.join(temp,'FONT-SOURCE.txt'),'utf8');
 fs.writeFileSync(path.join(out,'FONT-SOURCE.txt'),sourceInfo+'\nSolidLinker: 作者 hicc 患者長ひっく、Version 2023-10-29。固定 commit f7759490bbd67c37b3e80f81d05c346e08936616、TTF 25980 B、SHA-256 d84e7e5b244e10f80382af19626092f77d18ab5b4aa92431d243b0142486ba4d。\n独自ライセンス版（OFLではない）。作者ページからの全文記録は assets/SolidLinker-LICENSE.txt。正式採用・再配布可否は別途確認。\n');
 fs.writeFileSync(path.join(out,'index.html'),html);console.log(`SolidLinker の研究見本を作成: ${out}\nPWA設定・正式採用・正式配布ではありません。`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
