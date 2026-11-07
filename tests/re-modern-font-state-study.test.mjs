// SPDX-License-Identifier: GPL-3.0-or-later
// Pure research-model tests: no real storage, PWA, font files or DOM.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,transition} from '../docs/re-modern-research/pixel-console-font-state-study/model.mjs';
const send=(s,e)=>transition(s,e);
function step(s,event){const r=send(s,event);assert.equal(r.accepted,true,JSON.stringify(event));return r;}
function effect(r,type){const e=r.effects.find(e=>e.type===type);assert(e,`missing ${type}: ${JSON.stringify(r)}`);return e;}
function ready(record=null){
 let s=initial(),r=step(s,{type:'user-override',value:'no'});s=r.state;
 r=step(s,{type:'read-start'});const t=effect(r,'read-consistent-storage').token;
 return step(r.state,{type:'read-ok',token:t,id:record}).state;
}
function selected(record='pack-v1') {return step(ready(record),{type:'select',work:'pixel'}).state;}
function activate(s){const a=step(s,{type:'apply'}),t=effect(a,'verify-and-load-both').token;const b=step(a.state,{type:'load-ok',token:t});effect(b,'attach-scoped-font');return step(b.state,{type:'attach-ok',token:t}).state;}
function denied(s,event){const r=send(s,event);assert.equal(r.accepted,false);assert.deepEqual(r.state,s);assert.deepEqual(r.effects,[]);}
function invariant(s){
 assert(['keep','pixel','other'].includes(s.work));assert(['yes','no','unknown'].includes(s.override));
 assert(['unknown','absent','present'].includes(s.record.status));
 assert.equal(s.record.status==='present',typeof s.record.id==='string');
 if(s.active){assert.equal(s.work,'pixel');assert.equal(s.override,'no');assert.equal(s.record.status,'present');assert.equal(s.active.id,s.record.id);assert.equal(s.load,null);}
 if(s.load){assert.equal(s.work,'pixel');assert.equal(s.override,'no');assert.equal(s.record.status,'present');assert.equal(s.load.id,s.record.id);assert.equal(s.active,null);assert(['loading','attaching'].includes(s.load.phase));}
}

test('fail closed on unknown preference/storage; saving never auto-applies',()=>{
 let s=initial();denied(s,{type:'apply'});denied(s,{type:'save-start',id:'v1'});
 s=step(s,{type:'select',work:'pixel'}).state;denied(s,{type:'apply'});
 s=step(s,{type:'user-override',value:'no'}).state;
 let r=step(s,{type:'apply'});assert.equal(r.state.notice,'storage-unknown');assert.deepEqual(r.effects,[]);s=r.state;
 r=step(s,{type:'read-start'});s=step(r.state,{type:'read-ok',token:effect(r,'read-consistent-storage').token,id:null}).state;
 r=step(s,{type:'apply'});assert.equal(r.state.notice,'extension-missing');assert.deepEqual(r.effects,[]);s=r.state;
 r=step(s,{type:'save-start',id:'pack-v1'});const t=effect(r,'save-atomic').token;
 r=step(r.state,{type:'storage-ok',token:t});s=r.state;
 assert.equal(s.notice,'saved-not-applied');assert.equal(s.active,null);assert.deepEqual(r.effects,[]);
 s=activate(s);assert.equal(s.active.id,'pack-v1');
});

test('changing work or user preference cancels loading and makes late completion stale',()=>{
 let s=selected();let r=step(s,{type:'apply'});const t=effect(r,'verify-and-load-both').token;
 r=step(r.state,{type:'select',work:'other'});assert.equal(effect(r,'cancel-load').token,t);s=r.state;
 denied(s,{type:'load-ok',token:t});denied(s,{type:'apply'});
 s=step(s,{type:'select',work:'pixel'}).state;
 r=step(s,{type:'apply'});const t2=effect(r,'verify-and-load-both').token;
 r=step(r.state,{type:'user-override',value:'yes'});assert.equal(effect(r,'cancel-load').token,t2);s=r.state;
 denied(s,{type:'load-ok',token:t2});denied(s,{type:'apply'});
 s=step(s,{type:'user-override',value:'no'}).state;assert.equal(s.active,null);assert.equal(s.load,null);
});

test('partial load failure cleans temporary resources; disable releases only owned fonts',()=>{
 let r=step(selected(),{type:'apply'});const t=effect(r,'verify-and-load-both').token;
 r=step(r.state,{type:'load-fail',token:t});effect(r,'cleanup-partial');assert.equal(r.state.active,null);assert.equal(r.state.notice,'font-load-failed');
 let s=activate(r.state);r=step(s,{type:'user-override',value:'yes'});assert.equal(effect(r,'release-fonts').id,'pack-v1');s=r.state;
 assert.equal(s.override,'yes');r=step(s,{type:'disable'});assert.deepEqual(r.effects,[]);assert.equal(r.state.override,'yes');
});

test('attachment is a separate fallible stage and stale completion cannot activate',()=>{
 let r=step(selected(),{type:'apply'});const t=effect(r,'verify-and-load-both').token;
 denied(r.state,{type:'attach-ok',token:t});r=step(r.state,{type:'load-ok',token:t});effect(r,'attach-scoped-font');assert.equal(r.state.active,null);
 let failed=step(r.state,{type:'attach-fail',token:t});effect(failed,'cleanup-partial');assert.equal(failed.state.active,null);
 r=step(selected(),{type:'apply'});const t2=effect(r,'verify-and-load-both').token;r=step(r.state,{type:'load-ok',token:t2});
 r=step(r.state,{type:'select',work:'other'});effect(r,'cancel-load');denied(r.state,{type:'attach-ok',token:t2});
});

