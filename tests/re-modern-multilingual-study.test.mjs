// SPDX-License-Identifier: GPL-3.0-or-later
// JS-disabled local specimen; not PWA behavior or a legibility review.
// TRK_PWA=/path/to/pinned-pwa TRK_NEO_DIR=/path/to/fixed-fonts node tests/re-modern-multilingual-study.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert(process.env.TRK_PWA&&process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR required');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-multilingual-test-'));
let browser,server;
try{
 const script=path.join(root,'tools/prepare-re-modern-multilingual-study.mjs');
 const run=(out,neo=process.env.TRK_NEO_DIR)=>spawnSync(process.execPath,[script,`--trk=${process.env.TRK_PWA}`,`--neo-dir=${neo}`,`--out=${out}`],{cwd:root,encoding:'utf8'});
 const build=run(tmp);assert.equal(build.status,0,build.stderr||build.stdout);
 const draft=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json')));
 const bad=path.join(tmp,'bad');fs.mkdirSync(bad);fs.writeFileSync(path.join(bad,'neodgm.woff2'),'wrong');fs.copyFileSync(path.join(tmp,'assets/NeoDunggeunmo-OFL.txt'),path.join(bad,'LICENSE.txt'));
 const original=fs.readFileSync(path.join(tmp,'index.html'));assert.notEqual(run(tmp,bad).status,0);assert.deepEqual(fs.readFileSync(path.join(tmp,'index.html')),original,'bad input must not overwrite output');
 server=createServer((req,res)=>{
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
  const file=path.resolve(tmp,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(tmp+path.sep))return res.writeHead(403).end();
  const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
  try{res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block',viewport:{width:1280,height:900}});
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'load'});
 assert(await page.locator('#font-system').isChecked());assert.equal(requests.filter(u=>u.endsWith('.woff2')).length,0);
 for(const lang of ['ja','en','zh','ko']){const item=page.locator(`#label-${lang}`);assert.equal(await item.textContent(),draft.label[lang]);assert.equal(await item.getAttribute('lang'),lang);}
 assert.equal(await page.locator('#brand').textContent(),'trk!');assert.equal(await page.locator('#brand').getAttribute('lang'),'en');
 assert.equal(await page.locator('script').count(),0);
 const body=await page.locator('section[aria-labelledby="comparison"] > p').first().evaluate(el=>getComputedStyle(el).fontFamily);
 for(const id of ['brand','label-ja','label-en','label-zh','label-ko'])assert(!(await page.locator(`#${id}`).evaluate(el=>getComputedStyle(el).fontFamily)).includes('ResearchDot'));
 // The first tab enters the checked radio; arrow keys change the group.
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'font-system');
 await page.keyboard.press('ArrowRight');assert(await page.locator('#font-pair').isChecked());
 const faces=await page.evaluate(async()=>{
  const [dot,neo]=await Promise.all([document.fonts.load('400 32px ResearchDot','ピクセル像素控制台trk!'),document.fonts.load('400 32px ResearchNeo','픽셀 콘솔')]);
  await document.fonts.ready;
  return [dot.map(f=>f.status),neo.map(f=>f.status)];
 });
 assert.deepEqual(faces,[['loaded'],['loaded']]);
 assert.equal(await page.locator('section[aria-labelledby="comparison"] > p').first().evaluate(el=>getComputedStyle(el).fontFamily),body);
 for(const id of ['brand','label-ja','label-en','label-zh','label-ko'])assert((await page.locator(`#${id}`).evaluate(el=>getComputedStyle(el).fontFamily)).includes('ResearchDot'));
 const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');
 const used={};for(const id of ['brand','label-ja','label-en','label-zh','label-ko']){
  const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:`#${id}`});used[id]=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;
  const name=id==='label-ko'?/neodunggeunmo|neo둥근모/i:/dotgothic16/i;
  const count=id==='label-ko'?4:id==='label-ja'?10:id==='label-zh'?5:id==='brand'?4:13;
  assert(used[id].some(f=>name.test(f.familyName)&&f.glyphCount===count),JSON.stringify({id,used:used[id]}));
  if(id==='label-ko')assert(used[id].some(f=>/dotgothic16/i.test(f.familyName)&&f.glyphCount===1),JSON.stringify(used[id]));
 }
 for(const value of ['font-pair','font-system']){
  await page.locator(`#${value}`).check();
  for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:700}]){
   await page.setViewportSize(viewport);
   for(const size of ['100%','200%']){
    await page.evaluate(s=>document.documentElement.style.fontSize=s,size);
    const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    assert(dims.scroll<=dims.client,JSON.stringify({value,viewport,size,dims}));
   }
  }
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});assert(await page.locator('#label-zh').isVisible());assert(await page.locator('#label-ko').isVisible());
 await page.locator('#font-pair').check();await page.reload({waitUntil:'load'});assert(await page.locator('#font-system').isChecked());
 for(const link of ['OFL.txt','NeoDunggeunmo-OFL.txt']){const res=await page.request.get(`${base}/assets/${link}`);assert(res.ok());assert.deepEqual(await res.body(),fs.readFileSync(path.join(tmp,'assets',link)));}
 assert(requests.every(url=>url.startsWith(base+'/')),'unexpected external request');
 const failures={};for(const [filename,family,text] of [['DotGothic16-Regular.woff2','ResearchDot','ピクセル'],['neodgm.woff2','ResearchNeo','픽셀']]){
  const failed=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});
  await failed.route('**/*',r=>!r.request().url().startsWith(base+'/')||r.request().url().endsWith('/'+filename)?r.abort():r.continue());
  await failed.goto(base+'/',{waitUntil:'load'});await failed.locator('#font-pair').check();
  await failed.evaluate(async({family,text})=>{try{await document.fonts.load(`400 32px ${family}`,text);}catch{}},{family,text});
  failures[family]=await failed.evaluate(family=>[...document.fonts].filter(f=>f.family===family).map(f=>f.status),family);
  assert.deepEqual(failures[family],['error']);assert(await failed.locator('#label-ko').isVisible());assert(await failed.locator('#label-ja').isVisible());
 }
 console.log(JSON.stringify({browser:browser.version(),javascriptDisabled:true,labelsMatchDraft:true,pinnedBrand:true,keyboardRadio:true,bothFacesLoaded:faces,platformFonts:used,bodyUnchanged:true,resetOnReload:true,noExternalRequests:true,widths:[1280,390,320],rootSizes:['100%','200%'],forcedColorsAndReducedMotion:true,blockedFontStatus:failures,scope:'Research comparison only; failure can show partial fallback, no PWA behavior, actual browser zoom, AT, human or real-device review, legibility or legal approval.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
