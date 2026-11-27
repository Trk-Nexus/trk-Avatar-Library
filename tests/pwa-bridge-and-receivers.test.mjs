// SPDX-License-Identifier: GPL-3.0-or-later
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  PWA_BASELINE,
  DEFERRED_SCOPES,
  ACTIVE_PWA_CONTRACTS,
  REQUESTED_PWA_RECEIVERS,
  validateLibraryManifest,
  validateSkinItem,
  validateSkinVolumePayload,
  convertLibrarySkinToCustomSkinDef,
  exportTypographyPairing,
  validateTypographyPairingPayload,
  validateTitleFontWorksEnvelope,
  validateAdvanceWizardExport,
  inspectClientJsonPayload,
} from '../js/pwa-bridge.js';
import { buildManifestObject } from '../tools/build-library-manifest.mjs';
import { checkPwaReceivers } from '../tools/check-pwa-receivers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

test('統合マニフェストの自己整合性・改ざん検出・3Dアバター予約枠', () => {
  const manifestOnDisk = readJson('catalog/library-manifest.json');
  const rebuilt = buildManifestObject(ROOT);
  assert.deepEqual(manifestOnDisk, rebuilt);
  assert.equal(validateLibraryManifest(manifestOnDisk).ok, true);
  assert.equal(manifestOnDisk.pwaBaseline.build, 'trk328');
  assert.equal(manifestOnDisk.pwaBaseline.commit, PWA_BASELINE.commit);
  assert.equal(manifestOnDisk.futureSlots.mascot.status, 'deferred-until-requested');
  assert.equal(manifestOnDisk.futureSlots.mascot.count, 0);
  assert.equal(DEFERRED_SCOPES[0].status, 'deferred-until-requested');

  const tampered = structuredClone(manifestOnDisk);
  tampered.indices.skinsCatalog.path = '../outside.json';
  assert.equal(validateLibraryManifest(tampered).ok, false);

  const badVer = structuredClone(manifestOnDisk);
  badVer.version = 99;
  assert.equal(validateLibraryManifest(badVer).ok, false);
});

test('全13巻の巻別スキン JSON が R-VOL-1 事前検証に合格し intentional-low 警告を保持する', () => {
  const groups = readJson('skin-volumes/volumes.json').groups;
  assert.equal(groups.length, 13);
  let total = 0;
  let sawHouseEdgeWarning = false;
  for (const g of groups) {
    const vol = readJson(`skin-volumes/${g.id}/skins.json`);
    const res = validateSkinVolumePayload(vol);
    assert.equal(res.ok, true, `${g.id}: ${res.errors.join(', ')}`);
    total += res.count;
    if (res.warnings.some((w) => w.includes('house-edge') && w.includes('intentional-low'))) {
      sawHouseEdgeWarning = true;
    }
  }
  assert.equal(total, 291);
  assert.equal(sawHouseEdgeWarning, true);

  // 重複 ID・不正 readability を拒否
  const badVol = {
    format: 'trk-avatar-library-skins',
    version: 1,
    count: 2,
    skins: [readJson('skin-volumes/vol-01/skins.json').skins[0], readJson('skin-volumes/vol-01/skins.json').skins[0]],
  };
  assert.equal(validateSkinVolumePayload(badVol).ok, false);
  assert.equal(
    validateSkinItem({
      ...readJson('skin-volumes/vol-01/skins.json').skins[0],
      readability: 'intentional-low',
    }).ok,
    false
  );
});

