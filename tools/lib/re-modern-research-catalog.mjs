// SPDX-License-Identifier: GPL-3.0-or-later
// Read the recorded research snapshot without changing the checked-out catalog.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
export function researchCatalog(root, expected) {
  const bytes=fs.readFileSync(path.join(root,'catalog/skins.json'));
  if (sha(bytes)===expected) return {bytes,source:'working catalog matches recorded SHA'};
  // The experiment used a pending working-tree palette revision. Reconstruct only
  // from its exact recorded base; never apply this historical patch to the repo.
  if (sha(bytes)!=='8f1e9fa713c1b2c62567fba074f1c3cf245eac4e02d94f6aa515c74b683727e7') throw Error('目録が研究時点の SHA または記録された基準版と一致しません');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'re-modern-catalog-'));
  try {
    fs.mkdirSync(path.join(dir,'catalog'));fs.writeFileSync(path.join(dir,'catalog/skins.json'),bytes);
    const patch=path.join(root,'docs/re-modern-research/pixel-console-catalog.patch');
    const result=spawnSync('git',['apply','--no-index',patch],{cwd:dir,encoding:'utf8'});
    if(result.error || result.status!==0) throw Error(`研究用差分の再現に失敗: ${result.error || result.stderr}`);
    const reconstructed=fs.readFileSync(path.join(dir,'catalog/skins.json'));
    if(sha(reconstructed)!==expected) throw Error('復元した研究用目録の SHA が一致しません');
    return {bytes:reconstructed,source:'recorded base plus historical patch, applied only in a temporary directory'};
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
}
