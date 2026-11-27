// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * trk-Avatar-Library <-> trk-PWA 受け渡し基盤（データ契約・変換・事前検査モジュール）
 *
 * Node.js（検証CLI・契約テスト）とブラウザ（統合ライブラリUI）の双方で外部依存なしに動作します。
 * 外部通信・任意コード実行は一切行わず、純粋な構造検証・互換変換・状態整理のみを担います。
 */

export const PWA_BASELINE = Object.freeze({
  repo: 'Trk-Nexus/trk-PWA',
  build: 'trk325',
  commit: 'e30eb2ce98490c94b7768dd2ddf768fab7fe726d',
  verifiedDate: '2026-11-27',
});

export const DEFERRED_SCOPES = Object.freeze([
  {
    id: '3d-avatars-vrm-mmd',
    title: '3Dアバター（VRM / VRMA / MMD）',
    status: 'deferred-until-requested',
    summary:
      '利用者の要望が求められてから着手判断を行う方針のため、現マイルストーンでは実装対象外。統合マニフェストに将来拡張用の予約枠（futureSlots.mascot）のみ確保し、現行のスキン・書体・re-modern・Wizard CLI に資源を集中。',
    pwaSideNote:
      'trk-PWA 側には .stpack mascot（VRM/VRMA）および別経路の MMD（IndexedDB）機構が存在するが、当倉庫では目録拡張・サンプル同梱ともに行わない。',
  },
]);

export const KNOWN_HOLDBACK_SKINS = Object.freeze({
  'gold-chip': {
    kind: 'pending-contrast',
    badgeJa: '配色調整保留（コントラスト）',
    noteJa: '金地パネル上の文字コントラスト比が基準未満のため、PWA 側の旧配色維持方針と合わせて調整案を保留中。',
  },
  orichalcum: {
    kind: 'pending-contrast',
    badgeJa: '配色調整保留（コントラスト）',
    noteJa: 'gold-chip と同系統の金地配色であり、重複解消案・旧配色切替（legacy）の合意待ち。',
  },
  'house-edge': {
    kind: 'intentional-low',
    badgeJa: '見づらさを意図した配色',
    noteJa: 'readability: "intentional-low" 明示スキン。検査を免除せず、見づらさの理由を表示した上で収録。',
  },
});

export const TITLE_FONT_CANDIDATES = Object.freeze([
  {
    id: 'galmuri',
    recommended: true,
    name: 'Galmuri11',
    license: 'SIL OFL 1.1',
    coversJa: '日・英・韓・中（簡体字の一部）を1書体でカバーする推奨候補',
    files: [
      {
        key: 'galmuri11',
        name: 'Galmuri11.woff2',
        bytes: 505400,
        sha256: '8bad9322b3340bfb5cb26cb00f4752bf4c8e7d1b526bb07205f4af458eebed31',
        family: 'TrkTitleGalmuri',
      },
    ],
  },
  {
    id: 'dotneo',
    recommended: false,
    name: 'DotGothic16 ＋ NeoDunggeunmo',
    license: 'SIL OFL 1.1 + BSD-3-Clause（Reserved Font Name あり）',
    coversJa: '和文ドット（DotGothic16）とハングル（NeoDunggeunmo）の2ファイル構成',
    files: [
      {
        key: 'dotgothic16',
        name: 'dotgothic16-japanese-400-normal.woff2',
        bytes: 396312,
        sha256: 'a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee',
        family: 'TrkTitleDot',
      },
      {
        key: 'neodunggeunmo',
        name: 'neodgm.woff2',
        bytes: 44352,
        sha256: '0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf',
        family: 'TrkTitleNeo',
      },
    ],
  },
  {
    id: 'press',
    recommended: false,
    name: 'Press Start 2P',
    license: 'SIL OFL 1.1（Reserved Font Name あり）',
    coversJa: '英数字・記号向けの8bitアーケード調（和文・韓・中はフォールバック）',
    files: [
      {
        key: 'pressstart2p',
        name: 'press-start-2p-latin-400-normal.woff2',
        bytes: 12512,
        sha256: 'afec86997fdaf54af1f59358fa2c1e2a0f1d04146edad18e5cd141d0384a7548',
        family: 'TrkTitlePress',
      },
    ],
  },
]);

