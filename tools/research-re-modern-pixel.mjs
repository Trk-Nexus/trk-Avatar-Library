#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Reproduce a narrow, offline, temporary importer/contrast experiment. No release or production changes.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {researchCatalog} from './lib/re-modern-research-catalog.mjs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pwa = process.env.TRK_PWA && path.resolve(process.env.TRK_PWA);
function run(cmd,args,cwd) {
  const r=spawnSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:10*1024*1024});
  if(r.error || r.status !== 0) throw new Error(`${cmd} ${args[0]}: ${r.error || r.stderr || r.stdout}`);
  return r.stdout;
}
let tmp;
try {
  if (!pwa) throw Error('TRK_PWA に固定版の checkout を指定してください');
  const p = JSON.parse(fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-candidate.json')));
  if (run('git',['rev-parse','HEAD'],pwa).trim() !== p.pwaRef || run('git',['status','--porcelain'],pwa).trim()) throw Error('PWA checkout が指定されたクリーンな固定版ではありません');
  const {bytes,source:catalogSource} = researchCatalog(root,p.catalogSha256);
  const catalog = JSON.parse(bytes), groups = JSON.parse(fs.readFileSync(path.join(root,'skin-volumes/volumes.json')));
  const source = catalog.skins.find(s => s.id === p.sourceId);
  if (!source || catalog.skins.some(s => s.id === p.candidate.id)) throw Error('元 ID なし、または仮 ID が既に正本に存在します');
  const group = groups.groups.find(g=>g.id==='glitch');
  if (!group || !Array.isArray(group.ids)) throw Error('研究用に使う glitch の IDs がありません');
  // Only the experiment uses this group. It is not an accepted production grouping.
  catalog.skins.push({...source,...p.candidate}); catalog.count=catalog.skins.length; group.ids.push(p.candidate.id);
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'re-modern-pixel-'));
  const cat=path.join(tmp,'catalog.json'),vol=path.join(tmp,'volumes.json'),out=path.join(tmp,'skins.js');
  fs.writeFileSync(cat,JSON.stringify(catalog));fs.writeFileSync(vol,JSON.stringify(groups));
  const importerLog = run(process.execPath,['tools/import-skin-catalog.mjs',cat,'--cat=','--exclude-cat=wizard','--only-new',`--volumes=${vol}`,'--kind=volumes',`--out=${out}`],pwa);
  const code=fs.readFileSync(out,'utf8');
  const start=code.indexOf(`S[${JSON.stringify(p.candidate.id)}] = {`), end=code.indexOf('\n  };',start);
  if (start<0 || end<0) throw Error('試験 ID が PWA 生成物にありません');
  const block=code.slice(start,end), report=JSON.parse(run(process.execPath,['tools/check-skin-contrast.mjs',out,'--json'],pwa));
  const issues=report.problems.filter(x=>x.id===p.candidate.id), held=report.holdbackProblems.filter(x=>x.id===p.candidate.id);
  const holdbackDeclared=/\bholdback:true/.test(block);
  const result={pwa:p.pwaRef,catalogSha256:p.catalogSha256,catalogSource,id:p.candidate.id,experimental:true,numberGenerated:report.skins,
    candidateProblems:issues,candidateHoldback:held,holdbackDeclared,overallProblems:report.problems.length,overallHoldbackProblems:report.holdbackProblems.length,
    generatedUi:JSON.parse(block.match(/\n    ui:(\{[^\n]*\}),/)[1]),
    adjustment:importerLog.split('\n').find(line=>line.includes(p.candidate.id+'：')) || null,
    scope:'Temporary generated data and PWA color checker only; no browser, font loading, safety or runtime category validation.'};
  console.log(JSON.stringify(result,null,2));
  if(issues.length || held.length || holdbackDeclared) process.exitCode=1;
} catch(e) { console.error(`❌ ${e.message}`);process.exitCode=1; }
finally { if(tmp) fs.rmSync(tmp,{recursive:true,force:true}); }
