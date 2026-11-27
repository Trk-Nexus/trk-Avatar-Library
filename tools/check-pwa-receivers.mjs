#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * trk-Avatar-Library <-> trk-PWA 受け渡し契約＆未実装受け子（R-VOL-1..R-WIZ-1）の一括検証CLI
 *
 * - ローカル正本・統合マニフェスト・変換モジュールの整合性を常時検証（必須合格）
 * - `--trk=/path/to/trk-PWA` または環境変数 `TRK_PWA` 指定時は、実物の trk-PWA ソースコードに対して
 *   (1) 稼働済み契約 7 件の回帰検査（不一致で非ゼロ終了）
 *   (2) 要望中の受け子 7 件の導入プローブ（実装されれば自動で "implemented" に昇格、未実装時は情報表示のみ）
 *   を実行します。
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PWA_BASELINE,
  ACTIVE_PWA_CONTRACTS,
  REQUESTED_PWA_RECEIVERS,
  TITLE_FONT_CANDIDATES,
  validateLibraryManifest,
  validateSkinVolumePayload,
  convertLibrarySkinToCustomSkinDef,
} from '../js/pwa-bridge.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256File(absPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
}

export function checkPwaReceivers({ rootDir = ROOT, trkPwaDir = '' } = {}) {
  const errors = [];
  const activeResults = [];
  const receiverProbes = [];

  // 1. ローカル側の正本・統合マニフェスト・変換契約チェック
  const manifestPath = path.join(rootDir, 'catalog/library-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push('catalog/library-manifest.json が存在しません');
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const res = validateLibraryManifest(manifest);
    if (!res.ok) errors.push(...res.errors);
    for (const [key, meta] of Object.entries(manifest.indices || {})) {
      const targetAbs = path.join(rootDir, meta.path);
      if (!fs.existsSync(targetAbs)) {
        errors.push(`indices.${key} の参照先が存在しません: ${meta.path}`);
      } else {
        const actualSha = sha256File(targetAbs);
        if (actualSha !== meta.sha256) {
          errors.push(`indices.${key} の SHA-256 が実ファイルと不一致です (${meta.path})`);
        }
      }
    }
  }

  const skinsCatalog = JSON.parse(fs.readFileSync(path.join(rootDir, 'catalog/skins.json'), 'utf8'));
  const volRes = validateSkinVolumePayload(skinsCatalog);
  if (!volRes.ok) errors.push(...volRes.errors);

  for (const skin of skinsCatalog.skins) {
    const { payload } = convertLibrarySkinToCustomSkinDef(skin, 'ja');
    if (payload.format !== 'skin.shadow-taiko' || payload.version !== 1) {
      errors.push(`カスタムスキン変換失敗: ${skin.id}`);
      break;
    }
  }

  // 2. trk-PWA 実ソースコードに対する契約・受け子プローブ
  const resolvedPwa = trkPwaDir && fs.existsSync(path.join(trkPwaDir, 'js/core.js')) ? trkPwaDir : '';
  if (resolvedPwa) {
    const readPwa = (rel) => fs.readFileSync(path.join(resolvedPwa, rel), 'utf8');
    const existsPwa = (rel) => fs.existsSync(path.join(resolvedPwa, rel));

    // (A) 稼働済み契約 7 件
    const packCatalogSrc = existsPwa('js/pack-catalog.js') ? readPwa('js/pack-catalog.js') : '';
    const cPackOk =
      packCatalogSrc.includes('trk-avatar-library') &&
      packCatalogSrc.includes('licenseFile') &&
      packCatalogSrc.includes('setPending') &&
      packCatalogSrc.includes('cmap');
    activeResults.push({ id: 'C-PACK-CATALOG', ok: cPackOk });
    if (!cPackOk) errors.push('trk-PWA C-PACK-CATALOG: js/pack-catalog.js の契約項目が欠落しています');

    const cSetOk = existsPwa('tools/check-set.mjs') && existsPwa('js/custom.js');
    activeResults.push({ id: 'C-SET-INSTALL', ok: cSetOk });
    if (!cSetOk) errors.push('trk-PWA C-SET-INSTALL: tools/check-set.mjs または js/custom.js が見つかりません');

    const importSkinSrc = existsPwa('tools/import-skin-catalog.mjs') ? readPwa('tools/import-skin-catalog.mjs') : '';
    const cSkinBuildOk =
      existsPwa('js/skins-volumes.js') &&
      importSkinSrc.includes('intentional-low') &&
      importSkinSrc.includes('readabilityReason');
    activeResults.push({ id: 'C-SKIN-BUILDTIME', ok: cSkinBuildOk });
    if (!cSkinBuildOk) errors.push('trk-PWA C-SKIN-BUILDTIME: intentional-low 保持契約が確認できません');

    const dataSrc = existsPwa('js/data.js') ? readPwa('js/data.js') : '';
    const coreSrc = existsPwa('js/core.js') ? readPwa('js/core.js') : '';
    const cCustomSkinOk =
      coreSrc.includes('skin.shadow-taiko') &&
      dataSrc.includes('function sanitizeSkinDef') &&
      dataSrc.includes('sanitizeCliLook');
    activeResults.push({ id: 'C-CUSTOM-SKIN', ok: cCustomSkinOk });
    if (!cCustomSkinOk) errors.push('trk-PWA C-CUSTOM-SKIN: skin.shadow-taiko / sanitizeSkinDef 契約が確認できません');

    let cTypoOk = existsPwa('js/typography.js');
    const uiPrefsSrc = existsPwa('js/ui-prefs.js') ? readPwa('js/ui-prefs.js') : '';
    if (!uiPrefsSrc.includes('trkUse')) {
      cTypoOk = false;
      errors.push('trk-PWA C-TYPOGRAPHY-SYNC: js/ui-prefs.js の trkUse 表示が確認できません');
    }
    if (existsPwa('tests/fixtures/avatar-library-typography.meta.json')) {
      const meta = JSON.parse(readPwa('tests/fixtures/avatar-library-typography.meta.json'));
      const localTypoSha = sha256File(path.join(rootDir, 'catalog/typography.json'));
      if (meta.sha256 !== localTypoSha) {
        cTypoOk = false;
        errors.push(
          `trk-PWA C-TYPOGRAPHY-SYNC: typography.json の SHA-256 が未同期です (PWA=${meta.sha256}, Library=${localTypoSha})`
        );
      }
    }
    activeResults.push({ id: 'C-TYPOGRAPHY-SYNC', ok: cTypoOk });

    const remodernWorkSrc = existsPwa('js/remodern-work.js') ? readPwa('js/remodern-work.js') : '';
    const remodernRegSrc = existsPwa('js/remodern-registry.js') ? readPwa('js/remodern-registry.js') : '';
    const cRemodernOk =
      remodernWorkSrc.includes('shadow-taiko-pack') &&
      remodernRegSrc.includes('trk-re-modern-registry');
    activeResults.push({ id: 'C-REMODERN-PACK', ok: cRemodernOk });
    if (!cRemodernOk) errors.push('trk-PWA C-REMODERN-PACK: remodern-work.js / remodern-registry.js 契約が確認できません');

    const titleFontSrc = existsPwa('js/title-font.js') ? readPwa('js/title-font.js') : '';
    let cTitleFontOk = titleFontSrc.includes('trk-title-font-works-backup');
    for (const cand of TITLE_FONT_CANDIDATES) {
      for (const f of cand.files) {
        if (!titleFontSrc.includes(f.sha256) || !titleFontSrc.includes(String(f.bytes))) {
          cTitleFontOk = false;
          errors.push(`trk-PWA C-TITLE-FONT-BASE: 題字書体 ${cand.id}/${f.key} の SHA-256 または bytes が一致しません`);
        }
      }
    }
    activeResults.push({ id: 'C-TITLE-FONT-BASE', ok: cTitleFontOk });

    // (B) 受け子 7 件のプローブ（trk326〜trk328 で 7/7 実装済・旧チェックアウト指定時は requested-pending として報告）
    const libraryReceiverSrc = existsPwa('js/library-receiver.js') ? readPwa('js/library-receiver.js') : '';
    const customSrc = existsPwa('js/custom.js') ? readPwa('js/custom.js') : '';
    const skinsVolSrc = existsPwa('js/skins-volumes.js') ? readPwa('js/skins-volumes.js') : '';
    const remodernUiSrc = existsPwa('js/remodern-ui.js') ? readPwa('js/remodern-ui.js') : '';
    const remodernRegionsSrc = existsPwa('js/remodern-regions.js') ? readPwa('js/remodern-regions.js') : '';
    const typoJsSrc = existsPwa('js/typography.js') ? readPwa('js/typography.js') : '';
    const cliJsSrc = existsPwa('js/cli.js') ? readPwa('js/cli.js') : '';

    const probeMap = {
      'R-VOL-1':
        libraryReceiverSrc.includes('trk-avatar-library-skins') ||
        customSrc.includes('trk-avatar-library-skins') ||
        skinsVolSrc.includes('trk-avatar-library-skins'),
      'R-REM-1':
        !titleFontSrc.includes('まだ画面からは使わず、適用もしない') && remodernUiSrc.includes('fontForWork'),
      'R-REM-2':
        titleFontSrc.includes('restoreWorks') || titleFontSrc.includes('importWorksBackup'),
      'R-REM-3':
        remodernRegionsSrc.includes('studyOptIn') ||
        remodernRegionsSrc.includes('defaultOptIn') ||
        remodernUiSrc.includes('regionOptIn'),
      'R-TYP-1':
        typoJsSrc.includes('trk-typography-pairing') || uiPrefsSrc.includes('trk-typography-pairing'),
      'R-SKIN-1':
        existsPwa('tools/skin-holdback.mjs') ||
        skinsCatalog.skins.some((s) => s.legacyColors) ||
        importSkinSrc.includes('legacyColors'),
      'R-WIZ-1':
        cliJsSrc.includes('trk-avatar-library-advance-prefs') ||
        packCatalogSrc.includes('trk-avatar-library-manifest'),
    };

    for (const req of REQUESTED_PWA_RECEIVERS) {
      receiverProbes.push({
        id: req.id,
        priority: req.priority,
        title: req.title,
        status: probeMap[req.id] ? 'implemented' : 'requested-pending',
      });
    }
  } else {
    for (const req of REQUESTED_PWA_RECEIVERS) {
      receiverProbes.push({
        id: req.id,
        priority: req.priority,
        title: req.title,
        status: 'skipped-no-pwa-checkout',
      });
    }
  }

  return {
    ok: errors.length === 0,
    pwaBaseline: PWA_BASELINE,
    pwaInspected: Boolean(resolvedPwa),
    activeContractsCount: ACTIVE_PWA_CONTRACTS.length,
    activeResults,
    receiverProbes,
    errors,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let trkPwaDir = process.env.TRK_PWA || '';
  let jsonOut = false;
  for (const arg of process.argv.slice(2)) {
    if (arg === '--json') jsonOut = true;
    else if (arg.startsWith('--trk=')) trkPwaDir = arg.slice('--trk='.length);
  }

  const report = checkPwaReceivers({ rootDir: ROOT, trkPwaDir });
  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    if (report.ok) {
      console.log(
        `✅ PWA 受け渡し契約検査合格（ローカル正本＋変換291種${
          report.pwaInspected ? ` ＋ trk-PWA 稼働契約 ${report.activeResults.length}/${report.activeContractsCount} 件一致` : ' ／ trk-PWA 未指定のため実機照合スキップ'
        }）`
      );
      if (report.pwaInspected) {
        const implCount = report.receiverProbes.filter((p) => p.status === 'implemented').length;
        console.log(
          `   📋 PWA 受け子プローブ: 実装済 ${implCount} 件 ／ 未実装 ${
            report.receiverProbes.length - implCount
          } 件（docs/2026-11-27-pwa-receiver-requirements.md）`
        );
      }
    } else {
      console.error('❌ PWA 受け渡し契約検査で不備が見つかりました:');
      for (const err of report.errors) console.error(`  - ${err}`);
    }
  }
  if (!report.ok) process.exitCode = 1;
}
