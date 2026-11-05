// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import {evaluate} from '../tools/check-pwa-skin-compat.mjs';
const baseline = {known: {'本文／地': [2, 1]}};
const report = {ok:true, problems:[], holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:2}]};
assert.deepEqual(evaluate(report, new Set(['known']), baseline), []);
assert.ok(evaluate({...report, holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:1.99}]},new Set(['known']),{known:{'本文／地':[2]}}).length);
assert.deepEqual(evaluate({...report, holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:2.1}]},new Set(['known']),{known:{'本文／地':[2]}}), []);
assert.ok(evaluate(report, new Set(['new']), baseline).length);
// Fewer failures is an improvement: a gradient stop may have disappeared and the
// PWA report does not identify which stop survived.
assert.deepEqual(evaluate({...report, holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:0.99}]},new Set(['known']),baseline), []);
assert.ok(evaluate({...report, holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:0.99},{id:'known',reason:'contrast',label:'本文／地',ratio:2}]},new Set(['known']),baseline).length);
assert.ok(evaluate({...report, holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:null}]},new Set(['known']),baseline).length);
assert.deepEqual(evaluate({...report, holdbackProblems:[]},new Set(),baseline), []);
assert.deepEqual(evaluate({...report, holdbackProblems:[{id:'known',reason:'contrast',label:'本文／地',ratio:1}]},new Set(['known']),baseline), []);
assert.ok(evaluate({...report,holdbackProblems:[...report.holdbackProblems,{id:'known',reason:'contrast',label:'新しい組'}]},new Set(['known']),baseline).length);
assert.ok(evaluate({...report,ok:false,problems:[{}]},new Set(['known']),baseline).length);
assert.ok(evaluate({...report,holdbackProblems:[{id:'known',reason:'missing',label:'本文／地'}]},new Set(['known']),baseline).length);
console.log('✅ PWA 差し戻しの回帰判定');
