#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Independent research comparison, never fetches assets or modifies PWA.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const a of args)assert(/^--(?:trk|neo-dir|galmuri-dir|out)=.+$/.test(a),`unknown or empty argument: ${a}`);
for(const k of ['trk','neo-dir','galmuri-dir','out'])assert(args.filter(a=>a.startsWith(`--${k}=`)).length<=1,`duplicate argument: ${k}`);
const val=k=>args.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
const trk=val('trk')||process.env.TRK_PWA,neo=val('neo-dir'),gal=val('galmuri-dir');
assert(trk&&neo&&gal,'--trk (or TRK_PWA), --neo-dir and --galmuri-dir required');
const out=path.resolve(val('out')||path.join(root,'dist/re-modern-candidate-comparison'));
const font=fs.readFileSync(path.join(gal,'Galmuri11.woff2'));
const license=fs.readFileSync(path.join(gal,'Galmuri-LICENSE.txt'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(font.length,505400);assert.equal(hash(font),'8bad9322b3340bfb5cb26cb00f4752bf4c8e7d1b526bb07205f4af458eebed31','unexpected Galmuri file');
assert.equal(hash(license),'86a3ee9495f942f0243f18c103da9faca27adb88142613edb8bb852e56c892c1','unexpected Galmuri license');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-candidate-comparison-'));
try{
 const r=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-multilingual-study.mjs'),`--trk=${trk}`,`--neo-dir=${neo}`,`--out=${temp}`],{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);
 let html=fs.readFileSync(path.join(temp,'index.html'),'utf8');
 const replace=(oldValue,newValue)=>{assert.equal(html.split(oldValue).length,2,`expected one source marker: ${oldValue}`);html=html.replace(oldValue,()=>newValue);};
 replace('@font-face{font-family:ResearchNeo;', '@font-face{font-family:ResearchGalmuri;src:url("assets/Galmuri11.woff2") format("woff2");font-style:normal;font-weight:400;font-display:swap}\n@font-face{font-family:ResearchNeo;');
 replace('#font-pair:checked ~ .samples .sample-value{font-family:ResearchDot,ResearchNeo,system-ui,sans-serif}', '#font-pair:checked ~ .samples .sample-value{font-family:ResearchDot,ResearchNeo,system-ui,sans-serif}\n#font-galmuri:checked ~ .samples .sample-value{font-family:ResearchGalmuri,system-ui,sans-serif}');
 replace('<input type="radio" name="font" id="font-pair"> <label class="choice" for="font-pair">二書体の候補（見本文字列のみ）</label>', '<input type="radio" name="font" id="font-pair"> <label class="choice" for="font-pair">DotGothic16 ＋ NeoDunggeunmo</label><br>\n<input type="radio" name="font" id="font-galmuri"> <label class="choice" for="font-galmuri">Galmuri11（参考候補）</label>');
 replace('「二書体の候補」を選ぶと、下の見本文字列だけ DotGothic16、NeoDunggeunmo、端末の system 系の順に使います。', '「DotGothic16 ＋ NeoDunggeunmo」は二書体をその順に、「Galmuri11」は一書体を、下の見本文字列だけに使います。どちらも不足時は端末の system 系に代替されます。');
 replace('二書体は別々の素材です。各ファイルの著作権表示とライセンス全文を確認できます。','三書体は別々の素材です。各ファイルの著作権表示とライセンス全文を確認できます。参考候補は採用・配布を決めたものではありません。');
 replace('<li><a href="FONT-SOURCE.txt">出典・ハッシュ・未確認事項</a></li>', '<li><a href="assets/Galmuri-LICENSE.txt">Galmuri11 の著作権表示とライセンス全文</a></li><li><a href="FONT-SOURCE.txt">出典・ハッシュ・未確認事項</a></li>');
 fs.mkdirSync(path.join(out,'assets'),{recursive:true});
 for(const name of ['DotGothic16-Regular.woff2','neodgm.woff2','OFL.txt','NeoDunggeunmo-OFL.txt'])fs.copyFileSync(path.join(temp,'assets',name),path.join(out,'assets',name));
 fs.writeFileSync(path.join(out,'assets/Galmuri11.woff2'),font);fs.writeFileSync(path.join(out,'assets/Galmuri-LICENSE.txt'),license);
 const source=fs.readFileSync(path.join(temp,'FONT-SOURCE.txt'),'utf8');
 fs.writeFileSync(path.join(out,'FONT-SOURCE.txt'),source+'\nGalmuri11 参考候補 — SIL Open Font License 1.1\n作者の固定 commit: https://github.com/quiple/galmuri/tree/71e1cacf1437a11220307120e63e30bc275312d4\nWOFF2: 505400 bytes; SHA-256 8bad9322b3340bfb5cb26cb00f4752bf4c8e7d1b526bb07205f4af458eebed31\nLICENSE: SHA-256 86a3ee9495f942f0243f18c103da9faca27adb88142613edb8bb852e56c892c1; assets/Galmuri-LICENSE.txt に全文と著作権表示\n参考比較のみ。出自・権利・字形・公開可否について独立した確認が必要です。\n');
 fs.writeFileSync(path.join(out,'index.html'),html);
 console.log(`研究用の候補比較を作成: ${out}\n正式採用・PWA設定・正式配布ではありません。`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