test('confirmed rollback preserves old active record; uncertainty revokes it and requires reconciliation',()=>{
 let s=activate(selected());let r=step(s,{type:'save-start',id:'pack-v2'});const t=effect(r,'save-atomic').token;
 r=step(r.state,{type:'storage-rolled-back',token:t});s=r.state;assert.equal(s.record.id,'pack-v1');assert.equal(s.active.id,'pack-v1');assert.deepEqual(r.effects,[]);
 r=step(s,{type:'save-start',id:'pack-v2'});const t2=effect(r,'save-atomic').token;
 r=step(r.state,{type:'storage-uncertain',token:t2});s=r.state;effect(r,'release-fonts');assert.equal(s.record.status,'unknown');assert.equal(s.active,null);
 denied(s,{type:'storage-ok',token:t2});
 r=step(s,{type:'read-start'});s=step(r.state,{type:'read-ok',token:effect(r,'read-consistent-storage').token,id:'pack-v2'}).state;
 assert.equal(s.record.id,'pack-v2');assert.equal(s.active,null,'reconciliation never auto-applies');
});

test('committed replace/delete revoke the old application; deletion needs confirmation',()=>{
 let s=activate(selected());denied(s,{type:'delete-start',confirmed:false});
 let r=step(s,{type:'save-start',id:'pack-v2'});const t=effect(r,'save-atomic').token;
 r=step(r.state,{type:'storage-ok',token:t});effect(r,'release-fonts');s=r.state;
 assert.equal(s.record.id,'pack-v2');assert.equal(s.active,null);s=activate(s);
 r=step(s,{type:'delete-start',confirmed:true});const d=effect(r,'delete-atomic').token;
 r=step(r.state,{type:'storage-ok',token:d});effect(r,'release-fonts');s=r.state;
 assert.equal(s.record.status,'absent');assert.equal(s.active,null);assert.equal(s.work,'pixel');
 const fail=step(s,{type:'apply'});assert.equal(fail.state.notice,'extension-missing');
});

test('same-id replacement invalidates a pending load and ignores late callbacks',()=>{
 let r=step(selected(),{type:'apply'}),load=effect(r,'verify-and-load-both').token;
 r=step(r.state,{type:'save-start',id:'pack-v1'});const save=effect(r,'save-atomic').token;
 r=step(r.state,{type:'storage-ok',token:save});assert.equal(effect(r,'cancel-load').token,load);
 denied(r.state,{type:'load-ok',token:load});assert.equal(r.state.active,null);
});

test('external change, uncertain ordering and restart require host quiescence and fresh read',()=>{
 let r=step(selected(),{type:'apply'});const load=effect(r,'verify-and-load-both').token;
 r=step(r.state,{type:'save-start',id:'v2'});const write=effect(r,'save-atomic').token;
 r=step(r.state,{type:'external-change'});effect(r,'cancel-storage');effect(r,'cancel-load');let s=r.state;
 assert.equal(s.record.status,'unknown');denied(s,{type:'storage-ok',token:write});denied(s,{type:'load-ok',token:load});
 r=step(s,{type:'read-start'});const oldRead=effect(r,'read-consistent-storage').token;
 r=step(r.state,{type:'restart'});effect(r,'cancel-storage');s=r.state;
 assert.equal(s.work,'keep');assert.equal(s.override,'unknown');assert.equal(s.record.status,'unknown');
 r=step(s,{type:'read-start'});assert.notEqual(effect(r,'read-consistent-storage').token,oldRead);denied(r.state,{type:'read-ok',token:oldRead,id:'v1'});
});

test('storage failure, save/delete overlap, stale events and bad inputs fail closed',()=>{
 let r=step(initial(),{type:'read-start'});const t=effect(r,'read-consistent-storage').token;
 r=step(r.state,{type:'read-fail',token:t});assert.equal(r.state.record.status,'unknown');
 let s=selected();r=step(s,{type:'delete-start',confirmed:true});
 denied(r.state,{type:'save-start',id:'v2'});denied(r.state,{type:'apply'});denied(r.state,{type:'storage-ok',token:999});
 denied(s,{type:'save-start',id:'../bad'});denied(s,{type:'user-override',value:'maybe'});denied(s,{type:'select',work:'not-a-work'});denied(s,{type:'unknown'});
});

test('deterministic adversarial event traces preserve invariants',()=>{
 let seed=0x4aa159;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 let s=initial();
 for(let i=0;i<10000;i++){
  const t=s.storage?.token??-1,l=s.load?.token??-1;
  const events=[{type:'select',work:['keep','pixel','other'][random()%3]},{type:'user-override',value:['yes','no','unknown'][random()%3]},
   {type:'read-start'},{type:'read-ok',token:t,id:random()%2?'v1':null},{type:'read-fail',token:t},
   {type:'save-start',id:random()%2?'v1':'v2'},{type:'delete-start',confirmed:!!(random()%2)},
   {type:'storage-ok',token:t},{type:'storage-rolled-back',token:t},{type:'storage-uncertain',token:t},
   {type:'external-change'},{type:'apply'},{type:'load-ok',token:l},{type:'load-fail',token:l},{type:'attach-ok',token:l},{type:'attach-fail',token:l},{type:'disable'},{type:'restart'},
   {type:'load-ok',token:999999},{type:'storage-ok',token:999999}];
  const r=send(s,events[random()%events.length]);if(!r.accepted){assert.deepEqual(r.state,s);assert.deepEqual(r.effects,[]);}s=r.state;invariant(s);
 }
});
