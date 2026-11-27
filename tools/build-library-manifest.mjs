#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * 統合マニフェスト（catalog/library-manifest.json）の決定論的ビルドおよび `--check` 検証。
 * 既存の正本ファイル（catalog/index.json 等）は一切書き換えず、ハッシュと件数を束ねた索引のみを生成します。
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PWA_BASELINE,
  ACTIVE_PWA_CONTRACTS,
  REQUESTED_PWA_RECEIVERS,
  validateLibraryManifest,
} from '../js/pwa-bridge.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function buildManifestObject(rootDir = ROOT) {
  const readMeta = (relPath, countFn) => {
    const abs = path.join(rootDir, relPath);
    const buf = fs.readFileSync(abs);
    const parsed = JSON.parse(buf.toString('utf8'));
    return {
      meta: {
        path: relPath,
        format: parsed.format || null,
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        bytes: buf.length,
        sha256: crypto.createHash('sha256').update(buf).digest('hex'),
        count: countFn(parsed),
      },
      parsed,
    };
  };

  const packCatalog = readMeta('catalog/index.json', (d) => d.packs.length);
  const skinsCatalog = readMeta('catalog/skins.json', (d) => d.skins.length);
  const skinVolumes = readMeta('skin-volumes/volumes.json', (d) => d.groups.length);
  const fontsCatalog = readMeta('catalog/fonts.json', (d) => d.packs.length);
  const typographyCatalog = readMeta('catalog/typography.json', (d) => d.pairings.length);
  const typographyPreview = readMeta('catalog/typography-preview.json', (d) =>
    Object.keys(d.fonts || d.samples || d).length
  );
  const reModernRegistry = readMeta('catalog/re-modern/index.json', (d) => d.ids.length);
  const firstSet = readMeta('release/first-set.json', (d) => d.files.length);
  const fontSet = readMeta('release/font-set.json', (d) => d.files.length);

  // 未登録の制作案（drafts/re-modern/*/skin.json）を正本とは明確に分離して一覧化
  const draftsRoot = path.join(rootDir, 'drafts/re-modern');
  const unregisteredDrafts = [];
  if (fs.existsSync(draftsRoot)) {
    const dirs = fs
      .readdirSync(draftsRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const dirName of dirs) {
      const skinRel = `drafts/re-modern/${dirName}/skin.json`;
      const skinAbs = path.join(rootDir, skinRel);
      if (!fs.existsSync(skinAbs)) continue;
      const skinBuf = fs.readFileSync(skinAbs);
      const skinJson = JSON.parse(skinBuf.toString('utf8'));
      unregisteredDrafts.push({
        id: skinJson.id,
        status: 'unregistered-draft',
        draftPath: skinRel,
        sha256: crypto.createHash('sha256').update(skinBuf).digest('hex'),
        label: skinJson.label,
        desc: skinJson.desc,
        colors: skinJson.colors,
        shapes: skinJson.shapes || ['circle', 'circle'],
        font: skinJson.font || '',
        noteJa:
          '正式登録前の制作案です。人間による実機・視覚レビュー完了まで正本（catalog/skins.json・catalog/re-modern/index.json）には含めません。',
      });
    }
  }

  const skins = skinsCatalog.parsed.skins;
  const wizardSkinsTotal = skins.filter((s) => Array.isArray(s.cat) && s.cat.includes('wizard')).length;
  const cliCapableSkinsTotal = skins.filter(
    (s) => Boolean(s.cli) || (Array.isArray(s.cat) && s.cat.includes('cli'))
  ).length;
  const fontWeightsTotal = fontsCatalog.parsed.fonts;

  const manifest = {
    format: 'trk-avatar-library-manifest',
    version: 1,
    pwaBaseline: PWA_BASELINE,
    summary: {
      skinsTotal: skins.length,
      skinVolumesTotal: skinVolumes.parsed.groups.length,
      wizardSkinsTotal,
      cliCapableSkinsTotal,
      packsTotal: packCatalog.parsed.packs.length,
      fontPacksTotal: fontsCatalog.parsed.packs.length,
      fontWeightsTotal,
      typographyPairingsTotal: typographyCatalog.parsed.pairings.length,
      reModernRegisteredTotal: reModernRegistry.parsed.ids.length,
      reModernDraftsTotal: unregisteredDrafts.length,
      setsTotal: 2,
      activePwaContractsTotal: ACTIVE_PWA_CONTRACTS.length,
      requestedPwaReceiversTotal: REQUESTED_PWA_RECEIVERS.length,
    },
    indices: {
      packCatalog: packCatalog.meta,
      skinsCatalog: skinsCatalog.meta,
      skinVolumes: skinVolumes.meta,
      fontsCatalog: fontsCatalog.meta,
      typographyCatalog: typographyCatalog.meta,
      typographyPreview: typographyPreview.meta,
      reModernRegistry: reModernRegistry.meta,
      firstSet: {
        ...firstSet.meta,
        tag: firstSet.parsed.tag,
        title: firstSet.parsed.title,
        archiveBytes: firstSet.parsed.bytes,
        archiveSha256: firstSet.parsed.sha256,
        filesOut: firstSet.parsed.files_out,
      },
      fontSet: {
        ...fontSet.meta,
        tag: fontSet.parsed.tag,
        title: fontSet.parsed.title,
        archiveBytes: fontSet.parsed.bytes,
        archiveSha256: fontSet.parsed.sha256,
        filesOut: fontSet.parsed.files_out,
      },
    },
    reModernStatus: {
      registeredIds: reModernRegistry.parsed.ids,
      unregisteredDrafts,
    },
    futureSlots: {
      mascot: {
        status: 'deferred-until-requested',
        formats: ['vrm', 'vrma', 'mmd'],
        count: 0,
        note: '利用者の要望が求められてから着手判断を行う方針のため、現マイルストーンでは3Dアバター要素を実装せず拡張予約枠のみ保持。',
      },
    },
  };

  const validation = validateLibraryManifest(manifest);
  if (!validation.ok) {
    throw new Error(`生成マニフェストの自己検証失敗: ${validation.errors.join('; ')}`);
  }
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes('--check');
  const outPath = path.join(ROOT, 'catalog/library-manifest.json');
  const expectedText = JSON.stringify(buildManifestObject(ROOT), null, 2) + '\n';

  if (checkOnly) {
    if (!fs.existsSync(outPath)) {
      console.error('❌ catalog/library-manifest.json が存在しません');
      process.exit(1);
    }
    const actualText = fs.readFileSync(outPath, 'utf8');
    if (actualText !== expectedText) {
      console.error('❌ catalog/library-manifest.json が最新の正本と一致しません（node tools/build-library-manifest.mjs を実行してください）');
      process.exit(1);
    }
    console.log('✅ 統合マニフェスト検査合格 (catalog/library-manifest.json)');
  } else {
    fs.writeFileSync(outPath, expectedText);
    console.log('✅ 統合マニフェスト生成完了: catalog/library-manifest.json');
  }
}