export const ACTIVE_PWA_CONTRACTS = Object.freeze([
  {
    id: 'C-PACK-CATALOG',
    title: 'パック目録（catalog/index.json）の読み込みと重複防止',
    pwaModule: 'js/pack-catalog.js',
    format: 'trk-avatar-library v1',
    sinceBuild: 'trk227 / trk236',
    summary: '30本の .stpack 目録（note / cmap / weight / tags / licenseFile 含む）を読み込み、導入済みパックを自動判別。',
  },
  {
    id: 'C-SET-INSTALL',
    title: 'まとめセット（.stlib / .zip）の一括検証・導入',
    pwaModule: 'js/custom.js / tools/check-set.mjs',
    format: 'trk-pack-set v1 (check-set json v2)',
    sinceBuild: 'trk232 / trk234',
    summary: 'はじめてセット・書体セット（r10）の SHA-256 照合と setPending による重複スキップ。',
  },
  {
    id: 'C-SKIN-BUILDTIME',
    title: '全291種・13巻スキンのビルド時収録と intentional-low 明示保持',
    pwaModule: 'tools/import-skin-catalog.mjs / js/skins-volumes.js',
    format: 'trk-avatar-library-skins v1',
    sinceBuild: 'trk274 / trk293',
    summary: '291種を取り込み、house-edge の readability / readabilityReason を落とさず保持。差し戻しは既知3種に縮小。',
  },
  {
    id: 'C-CUSTOM-SKIN',
    title: '単体カスタムスキン（skin.shadow-taiko）の画面書き出し・読み込み',
    pwaModule: 'js/custom.js / js/data.js',
    format: 'skin.shadow-taiko v1',
    sinceBuild: 'trk268',
    summary: '6色＋グラデ方向＋書体種別＋cat / cli 見た目を受け入れるカスタムスキン枠（最大20件・256KiB上限）。',
  },
  {
    id: 'C-TYPOGRAPHY-SYNC',
    title: '書体の組み合わせ14組・6役のビルド時同期と trkUse 相性表示',
    pwaModule: 'tools/sync-typography-catalog.mjs / js/typography.js / js/ui-prefs.js',
    format: 'catalog/typography.json v1',
    sinceBuild: 'trk246 / trk254 / trk255',
    summary: '14組の役割別指定・字間・行間・段階設定を同期し、曲・スキン相性（trkUse）も設定画面に表示済み。',
  },
  {
    id: 'C-REMODERN-PACK',
    title: 'trk-re-modern 作品 .stpack 検証と公式登録簿照合',
    pwaModule: 'js/remodern-work.js / js/remodern-registry.js',
    format: 'shadow-taiko-pack v1 (remodern v1) + trk-re-modern-registry v1',
    sinceBuild: 'trk313 / trk317',
    summary: '256KiB上限・14色・領域指定・同梱文書（LICENSE/README .txt/.md のみ）を検査し、登録簿で公式/個人作成を区別。',
  },
  {
    id: 'C-TITLE-FONT-BASE',
    title: '題字書体3候補の SHA-256 固定導入・退避封筒・4言語対応',
    pwaModule: 'js/title-font.js / js/i18n.js',
    format: 'trk-title-font-works-backup v1',
    sinceBuild: 'trk315 .. trk325',
    summary: '利用者手元の WOFF2 を SHA-256 完全一致で導入。作品別設定の保護・退避出力・指定のみ削除・4言語文言まで稼働。',
  },
]);

export const REQUESTED_PWA_RECEIVERS = Object.freeze([
  {
    id: 'R-VOL-1',
    priority: 'high',
    category: 'skins',
    title: '巻別・単体スキン JSON（trk-avatar-library-skins v1）の画面インポート受け子',
    targetPwaModules: ['js/skins-volumes.js', 'js/custom.js'],
    format: 'trk-avatar-library-skins v1 / single skin item JSON',
    summary:
      '開発用 CLI だけでなく、PWA の設定画面から巻 JSON（または1枚 JSON）を選択して「📚 取り込んだ巻」棚へ追加・更新・削除できる受け口。',
    safetyBoundary:
      '1ファイル 1 MiB 以下・14色 CSS 値サニタイズ・readability==="intentional-low" 警告必須表示・上書き時は事前確認（スキップ/更新選択）・内蔵291種とは別領域保存。',
  },
  {
    id: 'R-REM-1',
    priority: 'high',
    category: 're-modern',
    title: 'trk-re-modern 作品ごとの題字書体 UI と表示接続（trkTitleFontWorks 実接続）',
    targetPwaModules: ['js/title-font.js', 'js/remodern-ui.js'],
    format: 'localStorage trkTitleFontWorks ({ [workId]: { font, on } })',
    summary:
      '現在「保存受け口のみ」となっている作品別題字書体指定を、作品カードの設定 UI および作品適用時の題字表示へ接続する。',
    safetyBoundary:
      '優先順位は「利用者の全体題字設定 ＞ 作品連携オン時の作品指定 ＞ 既定表示」。全体設定が未導入で失敗中でも勝手に作品指定へ乗り換えない。解除で即時復帰。',
  },
  {
    id: 'R-REM-2',
    priority: 'medium',
    category: 're-modern',
    title: '題字書体・作品指定の退避封筒（trk-title-font-works-backup v1）の復元受け子',
    targetPwaModules: ['js/title-font.js'],
    format: 'trk-title-font-works-backup v1',
    summary:
      'trk322 で実装された退避（書き出し）と対になる「退避 JSON からの復元（取り込み）」ボタンと検証ロジック。',
    safetyBoundary:
      'state==="ok" の封筒のみ復元対象とし、state==="invalid"（壊れた生データの緊急退避）の無検証書き戻しを拒否。Web Locks 直列化と現在値の事前確認を行う。',
  },
  {
    id: 'R-REM-3',
    priority: 'medium',
    category: 're-modern',
    title: '領域別スキン適用（書斎 study・基地 base）の独立オプトイン受け子',
    targetPwaModules: ['js/remodern-regions.js', 'js/remodern-ui.js'],
    format: 'remodern.regions (common / stage / study / base)',
    summary:
      '作品を選んだだけで利用者の既存の書斎テーマ（30種）やノーツ視認性設定を無断変更しないよう、領域ごとの適用オン/オフ受け口を設ける。',
    safetyBoundary:
      '既定は利用者の既存領域設定を維持。明示的に領域適用をオンにした場合のみ反映し、オフ時は元のテーマへ完全復帰する。',
  },
  {
    id: 'R-TYP-1',
    priority: 'medium',
    category: 'typography',
    title: '書体の組み合わせ単体 JSON（trk-typography-pairing v1）受け渡しと不足パック具体名案内',
    targetPwaModules: ['js/typography.js', 'js/ui-prefs.js'],
    format: 'trk-typography-pairing v1 / pairings[].packs',
    summary:
      '利用者が調整・選択した書体組み合わせ単体 JSON の画面読み込み・書き出し受け口と、未導入時に不足している具体的な .stpack 名（packs 差分）の案内表示。',
    safetyBoundary:
      '外部通信なし。許可された Trk* / システム書体名と数値範囲（倍率・字間・行間）のみ受け入れ、未導入書体は安全にフォールバック描画する。',
  },
  {
    id: 'R-SKIN-1',
    priority: 'medium',
    category: 'skins',
    title: '保留2種（gold-chip / orichalcum）および重複19種の旧配色切替（legacy）合意受け子',
    targetPwaModules: ['tools/import-skin-catalog.mjs', 'tools/check-skin-contrast.mjs'],
    format: 'trk-avatar-library-skins v1 (optional legacy colors)',
    summary:
      'コントラスト改善案を適用した際、従来の見た目を好む利用者が旧配色を選べる仕組みと、SKIN_HOLDBACK 定数の単一定義化。',
    safetyBoundary:
      '正本は合意前に無断変更しない。警告（holdback）と合格を混同せず、意図的低可読（house-edge）と未調整保留を分離して扱う。',
  },
  {
    id: 'R-WIZ-1',
    priority: 'low',
    category: 'wizard-catalog',
    title: 'Advance Wizard 設定受け渡し・統合マニフェスト（trk-avatar-library-manifest v1）参照受け子',
    targetPwaModules: ['js/cli.js', 'js/pack-catalog.js'],
    format: 'trk-avatar-library-advance-prefs v1 / trk-avatar-library-manifest v1',
    summary:
      '当倉庫の Advance Wizard 設定（補完・辞書・モーション配慮等）の任意取り込みと、統合マニフェストからの全体件数・ハッシュ確認（将来の予約枠は無視して安全動作）。',
    safetyBoundary:
      '使用禁止文字（` \\ .. ~ C:）を含む入力は即座に拒否。未知の futureSlots（3Dアバター予約枠等）は読み飛ばし、エラーにしない。',
  },
]);

