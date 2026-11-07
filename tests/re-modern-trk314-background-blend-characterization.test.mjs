// SPDX-License-Identifier: GPL-3.0-or-later
// Characterizes a background-blend-mode gap on the specified PWA revision.
// Passing means the gap was reproduced, NOT that the behavior is correct.
// TRK_PWA=/path/to/clean-575cb075 node tests/re-modern-trk314-background-blend-characterization.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const ref='575cb075dbaf23c7f3dac3dbd60e7353f0912184';
assert(process.env.TRK_PWA,'TRK_PWA must name a clean checkout of '+ref);
const pwa=path.resolve(process.env.TRK_PWA);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]) {
  const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-background-blend-'));
let browser;
try {
  browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
  const page=await browser.newPage({viewport:{width:200,height:100},deviceScaleFactor:1,serviceWorkers:'block'});
  await page.route('**/*',r=>r.abort());
  await page.setContent(`<!doctype html><style>
    html,body{margin:0;background:#000}
    #surface{width:200px;height:100px;background-color:rgb(150,150,150);
      background-image:linear-gradient(rgb(180,180,180),rgb(180,180,180));background-blend-mode:multiply}
    h1{color:#000;margin:0;padding:0 0 0 30px;height:100px;display:flex;align-items:flex-end;font:24px/1 sans-serif}
    </style><div id="surface"><h1>Example</h1></div>`);
  await page.addScriptTag({content:fs.readFileSync(path.join(pwa,'js/remodern-paint.js'),'utf8')});
  const observed=await page.evaluate(()=>{
    const P=window.TrkReModernPaint,s=document.querySelector('#surface'),bgs=P.effectiveBgs(document.querySelector('h1'));
    return {blend:getComputedStyle(s).backgroundBlendMode,candidates:bgs,paint:P.titlePaint({colors:{text:'#000000'}},bgs)};
  });
  assert.equal(observed.blend,'multiply');
  assert.equal(observed.paint.text,'#000000','this fixed revision accepts the black work color');
  assert.deepEqual(observed.candidates,[[150,150,150],[180,180,180]]);
  const screenshot=path.join(scratch,'fixture.png');await page.screenshot({path:screenshot,animations:'disabled'});
  const sample=spawnSync('convert',[screenshot,'-format','%[pixel:p{5,5}]','info:'],{encoding:'utf8'});
  assert.equal(sample.status,0,'ImageMagick convert required: '+(sample.error||sample.stderr));
  const match=sample.stdout.match(/s?rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  assert(match,'Could not parse pixel: '+sample.stdout);
  const pixel=match.slice(1,4).map(Number);
  assert(pixel.every(n=>n>=105&&n<=107),'unexpected rendered pixel '+pixel);
  const contrast=await page.evaluate(rgb=>window.TrkReModernPaint.ratio([0,0,0],rgb),pixel);
  assert(contrast<4.5,'rendered background must demonstrate contrast below 4.5');
  console.log(JSON.stringify({pwa:ref,browser:browser.version(),observed,renderedBackgroundPixel:pixel,contrast,scope:'Synthetic fixture only. Successful execution reproduces a gap; no claim about PWA default skins, real devices, other browsers or WCAG compliance.'},null,2));
} finally {if(browser)await browser.close();fs.rmSync(scratch,{recursive:true,force:true});}
