// SPDX-License-Identifier: GPL-3.0-or-later
// Avatar A1: narrow boundary checks against this fixed PWA implementation.
// Fake computed styles, not a rendering or a proof of continuous contrast.
// TRK_PWA=/path/to/clean-575cb075 node --test tests/re-modern-trk314-boundaries.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

const ref='575cb075dbaf23c7f3dac3dbd60e7353f0912184';
assert(process.env.TRK_PWA,'TRK_PWA must name a clean checkout of '+ref);
const pwa=path.resolve(process.env.TRK_PWA);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]) {
  const result=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
function node(cs={},parent=null){return {nodeType:1,parentElement:parent,cs:{backgroundColor:'rgba(0, 0, 0, 0)',backgroundImage:'none',opacity:'1',mixBlendMode:'normal',filter:'none',backdropFilter:'none',...cs}};}
const context={getComputedStyle:el=>el.cs};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(pwa,'js/remodern-paint.js'),'utf8'),context);
const P=context.TrkReModernPaint;
const plain=value=>JSON.parse(JSON.stringify(value));

test('16, 17, 64 distinct candidate states are evaluated; 65 becomes indeterminate',()=>{
  for(const count of [16,17,64,65]){
    const stops=Array.from({length:count},(_,i)=>`rgb(0, 0, ${i})`).join(', ');
    const el=node({backgroundColor:'rgb(0, 0, 0)',backgroundImage:`linear-gradient(${stops})`});
    const bgs=P.effectiveBgs(el);
    if(count===65) assert.equal(bgs,null);
    else {
      assert.equal(bgs.length,count);
      assert.equal(P.titlePaint({colors:{text:'#ffffff'}},bgs).text,'#ffffff');
    }
  }
});

test('unsupported image or effect leads to indeterminate, not skipped contrast',()=>{
  for(const style of [
    {backgroundImage:'url("example.png")'}, {backgroundImage:'image-set("example.png" 1x)'},
    {mixBlendMode:'multiply'}, {filter:'blur(2px)'}, {backdropFilter:'blur(2px)'}, {opacity:'0.5'}
  ]) {
    const bgs=P.effectiveBgs(node(style));
    assert.equal(bgs,null,JSON.stringify(style));
    assert.deepEqual(plain(P.titlePaint({colors:{text:'#ffffff'}},bgs)),{text:null,accent:null,skipped:[]});
  }
});

test('normal contrast failure is separate from indeterminate',()=>{
  const bgs=P.effectiveBgs(node({backgroundColor:'rgb(255, 255, 255)'}));
  const result=plain(P.titlePaint({colors:{text:'#ffffff',accent:'#000000'}},bgs));
  assert.deepEqual(result,{text:null,accent:'#000000',skipped:['text']});
});

test('ancestor transparency and a none image layer are interpreted in these specific synthetic values',()=>{
  const black=node({backgroundColor:'rgb(0, 0, 0)'});
  const translucent=node({backgroundColor:'rgba(255, 0, 0, 0.5)',backgroundImage:'none'},black);
  assert.deepEqual(plain(P.effectiveBgs(translucent)),[[128,0,0]]);
  const bgs=P.effectiveBgs(node({backgroundColor:'rgb(255, 255, 255)',backgroundImage:'linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255)), none'}));
  assert(bgs);assert(bgs.some(c=>c.every(n=>n===0)));
});
