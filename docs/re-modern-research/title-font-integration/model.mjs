// SPDX-License-Identifier: GPL-3.0-or-later
// Research-only decision model. No DOM, FontFace, network, persistence or PWA API.
// Availability and commit results are claims from the host, not verified here.
const ID=/^[a-z0-9]+(?:[-][a-z0-9]+)*$/;
const SHA=/^[a-f0-9]{64}$/;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
const unique=x=>new Set(x).size===x.length;
const fail=(reason)=>({ok:false,reason});

// This checks the structure of OUR fixed research data, not arbitrary PWA packs.
export function validateCatalog(c){
 if(!object(c)||c.format!=='trk-title-font-research-catalog'||c.version!==1||c.status!=='research-proposal-not-a-pwa-schema'||!/^[a-f0-9]{40}$/.test(c.pwaReference||''))return fail('header');
 if(!object(c.work)||!ID.test(c.work.id||'')||!text(c.work.name)||c.work.selectedCandidate!==null||!Array.isArray(c.work.comparisonCandidates))return fail('work');
 if(!Array.isArray(c.candidates)||!c.candidates.length||!Array.isArray(c.assets)||!c.assets.length)return fail('entries');
 const assetIds=c.assets.map(a=>a?.id),candidateIds=c.candidates.map(a=>a?.id);
 if(!unique(assetIds)||!unique(candidateIds))return fail('duplicate');
 for(const a of c.assets){
  if(!object(a)||!ID.test(a.id||'')||!text(a.name)||typeof a.file!=='string'||!/^[a-zA-Z0-9._-]+\.woff2$/.test(a.file)||!Number.isSafeInteger(a.bytes)||a.bytes<=0||a.bytes>1048576||!SHA.test(a.sha256||''))return fail('asset');
  if(!object(a.license)||!text(a.license.name)||typeof a.license.pwaPath!=='string'||!/^fonts\/licenses\/[a-zA-Z0-9._-]+\.txt$/.test(a.license.pwaPath)||!SHA.test(a.license.sha256||''))return fail('license');
 }
 for(const x of c.candidates){
  if(!object(x)||!ID.test(x.id||'')||!text(x.name)||!['multilingual-comparison','latin-subcomparison'].includes(x.role)||!Array.isArray(x.assets)||!x.assets.length||!unique(x.assets)||x.assets.some(id=>!assetIds.includes(id)))return fail('candidate');
 }
 if(!unique(c.work.comparisonCandidates)||c.work.comparisonCandidates.some(id=>!candidateIds.includes(id)))return fail('work-candidate');
 return {ok:true,reason:null};
}

// Committed state only: a candidate is ready ONLY when the host has verified
// ALL fixed bytes and has loaded every face in this session. No automatic fetch.
// Empty global choice means "global only off"; work use requires explicit opt-in.
export function resolveTitle(c,input){
 if(!validateCatalog(c).ok)return {source:'base',reason:'bad-catalog',targets:[]};
 if(!object(input)||!object(input.global)||!object(input.work)||!object(input.availability)||!['off','candidate'].includes(input.global.mode)||typeof input.work.enabled!=='boolean')return {source:'base',reason:'bad-state',targets:[]};
 const lookup=id=>c.candidates.find(x=>x.id===id);
 const ready=id=>Object.hasOwn(input.availability,id)&&input.availability[id]==='ready';
 if(input.global.mode==='candidate'){
  const id=input.global.id;
  if(!lookup(id))return {source:'base',reason:'unknown-global',targets:[]};
  if(!ready(id))return {source:'base',reason:'global-unavailable',targets:[]};
  return {source:'global',candidateId:id,targets:['common-title','all-work-cards']};
 }
 if(!input.work.enabled)return {source:'base',reason:'work-disabled',targets:[]};
 if(input.work.workId!==c.work.id||input.selectedWorkId!==c.work.id)return {source:'base',reason:'work-not-selected',targets:[]};
 const id=input.work.candidateId;
 if(!lookup(id)||!c.work.comparisonCandidates.includes(id))return {source:'base',reason:'unknown-work-candidate',targets:[]};
 if(!ready(id))return {source:'base',reason:'work-unavailable',targets:[]};
 return {source:'work',candidateId:id,workId:c.work.id,targets:['common-title','selected-work-card']};
}

// Selection staging reference: old committed choice remains while a host prepares
// all resources. Commit is an abstract host guarantee, NOT cross-store atomicity.
// Context invalidation tells the host to release ownership and reread storage.
export function initialSwitch(active=null){return {active,pending:null,seq:0,notice:'idle'};}
export function beginSwitch(state,choice){
 if(!object(state)||!object(choice)||!['global','work'].includes(choice.source)||!ID.test(choice.candidateId||''))throw new TypeError('invalid switch');
 const token=state.seq+1;
 const effects=state.pending?[{type:'cancel-pending',token:state.pending.token}]:[];
 effects.push({type:'prepare',token,choice:structuredClone(choice)});
 return {state:{...state,seq:token,pending:{token,choice:structuredClone(choice),phase:'preparing'},notice:'preparing'},effects};
}
export function finishPrepare(state,token,ok){
 if(typeof ok!=='boolean')throw new TypeError('invalid outcome');
 if(!state.pending||state.pending.token!==token||state.pending.phase!=='preparing')return {state,effects:[{type:'cleanup-prepared',token}]};
 if(!ok)return {state:{...state,pending:null,notice:'prepare-failed'},effects:[{type:'cleanup-prepared',token}]};
 return {state:{...state,pending:{...state.pending,phase:'committing'},notice:'committing'},effects:[{type:'commit-request',token,choice:structuredClone(state.pending.choice)}]};
}
export function finishCommit(state,token,outcome){
 if(!['committed','rolled-back','uncertain'].includes(outcome))throw new TypeError('invalid commit outcome');
 if(!state.pending||state.pending.token!==token||state.pending.phase!=='committing')return {state,effects:[{type:'cleanup-prepared',token},{type:'reconcile-if-commit-may-have-run'}]};
 if(outcome==='committed')return {state:{...state,active:structuredClone(state.pending.choice),pending:null,notice:'active'},effects:[{type:'release-previous-owned'}]};
 if(outcome==='rolled-back')return {state:{...state,pending:null,notice:'commit-failed'},effects:[{type:'cleanup-prepared',token}]};
 return {state:{...state,active:null,pending:null,notice:'uncertain'},effects:[{type:'cleanup-prepared',token},{type:'release-owned-and-reconcile'}]};
}
export function invalidate(state){
 const effects=state.pending?[{type:'cancel-pending',token:state.pending.token}]:[];
 effects.push({type:'release-owned-and-reconcile'});
 return {state:{...state,seq:state.seq+1,pending:null,active:null,notice:'uncertain'},effects};
}
