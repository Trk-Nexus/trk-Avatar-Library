#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Serve a TEMPORARY PWA copy with the unapproved draft. Never publish this build.
// TRK_PWA=/path/to/clean-fixed-pwa PORT=4175 node tools/preview-re-modern-pixel.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pwa=process.env.TRK_PWA && path.resolve(process.env.TRK_PWA);
const port=Number(process.env.PORT||4175), ref='f7b1272547f712d9a7d7a198404148457e936008';
function run(cmd,args,cwd){const r=spawnSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:10*1024*1024});if(r.error||r.status!==0)throw Error(`${cmd}: ${r.error||r.stderr||r.stdout}`);return r.stdout;}
if(!pwa||!Number.isInteger(port)||port<1||port>65535)throw Error('Set TRK_PWA to the fixed checkout and PORT to a valid port');
if(run('git',['rev-parse','HEAD'],pwa).trim()!==ref||run('git',['status','--porcelain'],pwa).trim())throw Error('PWA checkout must be clean and at the recorded commit');
const skin=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json')));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog/skins.json')));
const groups=JSON.parse(fs.readFileSync(path.join(root,'skin-volumes/volumes.json')));
if(catalog.skins.some(s=>s.id===skin.id)||groups.groups.some(g=>g.id==='trk-re-modern'))throw Error('Draft or preview volume already exists in the catalog');
let temp,server;
try {
  temp=fs.mkdtempSync(path.join(os.tmpdir(),'re-modern-preview-'));
  const copy=path.join(temp,'pwa');
  fs.cpSync(pwa,copy,{recursive:true,filter:s=>!['.git','node_modules'].includes(path.basename(s))});
  catalog.skins.push(skin);catalog.count=catalog.skins.length;
  groups.groups.push({id:'trk-re-modern',title:'制作案・一時テスト',ids:[skin.id]});
  const cat=path.join(temp,'catalog.json'),vol=path.join(temp,'volumes.json');
  fs.writeFileSync(cat,JSON.stringify(catalog));fs.writeFileSync(vol,JSON.stringify(groups));
  run(process.execPath,['tools/import-skin-catalog.mjs',cat,'--cat=','--exclude-cat=wizard','--only-new',`--volumes=${vol}`,'--kind=volumes','--out=js/skins-volumes.js'],copy);
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm','.woff2':'font/woff2','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
  server=createServer((req,res)=>{
    if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
    let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
    if(name.split('/').some(segment=>segment.startsWith('.')))return res.writeHead(404).end();
    const file=path.resolve(copy,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(copy+path.sep))return res.writeHead(404).end();
    try{const stat=fs.statSync(file);if(!stat.isFile()||!fs.realpathSync(file).startsWith(copy+path.sep))throw Error('not a public file');
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
      if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
    }catch{res.writeHead(404).end();}
  });
  server.on('error',e=>{console.error(e);if(temp)fs.rmSync(temp,{recursive:true,force:true});process.exitCode=1;});
  server.listen(port,'0.0.0.0',()=>console.log(`Temporary PWA draft preview on port ${port}. Settings → skin shelf → volume: 制作案・一時テスト. Not an approved release.`));
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{if(temp)fs.rmSync(temp,{recursive:true,force:true});process.exit(0);}));
} catch(e) {if(temp)fs.rmSync(temp,{recursive:true,force:true});throw e;}