const SKIN_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const HEX6_RE = /^#[0-9a-fA-F]{6}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;
const FORBIDDEN_ADVANCE_RE = /(`|\\|\.\.|~|C:)/i;
const LOCALES = ['ja', 'en', 'zh', 'ko'];
const SKIN_COLOR_KEYS = [
  'stage',
  'ink',
  'don',
  'ka',
  'text',
  'muted',
  'bg',
  'panel',
  'field',
  'button',
  'accent',
  'onAccent',
  'gold',
  'border',
];
const CANDIDATE_IDS = new Set(TITLE_FONT_CANDIDATES.map((c) => c.id));

function isPlainObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function ownEntries(obj) {
  return Object.keys(obj).map((k) => [k, obj[k]]);
}

function defineOwn(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}

function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((x) => clampByte(x).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * CSS 色表現（#rgb, #rrggbb, rgba(...), linear-gradient(...) 等）から先頭の 6桁 16進色を抽出する。
 * trk-PWA の js/data.js toHex 相当の安全なフォールバック付き。
 */
export function extractFirstHex6(value, fallback = '#141820') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (HEX6_RE.test(trimmed)) return trimmed.toLowerCase();
  const shortHex = trimmed.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
  if (shortHex) {
    return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`.toLowerCase();
  }
  const hexInStr = trimmed.match(/#([0-9a-fA-F]{6})\b/);
  if (hexInStr) return `#${hexInStr[1].toLowerCase()}`;
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgbMatch) {
    return rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
  }
  return fallback;
}

