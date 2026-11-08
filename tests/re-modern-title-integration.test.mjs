// SPDX-License-Identifier: GPL-3.0-or-later
// Pure reference model and metadata checks. Not a PWA integration/browser test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {validateCatalog,resolveTitle,initialSwitch,beginSwitch,finishPrepare,finishCommit,invalidate} from '../docs/re-modern-research/title-font-integration/model.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../docs/re-modern-research/title-font-integration/catalog.proposal.json',import.meta.url)));
const workId=catalog.work.id;
const input=()=>({global:{mode:'off'},work:{enabled:false,workId,candidateId:'dotneo'},selectedWorkId:workId,availability:{dotneo:'ready',galmuri:'ready',press:'ready'}});
const base={source:'base',reason:'work-disabled',targets:[]};
const copy=x=>structuredClone(x);
const global={source:'global',candidateId:'galmuri'},work={source:'work',candidateId:'dotneo'};

test('proposal is valid, no final selection, and three candidates retain their roles',()=>{
 assert.equal(validateCatalog(catalog).ok,true);assert.equal(catalog.work.selectedCandidate,null);
 assert.deepEqual(catalog.candidates.map(x=>[x.id,x.role]),[['dotneo','multilingual-comparison'],['galmuri','multilingual-comparison'],['press','latin-subcomparison']]);
});
test('bad catalog header, duplicates, unsafe paths and missing assets fail closed',()=>{
 const cases=[c=>c.version=2,c=>c.status='accepted',c=>c.assets.push(copy(c.assets[0])),c=>c.assets[0].license.pwaPath='../OFL.txt',c=>c.assets[0].sha256='x',c=>c.candidates[0].assets.push('missing'),c=>c.work.comparisonCandidates.push('missing'),c=>c.work.selectedCandidate='galmuri'];
 for(const mutate of cases){const c=copy(catalog);mutate(c);assert.equal(validateCatalog(c).ok,false);assert.equal(resolveTitle(c,input()).source,'base');}
});
test('default and migrated disabled states preserve existing display',()=>{assert.deepEqual(resolveTitle(catalog,input()),base);});
test('work needs explicit opt-in and the matching selected work',()=>{
 const x=input();x.work.enabled=true;assert.deepEqual(resolveTitle(catalog,x),{source:'work',candidateId:'dotneo',workId,targets:['common-title','selected-work-card']});
 x.selectedWorkId='other-work';assert.equal(resolveTitle(catalog,x).reason,'work-not-selected');x.selectedWorkId=workId;x.work.workId='other-work';assert.equal(resolveTitle(catalog,x).reason,'work-not-selected');
});
test('global choice wins even when a work choice is enabled',()=>{
 const x=input();x.work.enabled=true;x.global={mode:'candidate',id:'galmuri'};assert.deepEqual(resolveTitle(catalog,x),{source:'global',candidateId:'galmuri',targets:['common-title','all-work-cards']});
});
test('unavailable or unknown global does not silently fall through to work',()=>{
 const x=input();x.work.enabled=true;x.global={mode:'candidate',id:'galmuri'};for(const a of ['unknown','missing','bad','error',undefined]){x.availability.galmuri=a;const r=resolveTitle(catalog,x);assert.equal(r.source,'base');assert.equal(r.reason,'global-unavailable');}
 x.global.id='unrecognized';assert.equal(resolveTitle(catalog,x).reason,'unknown-global');
});
test('work candidate missing, invalid or unavailable never activates',()=>{
 const x=input();x.work.enabled=true;for(const a of ['unknown','missing','bad','error',undefined]){x.availability.dotneo=a;assert.equal(resolveTitle(catalog,x).reason,'work-unavailable');}x.work.candidateId='invalid';assert.equal(resolveTitle(catalog,x).reason,'unknown-work-candidate');
});
test('malformed settings fail closed without changing inputs',()=>{
 for(const x of [null,{}, {global:{mode:'off'},work:{enabled:'true'},availability:{}},{global:{mode:'x'},work:{enabled:false},availability:{}}])assert.equal(resolveTitle(catalog,x).source,'base');
 const x=input(),before=copy(x);resolveTitle(catalog,x);assert.deepEqual(x,before);
});
test('staging failure keeps old committed selection, including partial load failures',()=>{
 const first=initialSwitch(global),a=beginSwitch(first,work),b=finishPrepare(a.state,a.state.pending.token,false);
 assert.deepEqual(b.state.active,global);assert.equal(b.state.pending,null);assert.equal(b.state.notice,'prepare-failed');assert.equal(b.effects[0].type,'cleanup-prepared');assert.deepEqual(first,initialSwitch(global));
});
test('commit occurs only after successful preparation; confirmed rollback retains old choice',()=>{
 const a=beginSwitch(initialSwitch(global),work),token=a.state.pending.token;
 assert.equal(finishCommit(a.state,token,'committed').state.active.candidateId,'galmuri');
 const b=finishPrepare(a.state,token,true);assert.deepEqual(b.state.active,global);assert.equal(b.effects[0].type,'commit-request');
 const c=finishCommit(b.state,token,'rolled-back');assert.deepEqual(c.state.active,global);assert.equal(c.state.notice,'commit-failed');
 const d=finishCommit(b.state,token,'committed');assert.deepEqual(d.state.active,work);assert.equal(d.state.notice,'active');
});
test('uncertain commit revokes owned choice and asks the host to reconcile',()=>{
 const a=beginSwitch(initialSwitch(global),work),t=a.state.pending.token,b=finishPrepare(a.state,t,true),c=finishCommit(b.state,t,'uncertain');assert.equal(c.state.active,null);assert.equal(c.state.notice,'uncertain');assert(c.effects.some(e=>e.type==='release-owned-and-reconcile'));
});
test('late preparation cannot override newer choice and must be cleaned',()=>{
 const a=beginSwitch(initialSwitch(global),work),t=a.state.pending.token,b=beginSwitch(a.state,global);assert(b.effects.some(e=>e.type==='cancel-pending'&&e.token===t));
 for(const ok of [true,false]){const old=finishPrepare(b.state,t,ok);assert.equal(old.effects[0].type,'cleanup-prepared');assert.deepEqual(old.state,b.state);}
});
test('late commit result triggers reconciliation and never changes model state',()=>{
 const a=beginSwitch(initialSwitch(global),work),t=a.state.pending.token,b=finishPrepare(a.state,t,true),c=invalidate(b.state),late=finishCommit(c.state,t,'committed');
 assert.equal(late.state.active,null);assert(c.effects.some(e=>e.type==='cancel-pending'&&e.token===t));assert(late.effects.some(e=>e.type==='reconcile-if-commit-may-have-run'));
});
test('combinations never select work while an explicit global candidate is present',()=>{
 for(const g of ['ready','missing','bad','error','unknown'])for(const w of ['ready','missing','bad','error','unknown'])for(const enabled of [true,false]){
  const x=input();x.global={mode:'candidate',id:'galmuri'};x.work.enabled=enabled;x.availability.galmuri=g;x.availability.dotneo=w;assert.notEqual(resolveTitle(catalog,x).source,'work');
 }
});
const pwa=process.env.TRK_PWA_REVIEW;
test('fixed PWA candidate data and independent license bytes match the proposal',{skip:pwa?false:'set TRK_PWA_REVIEW to PWA 1fd6a89'},()=>{
 const src=fs.readFileSync(path.join(pwa,'js/title-font.js'));
 assert.equal(crypto.createHash('sha256').update(src).digest('hex'),'ddf4a4d4d46ebab765a0f0da789dec7b6a8eac9986cf5c86ad04de0908390581');
 const doc={readyState:'loading',addEventListener(){}};const box={document:doc,addEventListener(){},localStorage:{getItem(){return null;}}};box.window=box;vm.runInNewContext(src.toString(),box);const candidates=box.Trk.titleFont.CANDIDATES;
 for(const candidate of catalog.candidates){const actual=candidates.find(x=>x.id===candidate.id);assert(actual,candidate.id);assert.equal(actual.name,candidate.name);assert.deepEqual(Array.from(actual.files,x=>x.key),candidate.assets);
  for(const id of candidate.assets){const a=catalog.assets.find(x=>x.id===id),f=actual.files.find(x=>x.key===id),l=actual.licences.find(x=>x.name===a.name);assert(l,id);assert.equal(f.name,a.file);assert.equal(f.bytes,a.bytes);assert.equal(f.sha256,a.sha256);assert.equal(l.path,a.license.pwaPath);assert.equal(l.sha256,a.license.sha256);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(pwa,l.path))).digest('hex'),a.license.sha256);}
 }
});
const fontDir=process.env.TRK_TITLE_FONT_DIR;
test('explicitly supplied real font files match proposal',{skip:fontDir?false:'set TRK_TITLE_FONT_DIR to the four fixed font files'},()=>{
 for(const asset of catalog.assets){const bytes=fs.readFileSync(path.join(fontDir,asset.file));assert.equal(bytes.length,asset.bytes,asset.id);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.id);}
});
