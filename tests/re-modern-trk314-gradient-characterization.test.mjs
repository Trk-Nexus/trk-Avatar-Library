// SPDX-License-Identifier: GPL-3.0-or-later
// Characterizes a known gap, not a claim that the observed behavior is correct.
// Requires a clean fixed PWA checkout, ImageMagick `convert`, and runnable Chromium.
// TRK_PWA=/path/to/trk314 node tests/re-modern-trk314-gradient-characterization.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';

const ref='0a11c6e8e7c8ec8585decc532e51c92483f3945e';
assert(process.env.TRK_PWA,'TRK_PWA must name a clean checkout of '+ref);
const pwa=path.resolve(process.env.TRK_PWA);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]) {
  const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-trk314-gradient-'));
let browser;
try {
  browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
  const page=await browser.newPage({viewport:{width:240,height:120},deviceScaleFactor:1,serviceWorkers:'block'});
  await page.route('**/*',r=>r.abort());
  // Identical uniform gradients avoid any ambiguity about the sampled position.
  // This is a synthetic fixture, not an observation of PWA's default skin.
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;background:#000}
    #surface{width:200px;height:100px;background-color:#000;
      background-image:linear-gradient(rgba(255,255,255,.3),rgba(255,255,255,.3)),linear-gradient(rgba(255,255,255,.3),rgba(255,255,255,.3))}
    h1{color:#fff;margin:0;padding:0 0 0 30px;box-sizing:border-box;height:100px;display:flex;align-items:flex-end;font:24px/1 sans-serif}
    </style></head><body><div id="surface"><h1>Example</h1></div></body></html>`);
  await page.addScriptTag({content:fs.readFileSync(path.join(pwa,'js/remodern-paint.js'),'utf8')});
  const observed=await page.evaluate(()=>{
    const P=window.TrkReModernPaint, el=document.querySelector('h1'), bgs=P.effectiveBgs(el);
    return {backgroundImage:getComputedStyle(document.querySelector('#surface')).backgroundImage,candidates:bgs,paint:P.titlePaint({colors:{text:'#ffffff'}},bgs)};
  });
  assert.equal(observed.paint.text,'#ffffff','at the fixed PWA version this fixture reproduces the known false acceptance');
  const screenshot=path.join(scratch,'fixture.png');
  await page.screenshot({path:screenshot,animations:'disabled'});
  const sample=spawnSync('convert',[screenshot,'-format','%[pixel:p{5,5}]','info:'],{encoding:'utf8'});
  assert.equal(sample.status,0,'ImageMagick convert is required: '+(sample.error||sample.stderr));
  const match=sample.stdout.match(/s?rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  assert(match,'Could not parse pixel: '+sample.stdout);
  const pixel=match.slice(1,4).map(Number);
  assert(pixel.every(n=>n>=128&&n<=132),'Unexpected rendered background '+pixel);
  const actualRatio=await page.evaluate(rgb=>window.TrkReModernPaint.ratio([255,255,255],rgb),pixel);
  assert(actualRatio<4.5,'Rendered background must demonstrate contrast below 4.5');
  // More than 16 candidate colors disables intermediate probes in trk314.
  // The final stop is white; a narrow section between it and a near-black stop
  // actually contains gray, but each of the 17 candidate colors passes.
  await page.evaluate(()=>{
    const stops=Array.from({length:16},(_,i)=>`rgb(${i%4}, ${Math.floor(i/4)}, 0)`);
    stops.push('rgb(255, 255, 255)');
    document.querySelector('#surface').style.backgroundImage=`linear-gradient(to bottom, ${stops.join(', ')})`;
    document.querySelector('h1').style.color='#767676';
  });
  const many=await page.evaluate(()=>{
    const P=window.TrkReModernPaint,bgs=P.effectiveBgs(document.querySelector('h1'));
    return {candidates:bgs,paint:P.titlePaint({colors:{text:'#767676'}},bgs)};
  });
  assert.equal(many.candidates.length,17);
  assert.equal(many.paint.text,'#767676','characterize endpoint-only acceptance above 16 candidates');
  await page.screenshot({path:screenshot,animations:'disabled'});
  const sample2=spawnSync('convert',[screenshot,'-format','%[pixel:p{5,97}]','info:'],{encoding:'utf8'});
  assert.equal(sample2.status,0,'ImageMagick convert is required: '+(sample2.error||sample2.stderr));
  const match2=sample2.stdout.match(/s?rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  assert(match2,'Could not parse pixel: '+sample2.stdout);
  const pixel2=match2.slice(1,4).map(Number);
  const ratio2=await page.evaluate(rgb=>window.TrkReModernPaint.ratio([118,118,118],rgb),pixel2);
  assert(ratio2<4.5,'Rendered intermediate background must demonstrate contrast below 4.5');
  console.log(JSON.stringify({pwa:ref,browser:browser.version(),syntheticFixtures:true,
    stackedLayers:{backgroundImage:observed.backgroundImage,candidates:observed.candidates,decision:observed.paint.text,renderedBackgroundPixel:pixel,contrast:actualRatio},
    seventeenCandidates:{count:many.candidates.length,decision:many.paint.text,renderedBackgroundPixel:pixel2,contrast:ratio2},
    scope:'Two synthetic gradient fixtures. No claim about default PWA screens, real devices, other browsers, or WCAG compliance.'},null,2));
} finally {if(browser)await browser.close();fs.rmSync(scratch,{recursive:true,force:true});}