export function parseGradientStops(value) {
  if (typeof value !== 'string' || !value.includes('gradient')) return null;
  const stops = [...value.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
  if (stops.length < 2) return null;
  const degMatch = value.match(/(-?\d+(?:\.\d+)?)deg/i);
  let dir = 'down';
  if (degMatch) {
    const norm = Math.round(((Number(degMatch[1]) % 360) + 360) % 360);
    dir = { 0: 'up', 90: 'right', 180: 'down', 270: 'left' }[norm] || 'down';
  }
  return { from: stops[0], to: stops[stops.length - 1], dir, stopCount: stops.length };
}

function inferFontPreset(fontStack) {
  if (!fontStack || typeof fontStack !== 'string') return 'default';
  if (/mono|consolas|courier/i.test(fontStack)) return 'mono';
  if (/serif|mincho/i.test(fontStack) && !/sans/i.test(fontStack)) return 'serif';
  if (/maru|round/i.test(fontStack)) return 'rounded';
  return 'default';
}

/**
 * 統合マニフェスト（catalog/library-manifest.json）の検証
 */
export function validateLibraryManifest(raw) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(raw)) {
    return { ok: false, errors: ['マニフェストが JSON オブジェクトではありません'], warnings };
  }
  if (raw.format !== 'trk-avatar-library-manifest') {
    errors.push(`format が不正です: ${String(raw.format)}`);
  }
  if (raw.version !== 1) {
    errors.push(`未対応の version です: ${String(raw.version)}`);
  }
  if (!isPlainObject(raw.pwaBaseline) || typeof raw.pwaBaseline.commit !== 'string' || !SHA256_RE.test(raw.pwaBaseline.commit.padEnd(64, '0').slice(0, 64)) && !/^[0-9a-f]{40}$/.test(raw.pwaBaseline.commit)) {
    errors.push('pwaBaseline.commit（40桁コミットハッシュ）が必要です');
  }
  if (!isPlainObject(raw.indices)) {
    errors.push('indices オブジェクトが必要です');
  } else {
    const requiredKeys = [
      'packCatalog',
      'skinsCatalog',
      'skinVolumes',
      'fontsCatalog',
      'typographyCatalog',
      'typographyPreview',
      'reModernRegistry',
      'firstSet',
      'fontSet',
    ];
    for (const key of requiredKeys) {
      const entry = raw.indices[key];
      if (!isPlainObject(entry)) {
        errors.push(`indices.${key} がありません`);
        continue;
      }
      if (typeof entry.path !== 'string' || !entry.path || entry.path.includes('..')) {
        errors.push(`indices.${key}.path が不正です`);
      }
      if (typeof entry.sha256 !== 'string' || !SHA256_RE.test(entry.sha256)) {
        errors.push(`indices.${key}.sha256 が64桁の16進数ではありません`);
      }
      if (typeof entry.bytes !== 'number' || !Number.isInteger(entry.bytes) || entry.bytes < 0) {
        errors.push(`indices.${key}.bytes が不正です`);
      }
    }
  }
  if (isPlainObject(raw.futureSlots) && isPlainObject(raw.futureSlots.mascot)) {
    if (raw.futureSlots.mascot.status !== 'deferred-until-requested') {
      warnings.push(`futureSlots.mascot.status が想定外の値です: ${String(raw.futureSlots.mascot.status)}`);
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * 単体スキン元データ（catalog/skins.json 内の1要素）の検証
 */
export function validateSkinItem(skin) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(skin)) {
    return { ok: false, errors: ['スキンデータがオブジェクトではありません'], warnings };
  }
  if (typeof skin.id !== 'string' || !SKIN_ID_RE.test(skin.id)) {
    errors.push(`不正なスキン ID です: ${String(skin.id)}`);
  }
  for (const field of ['label', 'desc']) {
    if (!isPlainObject(skin[field])) {
      errors.push(`${skin.id || '?'}: ${field} オブジェクトがありません`);
    } else {
      for (const lang of LOCALES) {
        if (typeof skin[field][lang] !== 'string' || !skin[field][lang].trim()) {
          errors.push(`${skin.id || '?'}: ${field}.${lang} が空または未設定です`);
        }
      }
    }
  }
  if (!isPlainObject(skin.colors)) {
    errors.push(`${skin.id || '?'}: colors オブジェクトがありません`);
  } else {
    for (const key of SKIN_COLOR_KEYS) {
      if (typeof skin.colors[key] !== 'string' || !skin.colors[key].trim()) {
        errors.push(`${skin.id || '?'}: colors.${key} が未設定です`);
      }
    }
  }
  if (skin.readability !== undefined) {
    if (skin.readability !== 'intentional-low') {
      errors.push(`${skin.id || '?'}: 未対応の readability 値です (${String(skin.readability)})`);
    } else if (!isPlainObject(skin.readabilityReason)) {
      errors.push(`${skin.id || '?'}: readability="intentional-low" には readabilityReason が必要です`);
    } else {
      for (const lang of LOCALES) {
        if (typeof skin.readabilityReason[lang] !== 'string' || !skin.readabilityReason[lang].trim()) {
          errors.push(`${skin.id || '?'}: readabilityReason.${lang} が必要です`);
        }
      }
      warnings.push(`${skin.id}: 見づらさを意図した配色（intentional-low）として明示されています`);
    }
  } else if (skin.readabilityReason !== undefined) {
    errors.push(`${skin.id || '?'}: readability なしで readabilityReason のみ指定することはできません`);
  }
  if (skin.id && Object.prototype.hasOwnProperty.call(KNOWN_HOLDBACK_SKINS, skin.id)) {
    warnings.push(`${skin.id}: ${KNOWN_HOLDBACK_SKINS[skin.id].badgeJa}`);
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * 巻別スキン JSON（trk-avatar-library-skins v1）の検証（要項 R-VOL-1 先行実装）
 */
export function validateSkinVolumePayload(raw, { maxSkins = 500 } = {}) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(raw)) {
    return { ok: false, errors: ['巻データが JSON オブジェクトではありません'], warnings, count: 0 };
  }
  if (raw.format !== 'trk-avatar-library-skins') {
    errors.push(`format が "trk-avatar-library-skins" ではありません: ${String(raw.format)}`);
  }
  if (raw.version !== 1) {
    errors.push(`未対応の version です: ${String(raw.version)}`);
  }
  if (!Array.isArray(raw.skins)) {
    errors.push('skins 配列がありません');
    return { ok: false, errors, warnings, count: 0 };
  }
  if (raw.count !== undefined && raw.count !== raw.skins.length) {
    errors.push(`count (${String(raw.count)}) と skins.length (${raw.skins.length}) が一致しません`);
  }
  if (raw.skins.length > maxSkins) {
    errors.push(`収録スキン数 (${raw.skins.length}) が上限 (${maxSkins}) を超えています`);
  }
  const seen = new Set();
  for (const skin of raw.skins) {
    const res = validateSkinItem(skin);
    errors.push(...res.errors);
    warnings.push(...res.warnings);
    if (isPlainObject(skin) && typeof skin.id === 'string') {
      if (seen.has(skin.id)) errors.push(`重複するスキン ID が含まれています: ${skin.id}`);
      seen.add(skin.id);
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    count: raw.skins.length,
  };
}

/**
 * 倉庫の正本スキン（14色・4言語）を、現行 trk-PWA（trk325）のカスタムスキン枠で
 * 今すぐ読み込める `skin.shadow-taiko` v1 形式へ安全に変換し、保持/簡略化項目を明示する。
 */
export function convertLibrarySkinToCustomSkinDef(skin, lang = 'ja') {
  const check = validateSkinItem(skin);
  if (!check.ok) {
    throw new Error(`変換元のスキンが不正です: ${check.errors.join('; ')}`);
  }
  const chosenLang = LOCALES.includes(lang) ? lang : 'ja';
  const rawTitle = (skin.label?.[chosenLang] || skin.label?.ja || skin.label?.en || skin.id).trim();
  const name = rawTitle.slice(0, 24) || 'Custom';
  const grad = parseGradientStops(skin.colors.bg);
  const bg = grad ? grad.from : extractFirstHex6(skin.colors.bg, '#141820');
  const bg2 = grad ? grad.to : '';
  const gradDir = grad ? grad.dir : 'none';
  const panel = extractFirstHex6(skin.colors.panel, bg);
  const text = extractFirstHex6(skin.colors.text, '#f0f4f8');
  const accent = extractFirstHex6(skin.colors.accent, '#ff5a36');
  const gold = extractFirstHex6(skin.colors.gold, accent);
  const font = inferFontPreset(skin.font);
  const cats = Array.isArray(skin.cat)
    ? skin.cat.filter((c) => typeof c === 'string' && /^[a-z0-9_-]{1,32}$/i.test(c))
    : [];

  const preservedFields = ['colors.bg', 'colors.panel', 'colors.text', 'colors.accent', 'colors.gold'];
  const droppedFields = [
    'colors.stage / ink / don / ka / muted / field / button / onAccent / border（PWA側で6色から自動導出）',
    'label / desc の4言語辞書（選択言語の最大24文字名に変換）',
  ];

  if (grad) {
    preservedFields.push('colors.bg2（グラデーション終点）', `gradDir (${gradDir})`);
    if (grad.stopCount > 2) {
      droppedFields.push(`3色以上のグラデーション中間色（${grad.stopCount}色中 先頭・末尾の2色に要約）`);
    }
  }
  if (cats.length > 0) preservedFields.push(`cat (${cats.join(', ')})`);
  if (isPlainObject(skin.cli)) preservedFields.push('cli（端末カーソル・プロンプト見た目）');
  if (skin.font) {
    if (font === 'default') droppedFields.push(`font 指定 (${skin.font} → default へ要約)`);
    else preservedFields.push(`font プリセット (${font})`);
  }
  if (skin.type) droppedFields.push('type（役割別書体指定）');
  if (Array.isArray(skin.shapes)) droppedFields.push(`shapes (${skin.shapes.join('/')})`);
  if (skin.readability) {
    droppedFields.push(`readability (${skin.readability}) ※カスタムスキン形式には警告属性がないため注意`);
  }

  const payload = {
    format: 'skin.shadow-taiko',
    version: 1,
    name,
    colors: { bg, bg2, panel, text, accent, gold },
    glow: cats.includes('neon') || cats.includes('cyber'),
    scanlines: cats.includes('retro') || cats.includes('cli'),
    gradDir,
    font,
    video: 'mono',
    mascot: 'none',
  };
  if (cats.length > 0) payload.cat = cats;
  if (isPlainObject(skin.cli)) payload.cli = JSON.parse(JSON.stringify(skin.cli));

  return {
    payload,
    conversionReport: {
      sourceId: skin.id,
      targetFormat: 'skin.shadow-taiko v1',
      preservedFields,
      droppedFields,
      warnings: check.warnings,
    },
  };
}

/**
 * 題字書体・作品指定の退避封筒（trk-title-font-works-backup v1）の検証（要項 R-REM-2 先行実装）
 */
export function validateTitleFontWorksEnvelope(raw) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(raw)) {
    return { ok: false, restorable: false, errors: ['封筒データが JSON オブジェクトではありません'], warnings, entries: {} };
  }
  if (raw.format !== 'trk-title-font-works-backup') {
    errors.push(`format が "trk-title-font-works-backup" ではありません: ${String(raw.format)}`);
  }
  if (raw.version !== 1) {
    errors.push(`未対応の version です: ${String(raw.version)}`);
  }
  if (raw.state !== 'ok' && raw.state !== 'invalid') {
    errors.push(`state が不正です（"ok" または "invalid" が必要）: ${String(raw.state)}`);
  }
  if (typeof raw.raw !== 'string') {
    errors.push('raw（保存文字列）が含まれていません');
    return { ok: false, restorable: false, errors, warnings, entries: {} };
  }
  if (raw.raw.length > 256 * 1024) {
    errors.push('raw の長さが上限（256 KiB）を超えています');
    return { ok: false, restorable: false, errors, warnings, entries: {} };
  }
  if (raw.state === 'invalid') {
    warnings.push(
      'state="invalid" の緊急退避封筒です（壊れた保存値を削除前に退避したもの）。そのまま自動復元せず、手動確認が必要です。'
    );
    return {
      ok: errors.length === 0,
      restorable: false,
      errors,
      warnings,
      entries: {},
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw.raw);
  } catch {
    errors.push('state="ok" ですが raw が有効な JSON として解釈できません');
    return { ok: false, restorable: false, errors, warnings, entries: {} };
  }
  if (!isPlainObject(parsed)) {
    errors.push('raw の中身が JSON オブジェクトではありません');
    return { ok: false, restorable: false, errors, warnings, entries: {} };
  }

  const normalized = {};
  let unknownEntries = 0;
  for (const [workId, val] of ownEntries(parsed)) {
    if (!workId || workId.length > 64 || workId === '__proto__') {
      warnings.push(`無効または予約済みの作品キーをスキップします: ${String(workId).slice(0, 32)}`);
      unknownEntries++;
      continue;
    }
    if (typeof val === 'string') {
      if (CANDIDATE_IDS.has(val)) {
        defineOwn(normalized, workId, { font: val, on: false, legacyString: true });
      } else {
        warnings.push(`${workId}: 未知の題字候補 ID "${val}"（保持のみ・適用対象外）`);
        unknownEntries++;
      }
    } else if (isPlainObject(val)) {
      if (typeof val.font === 'string' && CANDIDATE_IDS.has(val.font)) {
        const extraKeys = Object.keys(val).filter((k) => k !== 'font' && k !== 'on');
        if (extraKeys.length > 0) {
          warnings.push(`${workId}: 将来拡張フィールド (${extraKeys.join(', ')}) を保持対象として検出`);
        }
        defineOwn(normalized, workId, { font: val.font, on: val.on === true, extraKeys });
      } else {
        warnings.push(`${workId}: 未知または未設定の font 値（保持のみ・適用対象外）`);
        unknownEntries++;
      }
    } else {
      warnings.push(`${workId}: 未対応の項目型です`);
      unknownEntries++;
    }
  }

  return {
    ok: errors.length === 0,
    restorable: errors.length === 0,
    errors,
    warnings,
    entries: normalized,
    unknownEntries,
  };
}

