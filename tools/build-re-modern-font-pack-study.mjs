#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Build an isolated, FONT-ONLY research pack, never a release. No network fetch.
// node tools/build-re-modern-font-pack-study.mjs --trk=/path/to/pwa --neo-dir=/path/to/fixed-files [--out=/path/to/research.stpack]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const arg of args) assert(/^--(?:trk|neo-dir|out)=.+$/.test(arg),`unknown or empty argument: ${arg}`);
for(const key of ['trk','neo-dir','out']) assert(args.filter(x=>x.startsWith(`--${key}=`)).length<=1,`duplicate argument: ${key}`);
const value=key=>args.find(x=>x.startsWith(`--${key}=`))?.slice(key.length+3);
const trk=value('trk') || process.env.TRK_PWA;
const neo=value('neo-dir');
assert(trk && neo,'--trk (or TRK_PWA) and --neo-dir are required');
const out=path.resolve(value('out')||path.join(root,'dist/re-modern-font-pack-study/pixel-console-research.stpack'));
assert(out.endsWith('.stpack'),'research output must end in .stpack');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'pixel-font-pack-research-'));
try{
 const run=(file,argv)=>{
  const r=spawnSync(process.execPath,[path.join(root,file),...argv],{cwd:root,encoding:'utf8'});
  if(r.status!==0)throw new Error(`${file} failed: ${r.stderr||r.stdout}`);
  return r.stdout;
 };
 // Existing preparation checks both source WOFF2 files, both OFL files and the
 // original DotGothic pack against pinned hashes before creating anything.
 const specimen=path.join(temp,'specimen');
 run('tools/prepare-re-modern-font-study.mjs',[`--out=${specimen}`,`--trk=${trk}`,`--neo-dir=${neo}`]);
 const dir=path.join(temp,'pack');fs.mkdirSync(path.join(dir,'fonts'),{recursive:true});
 const template=path.join(root,'docs/re-modern-research/pixel-console-font-pack-study');
 for(const name of ['pack.json','NOTICE.md'])fs.copyFileSync(path.join(template,name),path.join(dir,name));
 for(const [src,dest] of [['DotGothic16-Regular.woff2','dotgothic.woff2'],['OFL.txt','dot/OFL.txt'],['neodgm.woff2','neodgm.woff2'],['NeoDunggeunmo-OFL.txt','neo/OFL.txt']])
  {fs.mkdirSync(path.dirname(path.join(dir,'fonts',dest)),{recursive:true});fs.copyFileSync(path.join(specimen,'assets',src),path.join(dir,'fonts',dest));}
 console.log(run('tools/build-pack.mjs',[dir,`--out=${out}`,`--trk=${trk}`]).trim());
 console.log('研究専用。現行PWAでは本文にも適用されます。正式配布物ではありません。');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
