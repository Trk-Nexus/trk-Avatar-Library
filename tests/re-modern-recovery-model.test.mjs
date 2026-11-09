// SPDX-License-Identifier: GPL-3.0-or-later
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {capture,makeBackup,inspectBackup,KEY,LIMIT} from '../docs/re-modern-research/trk321-handoff/recovery-model.mjs';
test('read failure, absent, empty and corrupt remain distinct without writes',()=>{
 const broken={getItem(){throw Error('denied');},setItem(){assert.fail('write');}};
 assert.equal(capture(broken).status,'unreadable');assert.equal(makeBackup(capture(broken)).status,'unavailable');
 assert.equal(capture({getItem:()=>null}).status,'absent');
 for(const raw of ['', '{bad']){const s=capture({getItem:k=>{assert.equal(k,KEY);return raw;}});assert.equal(s.raw,raw);const b=makeBackup(s);assert.equal(inspectBackup(b.text).status,'raw-invalid');assert.equal(inspectBackup(b.text).raw,raw);}
});
test('backup roundtrip preserves unknown fields, Unicode and lone surrogates; no application',()=>{
 const raw='{"future":{"text":"한字😀\\ud800"},"old":"galmuri"}\n';const b=makeBackup({status:'read',raw});assert.equal(b.status,'ready');const r=inspectBackup(b.text);assert.equal(r.status,'object-only');assert.equal(r.raw,raw);
 const lone='{"v":"'+String.fromCharCode(0xd800)+'"}';assert.equal(inspectBackup(makeBackup({status:'read',raw:lone}).text).raw,lone);
});
test('envelope and raw type validation and byte limit',()=>{
 assert.equal(inspectBackup('{}').status,'invalid');assert.equal(inspectBackup('{').status,'invalid');
 assert.equal(inspectBackup(makeBackup({status:'read',raw:'[]'}).text).status,'raw-invalid');
 assert.equal(makeBackup({status:'read',raw:'x'.repeat(LIMIT)}).status,'too-large');
 assert.equal(inspectBackup('x'.repeat(LIMIT+1)).status,'too-large');
});