/**
 * 書体の組み合わせ単体 JSON（trk-typography-pairing v1）の生成と検証（要項 R-TYP-1 先行実装）
 */
const TYPO_SLOT_KEYS = ['display', 'heading', 'body', 'caption', 'numeral', 'accent'];

export function exportTypographyPairing(pairing) {
  if (!isPlainObject(pairing) || typeof pairing.id !== 'string' || !isPlainObject(pairing.slots)) {
    throw new Error('不正な書体組み合わせデータです');
  }
  const packs = new Set();
  for (const key of TYPO_SLOT_KEYS) {
    const slot = pairing.slots[key];
    if (isPlainObject(slot) && typeof slot.pack === 'string' && slot.pack) {
      packs.add(slot.pack);
    }
  }
  return {
    format: 'trk-typography-pairing',
    version: 1,
    id: pairing.id,
    name: String(pairing.name || pairing.id),
    scale: String(pairing.scale || '1.25'),
    trkUse: String(pairing.trkUse || ''),
    requiredPacks: [...packs].sort(),
    slots: JSON.parse(JSON.stringify(pairing.slots)),
    tracking: isPlainObject(pairing.tracking) ? JSON.parse(JSON.stringify(pairing.tracking)) : {},
    leading: isPlainObject(pairing.leading) ? JSON.parse(JSON.stringify(pairing.leading)) : {},
  };
}

