// SPDX-License-Identifier: GPL-3.0-or-later
// Pure, research-only single-client state model. It performs NO I/O, storage,
// PWA calls, font loading, CSS changes or permission checks. Host effects and
// transaction/verification outcomes are simulated; this is not a runtime API.
export function initial() {
  return {work:'keep', override:'unknown', record:{status:'unknown',id:null},
    storage:null, load:null, active:null, seq:0, notice:'storage-unknown'};
}
const idOK = id => typeof id==='string' && /^[a-zA-Z0-9._-]{1,80}$/.test(id);
const same = (s,kind,token) => s.storage?.kind===kind && s.storage.token===token;
function invalidate(s,effects) {
  if(s.load) { effects.push({type:'cancel-load',token:s.load.token});s.load=null; }
  if(s.active) { effects.push({type:'release-fonts',id:s.active.id});s.active=null; }
}
function stopStorage(s,effects) {
  if(s.storage) {effects.push({type:'cancel-storage',token:s.storage.token});s.storage=null;}
}
function token(s){return ++s.seq;}
function result(s,effects,accepted=true){return {state:s,effects,accepted};}
// A denied or stale event has no side effects or state changes, including notice.
export function transition(current,event) {
  if(!event || typeof event.type!=='string')return result(current,[],false);
  const s=structuredClone(current), effects=[];
  switch(event.type){
    case 'select': {
      if(!['keep','pixel','other'].includes(event.work))return result(current,[],false);
      if(event.work!==s.work)invalidate(s,effects);
      s.work=event.work;s.notice='selection-changed';break;
    }
    // 'unknown' is fail-closed. Clearing a user override never auto-applies.
    case 'user-override': {
      if(!['yes','no','unknown'].includes(event.value))return result(current,[],false);
      s.override=event.value;
      if(s.override!=='no')invalidate(s,effects);
      s.notice='user-preference-changed';break;
    }
    case 'read-start': {
      if(s.record.status!=='unknown'||s.storage)return result(current,[],false);
      // The host must settle/serialize conflicting writes *and* read a fresh
      // snapshot as one coordinated operation before it reports read-ok.
      // Token checks alone do not establish cross-tab ordering.
      const t=token(s);s.storage={kind:'read',token:t};effects.push({type:'read-consistent-storage',token:t});s.notice='checking-storage';break;
    }
    case 'read-ok': {
      if(!same(s,'read',event.token) || !(event.id===null||idOK(event.id)))return result(current,[],false);
      s.storage=null;s.record=event.id===null?{status:'absent',id:null}:{status:'present',id:event.id};s.notice=event.id===null?'extension-missing':'extension-present';break;
    }
    case 'read-fail': {
      if(!same(s,'read',event.token))return result(current,[],false);
      s.storage=null;s.notice='storage-read-failed';break;
    }
    case 'save-start': {
      if(s.record.status==='unknown'||s.storage||!idOK(event.id))return result(current,[],false);
      const t=token(s);s.storage={kind:'save',token:t,id:event.id};effects.push({type:'save-atomic',token:t,id:event.id});s.notice='saving';break;
    }
    case 'delete-start': {
      if(s.record.status!=='present'||s.storage||event.confirmed!==true)return result(current,[],false);
      const t=token(s);s.storage={kind:'delete',token:t,id:s.record.id};effects.push({type:'delete-atomic',token:t,id:s.record.id});s.notice='deleting';break;
    }
    case 'storage-ok': {
      if(!s.storage||!['save','delete'].includes(s.storage.kind)||s.storage.token!==event.token)return result(current,[],false);
      const pending=s.storage;s.storage=null;
      // Commit was confirmed: invalidate every cached read and active face,
      // including if a new record reused the old symbolic id. No auto-apply.
      invalidate(s,effects);
      s.record=pending.kind==='save'?{status:'present',id:pending.id}:{status:'absent',id:null};
      s.notice=pending.kind==='save'?'saved-not-applied':'deleted';break;
    }
    case 'storage-rolled-back': {
      if(!s.storage||!['save','delete'].includes(s.storage.kind)||s.storage.token!==event.token)return result(current,[],false);
      s.storage=null;s.notice='storage-failed-unchanged';break;
    }
    case 'storage-uncertain': {
      if(!s.storage||!['save','delete'].includes(s.storage.kind)||s.storage.token!==event.token)return result(current,[],false);
      s.storage=null;invalidate(s,effects);s.record={status:'unknown',id:null};s.notice='storage-uncertain-recheck';break;
    }
    case 'external-change': {
      // Host must cancel/quiesce in-flight transactions and reconcile only
      // after commit ordering is known. A token alone cannot stop disk writes.
      stopStorage(s,effects);invalidate(s,effects);s.record={status:'unknown',id:null};s.notice='storage-changed-recheck';break;
    }
    case 'apply': {
      if(s.work!=='pixel'||s.override!=='no'||s.active||s.load)return result(current,[],false);
      if(s.record.status!=='present'){s.notice=s.record.status==='unknown'?'storage-unknown':'extension-missing';break;}
      // An update/delete might commit during load. Avoid issuing new reads while
      // a local storage transaction is pending; external changes still require
      // quiescing and notification by the host.
      if(s.storage)return result(current,[],false);
      const t=token(s);s.load={token:t,id:s.record.id,phase:'loading'};effects.push({type:'verify-and-load-both',token:t,id:s.record.id});s.notice='loading';break;
    }
    case 'load-ok': {
      if(!s.load||s.load.token!==event.token||s.load.phase!=='loading')return result(current,[],false);
      if(s.work!=='pixel'||s.override!=='no'||s.record.status!=='present'||s.record.id!==s.load.id)return result(current,[],false);
      // Host says both exact files and both licences were verified and loaded.
      // Applying to the target is a separate operation that can also fail.
      s.load.phase='attaching';effects.push({type:'attach-scoped-font',token:s.load.token,id:s.load.id});s.notice='attaching';break;
    }
    case 'attach-ok': {
      if(!s.load||s.load.token!==event.token||s.load.phase!=='attaching')return result(current,[],false);
      s.active={id:s.load.id};s.load=null;s.notice='font-active';break;
    }
    case 'load-fail':
    case 'attach-fail': {
      const expected=event.type==='load-fail'?'loading':'attaching';
      if(!s.load||s.load.token!==event.token||s.load.phase!==expected)return result(current,[],false);
      effects.push({type:'cleanup-partial',token:s.load.token});s.load=null;s.notice='font-load-failed';break;
    }
    case 'disable': {
      invalidate(s,effects);s.notice='font-off';break;
    }
    case 'restart': {
      // Simulated session only: no preference is persisted or restored here.
      // Preserve the monotonically increasing token so old callbacks stay stale.
      stopStorage(s,effects);invalidate(s,effects);
      const fresh=initial();fresh.seq=s.seq;return result(fresh,effects);
    }
    default:return result(current,[],false);
  }
  return result(s,effects);
}
