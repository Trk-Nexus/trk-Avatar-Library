// SPDX-License-Identifier: GPL-3.0-or-later
// Verifies the two earlier fixtures against the fixed PWA, and characterizes a remaining sampling gap.
// Requires a clean fixed PWA checkout, ImageMagick `convert`, and runnable Chromium.
// TRK_PWA=/path/to/trk314 node tests/re-modern-trk314-fix.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';

const ref='fbcb9449ef6acdf3f38050281504c0a1b671acd3';
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
  assert.equal(observed.paint.text,null,'stacked gradients must not apply the unsafe white');
  assert(observed.candidates.some(c=>c.every(n=>n>=129&&n<=131)),'composite must appear among the candidates');
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
  // More than 16 candidate colors previously disabled intermediate probes.
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
  assert.equal(many.paint.text,null,'17 candidates must include intermediate probes');
  await page.screenshot({path:screenshot,animations:'disabled'});
  const sample2=spawnSync('convert',[screenshot,'-format','%[pixel:p{5,97}]','info:'],{encoding:'utf8'});
  assert.equal(sample2.status,0,'ImageMagick convert is required: '+(sample2.error||sample2.stderr));
  const match2=sample2.stdout.match(/s?rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  assert(match2,'Could not parse pixel: '+sample2.stdout);
  const pixel2=match2.slice(1,4).map(Number);
  const ratio2=await page.evaluate(rgb=>window.TrkReModernPaint.ratio([118,118,118],rgb),pixel2);
  assert(ratio2<4.5,'Rendered intermediate background must demonstrate contrast below 4.5');
  // The fix still uses discrete 1/8 interpolated samples. This single-layer
  // synthetic gradient has a narrow luminance minimum between sampled points.
  await page.evaluate(()=>{
    const surface=document.querySelector('#surface');
    surface.style.backgroundColor='rgb(255,255,255)';
    surface.style.backgroundImage='linear-gradient(to right, rgb(66,233,235), rgb(221,5,189))';
    const h=document.querySelector('h1');h.style.color='#000';h.style.paddingLeft='164px';
  });
  const narrow=await page.evaluate(()=>{
    const P=window.TrkReModernPaint,bgs=P.effectiveBgs(document.querySelector('h1'));
    return {candidates:bgs,paint:P.titlePaint({colors:{text:'#000000'}},bgs)};
  });
  assert.equal(narrow.paint.text,'#000000','fixed version currently accepts this narrow intermediate case');
  await page.screenshot({path:screenshot,animations:'disabled'});
  const sample3=spawnSync('convert',[screenshot,'-format','%[pixel:p{164,5}]','info:'],{encoding:'utf8'});
  assert.equal(sample3.status,0,'ImageMagick convert is required: '+(sample3.error||sample3.stderr));
  const match3=sample3.stdout.match(/s?rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  assert(match3,'Could not parse pixel: '+sample3.stdout);
  const pixel3=match3.slice(1,4).map(Number);
  const ratio3=await page.evaluate(rgb=>window.TrkReModernPaint.ratio([0,0,0],rgb),pixel3);
  assert(ratio3<4.5,'intermediate browser-rendered background should be below 4.5');
  console.log(JSON.stringify({pwa:ref,browser:browser.version(),syntheticFixtures:true,
    stackedLayers:{candidates:observed.candidates,decision:observed.paint.text,renderedBackgroundPixel:pixel,contrast:actualRatio},
    seventeenCandidates:{count:many.candidates.length,decision:many.paint.text,renderedBackgroundPixel:pixel2,contrast:ratio2},
    narrowIntermediate:{candidates:narrow.candidates,decision:narrow.paint.text,renderedBackgroundPixel:pixel3,contrast:ratio3},
    scope:'Three synthetic fixtures; the third assertion characterizes a remaining gap, not a passing safety condition. No claims about PWA default screens, real devices, other browsers or WCAG compliance.'},null,2));
} finally {if(browser)await browser.close();fs.rmSync(scratch,{recursive:true,force:true});}