export function validateTypographyPairingPayload(raw) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(raw)) {
    return { ok: false, errors: ['組み合わせデータが JSON オブジェクトではありません'], warnings };
  }
  if (raw.format !== 'trk-typography-pairing') {
    errors.push(`format が "trk-typography-pairing" ではありません: ${String(raw.format)}`);
  }
  if (raw.version !== 1) {
    errors.push(`未対応の version です: ${String(raw.version)}`);
  }
  if (typeof raw.id !== 'string' || !SKIN_ID_RE.test(raw.id)) {
    errors.push(`不正な組み合わせ ID です: ${String(raw.id)}`);
  }
  if (!isPlainObject(raw.slots)) {
    errors.push('slots オブジェクトがありません');
  } else {
    for (const key of TYPO_SLOT_KEYS) {
      const s = raw.slots[key];
      if (!isPlainObject(s) || typeof s.family !== 'string' || !/^Trk[A-Za-z0-9]+$/.test(s.family)) {
        errors.push(`slots.${key}.family が許可された Trk* 書体名ではありません`);
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Advance Wizard 設定書き出し JSON の検証（要項 R-WIZ-1 先行実装）
 */
export function validateAdvanceWizardExport(raw) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(raw)) {
    return { ok: false, errors: ['設定データが JSON オブジェクトではありません'], warnings };
  }
  if (raw.format !== 'trk-avatar-library-advance-prefs') {
    errors.push(`format が "trk-avatar-library-advance-prefs" ではありません: ${String(raw.format)}`);
  }
  if (raw.version !== 1) {
    errors.push(`未対応の version です: ${String(raw.version)}`);
  }
  if (!isPlainObject(raw.advance)) {
    errors.push('advance オブジェクトがありません');
  } else {
    for (const [k, v] of ownEntries(raw.advance)) {
      if (FORBIDDEN_ADVANCE_RE.test(k) || (typeof v === 'string' && FORBIDDEN_ADVANCE_RE.test(v))) {
        errors.push(`使用禁止文字（\` \\ .. ~ C:）が含まれています: ${k}`);
      }
      if (typeof v !== 'boolean' && typeof v !== 'string' && typeof v !== 'number') {
        errors.push(`advance.${k} の型が不正です`);
      }
    }
  }
  if (Array.isArray(raw.dictionary)) {
    if (raw.dictionary.length > 500) {
      errors.push('dictionary の件数が上限（500件）を超えています');
    }
    for (const word of raw.dictionary) {
      if (typeof word !== 'string' || word.length > 64) {
        errors.push('dictionary に不正な語が含まれています');
        break;
      }
      if (FORBIDDEN_ADVANCE_RE.test(word)) {
        errors.push(`dictionary に使用禁止文字が含まれています: ${word}`);
        break;
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * ブラウザ内・CLI 共通の JSON ペイロード自動判別＆事前検査
 */
export function inspectClientJsonPayload(input) {
  let obj = input;
  if (typeof input === 'string') {
    if (input.length > 5 * 1024 * 1024) {
      return {
        ok: false,
        detectedFormat: 'too-large',
        summary: 'ファイルサイズが検査上限（5 MiB）を超えています',
        errors: ['5 MiB 以下の JSON を指定してください'],
        warnings: [],
      };
    }
    try {
      obj = JSON.parse(input);
    } catch (e) {
      return {
        ok: false,
        detectedFormat: 'invalid-json',
        summary: 'JSON として読み取れません',
        errors: [`JSON 構文エラー: ${e.message}`],
        warnings: [],
      };
    }
  }
  if (!isPlainObject(obj)) {
    return {
      ok: false,
      detectedFormat: 'non-object',
      summary: 'ルート要素が JSON オブジェクトではありません',
      errors: ['オブジェクト形式 `{ ... }` の JSON を指定してください'],
      warnings: [],
    };
  }

  switch (obj.format) {
    case 'trk-avatar-library-manifest': {
      const r = validateLibraryManifest(obj);
      return {
        ok: r.ok,
        detectedFormat: 'trk-avatar-library-manifest v1（統合マニフェスト）',
        pwaSupport: 'R-WIZ-1（統合参照受け子・提案中）',
        summary: r.ok
          ? `統合マニフェスト検証合格（基準 PWA: ${obj.pwaBaseline?.build || '不明'}）`
          : '統合マニフェストに不備があります',
        errors: r.errors,
        warnings: r.warnings,
      };
    }
    case 'trk-avatar-library': {
      const packs = Array.isArray(obj.packs) ? obj.packs : null;
      const errors = [];
      if (obj.version !== 1) errors.push(`未対応の version です: ${String(obj.version)}`);
      if (!packs) errors.push('packs 配列がありません');
      return {
        ok: errors.length === 0,
        detectedFormat: 'trk-avatar-library v1（パック目録 index.json）',
        pwaSupport: 'C-PACK-CATALOG（現行 trk325 でそのまま利用可能）',
        summary:
          errors.length === 0
            ? `パック目録検証合格（収録パック ${packs.length} 本）`
            : 'パック目録に不備があります',
        errors,
        warnings: [],
      };
    }
    case 'trk-avatar-library-skins': {
      const r = validateSkinVolumePayload(obj);
      return {
        ok: r.ok,
        detectedFormat: 'trk-avatar-library-skins v1（巻別・一括スキン目録）',
        pwaSupport: 'ビルド時取込は稼働中 ／ 画面直接インポートは要項 R-VOL-1 提案中',
        summary: r.ok
          ? `スキン巻データ検証合格（${r.count} 種収録）`
          : `スキン巻データに ${r.errors.length} 件の不備があります`,
        errors: r.errors,
        warnings: r.warnings,
      };
    }
    case 'skin.shadow-taiko': {
      const errors = [];
      const warnings = [];
      if (obj.version !== 1) errors.push(`未対応の version です: ${String(obj.version)}`);
      if (!isPlainObject(obj.colors)) {
        errors.push('colors オブジェクトがありません');
      } else {
        for (const k of ['bg', 'panel', 'text', 'accent', 'gold']) {
          if (typeof obj.colors[k] !== 'string' || !HEX6_RE.test(obj.colors[k])) {
            errors.push(`colors.${k} が #rrggbb 形式ではありません`);
          }
        }
        if (obj.colors.bg2 && !HEX6_RE.test(obj.colors.bg2)) {
          errors.push('colors.bg2 は空文字または #rrggbb 形式である必要があります');
        }
      }
      if (typeof obj.name !== 'string' || !obj.name.trim()) {
        warnings.push('name が空のため PWA 側で "Custom" に置換されます');
      }
      return {
        ok: errors.length === 0,
        detectedFormat: 'skin.shadow-taiko v1（trk-PWA 単体カスタムスキン）',
        pwaSupport: 'C-CUSTOM-SKIN（現行 trk325 の「スキン作成・読み込み」でそのまま利用可能）',
        summary:
          errors.length === 0
            ? `カスタムスキン検証合格（「${String(obj.name || 'Custom').slice(0, 24)}」）`
            : 'カスタムスキン形式に不備があります',
        errors,
        warnings,
      };
    }
    case 'trk-re-modern-registry': {
      const errors = [];
      if (obj.version !== 1) errors.push(`未対応の version です: ${String(obj.version)}`);
      if (!Array.isArray(obj.ids)) errors.push('ids 配列がありません');
      else {
        for (const id of obj.ids) {
          if (typeof id !== 'string' || !id.startsWith('trk-re-modern-')) {
            errors.push(`不正な登録 ID です: ${String(id)}`);
          }
        }
      }
      return {
        ok: errors.length === 0,
        detectedFormat: 'trk-re-modern-registry v1（re-modern 公式登録簿）',
        pwaSupport: 'C-REMODERN-PACK（現行 trk325 の remodern-registry.js で照合対応済み）',
        summary:
          errors.length === 0
            ? `登録簿検証合格（正式登録 ${obj.ids.length} 件）`
            : '登録簿形式に不備があります',
        errors,
        warnings: [],
      };
    }
    case 'trk-title-font-works-backup': {
      const r = validateTitleFontWorksEnvelope(obj);
      return {
        ok: r.ok,
        detectedFormat: 'trk-title-font-works-backup v1（題字書体・作品指定の退避封筒）',
        pwaSupport: '退避出力は trk322 実装済み ／ 復元取り込みは要項 R-REM-2 提案中',
        summary: r.ok
          ? r.restorable
            ? `退避封筒検証合格（復元可能な作品設定 ${Object.keys(r.entries).length} 件）`
            : '退避封筒の構造は正常ですが state="invalid" の緊急退避データです'
          : '退避封筒に不備があります',
        errors: r.errors,
        warnings: r.warnings,
      };
    }
    case 'trk-typography-pairing': {
      const r = validateTypographyPairingPayload(obj);
      return {
        ok: r.ok,
        detectedFormat: 'trk-typography-pairing v1（書体の組み合わせ単体指定）',
        pwaSupport: 'R-TYP-1（単体組 JSON 読み込み受け子・提案中）',
        summary: r.ok
          ? `書体組み合わせ検証合格（「${String(obj.name || obj.id)}」）`
          : '書体組み合わせ指定に不備があります',
        errors: r.errors,
        warnings: r.warnings,
      };
    }
    case 'trk-avatar-library-advance-prefs': {
      const r = validateAdvanceWizardExport(obj);
      return {
        ok: r.ok,
        detectedFormat: 'trk-avatar-library-advance-prefs v1（Advance Wizard 設定書き出し）',
        pwaSupport: 'R-WIZ-1（任意設定取り込み受け子・提案中）',
        summary: r.ok ? 'Advance Wizard 設定検証合格' : 'Advance Wizard 設定に不備があります',
        errors: r.errors,
        warnings: r.warnings,
      };
    }
    default: {
      if (typeof obj.id === 'string' && isPlainObject(obj.colors) && isPlainObject(obj.label)) {
        const r = validateSkinItem(obj);
        return {
          ok: r.ok,
          detectedFormat: '単体スキン元データ JSON（skin-volumes/*/items/*.json）',
          pwaSupport: 'R-VOL-1 提案中（統合ライブラリUIで skin.shadow-taiko へ変換すれば今すぐ利用可能）',
          summary: r.ok
            ? `単体スキン元データ検証合格（ID: ${obj.id}）`
            : `単体スキン元データに ${r.errors.length} 件の不備があります`,
          errors: r.errors,
          warnings: r.warnings,
        };
      }
      return {
        ok: false,
        detectedFormat: obj.format ? `未対応 format: ${String(obj.format)}` : 'format 未指定の JSON',
        pwaSupport: '不明',
        summary: '既知の受け渡し JSON 形式と一致しませんでした',
        errors: [
          '対応形式: trk-avatar-library, trk-avatar-library-skins, skin.shadow-taiko, trk-re-modern-registry, trk-title-font-works-backup, trk-avatar-library-advance-prefs, trk-avatar-library-manifest, または単体スキン JSON',
        ],
        warnings: [],
      };
    }
  }
}