test('全291種・4言語のカスタムスキン変換（skin.shadow-taiko v1）と実 trk-PWA サニタイザ互換', () => {
  const skins = readJson('catalog/skins.json').skins;
  assert.equal(skins.length, 291);

  for (const lang of ['ja', 'en', 'zh', 'ko']) {
    for (const skin of skins) {
      const { payload, conversionReport } = convertLibrarySkinToCustomSkinDef(skin, lang);
      assert.equal(payload.format, 'skin.shadow-taiko');
      assert.equal(payload.version, 1);
      assert.ok(payload.name.length >= 1 && payload.name.length <= 24);
      assert.equal(payload.mascot, 'none');
      for (const k of ['bg', 'panel', 'text', 'accent', 'gold']) {
        assert.match(payload.colors[k], /^#[0-9a-f]{6}$/);
      }
      if (payload.colors.bg2) assert.match(payload.colors.bg2, /^#[0-9a-f]{6}$/);
      assert.ok(conversionReport.preservedFields.length >= 5);
      if (skin.cli) assert.ok(payload.cli, `${skin.id}: cli should be preserved`);
    }
  }

  // TRK_PWA が指定されている場合は trk-PWA 本体の sanitizeSkinDef に全291種を通して実機互換を証明
  const pwaDir = process.env.TRK_PWA;
  if (pwaDir && fs.existsSync(path.join(pwaDir, 'js/data.js'))) {
    const src = fs.readFileSync(path.join(pwaDir, 'js/data.js'), 'utf8');
    const ctx = { window: {}, console };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(src, ctx, { filename: 'data.js' });
    const sanitizeSkinDef = ctx.Trk.data.sanitizeSkinDef;
    for (const skin of skins) {
      const { payload } = convertLibrarySkinToCustomSkinDef(skin, 'ja');
      const sanitized = sanitizeSkinDef(payload);
      assert.ok(sanitized, `trk-PWA sanitizeSkinDef rejected converted skin: ${skin.id}`);
      assert.equal(sanitized.colors.bg, payload.colors.bg);
      assert.equal(sanitized.mascot, 'none');
    }
  }
});

test('書体の組み合わせ全14組の単体書き出し・検証（R-TYP-1）', () => {
  const typo = readJson('catalog/typography.json');
  assert.equal(typo.pairings.length, 14);
  for (const p of typo.pairings) {
    const exported = exportTypographyPairing(p);
    assert.equal(exported.format, 'trk-typography-pairing');
    assert.equal(exported.version, 1);
    assert.ok(exported.requiredPacks.length >= 1);
    const v = validateTypographyPairingPayload(exported);
    assert.equal(v.ok, true, `${p.id}: ${v.errors.join(', ')}`);
  }
  assert.equal(
    validateTypographyPairingPayload({
      format: 'trk-typography-pairing',
      version: 1,
      id: 'bad',
      slots: { display: { family: 'EvilFont); alert(1' } },
    }).ok,
    false
  );
});

test('題字書体・作品指定の退避封筒（trk-title-font-works-backup v1）の検証とプロトタイプ汚染防止（R-REM-2）', () => {
  const okEnvelope = {
    format: 'trk-title-font-works-backup',
    version: 1,
    state: 'ok',
    raw: JSON.stringify({
      'trk-re-modern-pixel-console': { font: 'galmuri', on: true, futureFlag: 'keep' },
      'legacy-work': 'dotneo',
      'unknown-font-work': { font: 'nonexistent', on: true },
    }),
  };
  const r1 = validateTitleFontWorksEnvelope(okEnvelope);
  assert.equal(r1.ok, true);
  assert.equal(r1.restorable, true);
  assert.deepEqual(r1.entries['trk-re-modern-pixel-console'], {
    font: 'galmuri',
    on: true,
    extraKeys: ['futureFlag'],
  });
  assert.deepEqual(r1.entries['legacy-work'], {
    font: 'dotneo',
    on: false,
    legacyString: true,
  });
  assert.equal(r1.unknownEntries, 1);

  // __proto__ キーが含まれていても汚染せずスキップする
  const protoEnv = {
    format: 'trk-title-font-works-backup',
    version: 1,
    state: 'ok',
    raw: '{"__proto__":{"polluted":true},"valid-work":"press"}',
  };
  const rProto = validateTitleFontWorksEnvelope(protoEnv);
  assert.equal(rProto.ok, true);
  assert.equal(({}).polluted, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(rProto.entries, '__proto__'), false);
  assert.equal(rProto.entries['valid-work'].font, 'press');

  // state="invalid" の緊急退避封筒は構造正常だが自動復元不可（restorable=false）
  const invalidDump = {
    format: 'trk-title-font-works-backup',
    version: 1,
    state: 'invalid',
    raw: '{"broken":',
  };
  const rInvalid = validateTitleFontWorksEnvelope(invalidDump);
  assert.equal(rInvalid.ok, true);
  assert.equal(rInvalid.restorable, false);
  assert.ok(rInvalid.warnings.length >= 1);

  // state="ok" なのに中身が壊れている封筒はエラー
  assert.equal(
    validateTitleFontWorksEnvelope({
      format: 'trk-title-font-works-backup',
      version: 1,
      state: 'ok',
      raw: '{broken',
    }).ok,
    false
  );
});

test('Advance Wizard 設定書き出しの検証と禁止文字拒否（R-WIZ-1）', () => {
  assert.equal(
    validateAdvanceWizardExport({
      format: 'trk-avatar-library-advance-prefs',
      version: 1,
      advance: { reduceMotion: true, fuzzyComplete: true },
      dictionary: ['grimoire', 'solomon'],
    }).ok,
    true
  );

  for (const forbidden of ['`cmd`', 'a\\b', '../etc', '~/home', 'C:/win']) {
    assert.equal(
      validateAdvanceWizardExport({
        format: 'trk-avatar-library-advance-prefs',
        version: 1,
        advance: { reduceMotion: true },
        dictionary: [forbidden],
      }).ok,
      false,
      `should reject ${forbidden}`
    );
  }
});

test('inspectClientJsonPayload の自動判別と checkPwaReceivers 契約検査', () => {
  assert.equal(inspectClientJsonPayload(fs.readFileSync(path.join(ROOT, 'catalog/index.json'), 'utf8')).ok, true);
  assert.equal(inspectClientJsonPayload(fs.readFileSync(path.join(ROOT, 'catalog/library-manifest.json'), 'utf8')).ok, true);
  assert.equal(inspectClientJsonPayload(fs.readFileSync(path.join(ROOT, 'catalog/re-modern/index.json'), 'utf8')).ok, true);
  assert.equal(inspectClientJsonPayload(fs.readFileSync(path.join(ROOT, 'skin-volumes/wizard/items/wizard-cli.json'), 'utf8')).ok, true);
  assert.equal(inspectClientJsonPayload(fs.readFileSync(path.join(ROOT, 'skin-volumes/vol-07/items/house-edge.json'), 'utf8')).ok, true);
  assert.equal(inspectClientJsonPayload('{invalid').ok, false);
  assert.equal(inspectClientJsonPayload('[]').ok, false);
  assert.equal(inspectClientJsonPayload('{"format":"unknown"}').ok, false);

  const localReport = checkPwaReceivers({ rootDir: ROOT, trkPwaDir: process.env.TRK_PWA || '' });
  assert.equal(localReport.ok, true, localReport.errors.join('; '));
  assert.equal(ACTIVE_PWA_CONTRACTS.length, 7);
  assert.equal(REQUESTED_PWA_RECEIVERS.length, 7);
  if (localReport.pwaInspected) {
    assert.equal(localReport.activeResults.length, 7);
    for (const r of localReport.activeResults) {
      assert.equal(r.ok, true, `active contract failed: ${r.id}`);
    }
    assert.equal(localReport.receiverProbes.length, 7);
    for (const p of localReport.receiverProbes) {
      assert.equal(p.status, 'implemented', `receiver probe regression: ${p.id} (${p.status})`);
    }
  }
});
