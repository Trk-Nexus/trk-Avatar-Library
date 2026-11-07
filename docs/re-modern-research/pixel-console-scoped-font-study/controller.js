// SPDX-License-Identifier: GPL-3.0-or-later
// Research-only, injected by an isolated test. This is NOT a PWA plugin or a
// production implementation. No network, persistence, or automatic install.
// The caller supplies exactly one explicit title element and a record reader.
(() => {
  'use strict';
  const spec = [
    {file:'fonts/dotgothic.woff2', license:'fonts/dot/OFL.txt', family:'AvatarScopeResearchDot', fontBytes:396312, licenseBytes:4399, fontHash:'a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee', licenseHash:'335d6a81ce1afcf64c8bc36334458ba3292ca6fba5d3974895b3ed84ccee530e'},
    {file:'fonts/neodgm.woff2', license:'fonts/neo/OFL.txt', family:'AvatarScopeResearchNeo', fontBytes:44352, licenseBytes:4420, fontHash:'0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf', licenseHash:'4d3155f4caba9970c8b386064b398822c29d9181cfba07964ba7b07ccc6cca91'}
  ];
  const digest=async blob => {
    const bytes=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
    return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
  };
  function create({title, readRecord}) {
    if (!(title instanceof HTMLElement) || typeof readRecord !== 'function') throw new TypeError('explicit title element and record reader required');
    const token='avatar-scope-research-'+crypto.randomUUID();
    let revision=0,active=null;
    function cleanup(item) {
      if(!item)return;
      if(item.style)item.style.remove();
      if(item.classAdded)title.classList.remove(token);
      for(const face of item.added)document.fonts.delete(face);
      for(const url of item.urls)URL.revokeObjectURL(url);
    }
    function disable() {
      revision++;
      const old=active;active=null;cleanup(old);
      return {status:'off'};
    }
    async function enable(id) {
      if(active)return {status:'already-active'};
      const version=++revision;
      const item={urls:[],added:[],style:null,classAdded:false};
      const cancelled=()=>version!==revision;
      try {
        if(!id || !title.isConnected)throw new Error('missing target or record id');
        const record=await readRecord(id);
        if(cancelled())return {status:'cancelled'};
        if(!record?.files)throw new Error('font extension missing');
        // Both original licenses and font bytes are pinned; no script or CSS
        // from the supplied pack is ever executed or injected.
        const faces=[];
        for(const f of spec){
          const blob=record.files[f.file], license=record.files[f.license];
          if(!(blob instanceof Blob) || !(license instanceof Blob))throw new Error('font or license missing');
          if(blob.size!==f.fontBytes || license.size!==f.licenseBytes)throw new Error('font or license size mismatch');
          if(await digest(blob)!==f.fontHash || await digest(license)!==f.licenseHash)throw new Error('font or license hash mismatch');
          if(cancelled())return {status:'cancelled'};
          const url=URL.createObjectURL(blob);item.urls.push(url);
          const face=new FontFace(f.family,`url(${url})`,{weight:'400',style:'normal',display:'swap'});
          await face.load();faces.push(face);
          if(cancelled())return {status:'cancelled'};
        }
        if(!title.isConnected)throw new Error('target removed');
        for(const face of faces){document.fonts.add(face);item.added.push(face);}
        item.style=document.createElement('style');
        item.style.textContent=`.${token}{font-family:"AvatarScopeResearchDot","AvatarScopeResearchNeo",var(--font,system-ui,sans-serif)}`;
        document.head.append(item.style);
        title.classList.add(token);item.classAdded=true;
        // Do not override a user's higher-priority title style. Roll back if it
        // prevents this scoped experiment from taking effect.
        if(!getComputedStyle(title).fontFamily.includes('AvatarScopeResearchDot'))throw new Error('title font overridden');
        active=item;
        return {status:'on',id};
      } catch(error) {
        return cancelled()?{status:'cancelled'}:{status:'error',reason:String(error?.message||error)};
      } finally {
        if(active!==item)cleanup(item);
      }
    }
    return {enable,disable,status:()=>active?'on':'off'};
  }
  window.AvatarScopedFontStudy=Object.freeze({create});
})();
