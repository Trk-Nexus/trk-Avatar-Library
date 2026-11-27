// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * 統合ライブラリUI & trk-PWA 受け渡しハブ フロントエンドコントローラ
 *
 * - すべての DOM 構築は createElement / textContent のみで行い、innerHTML へのデータ展開を禁止（XSS 構造排除）
 * - 外部ネットワーク通信ゼロ・同一オリジン内の正本 JSON のみを参照
 */
import {
  PWA_BASELINE,
  DEFERRED_SCOPES,
  KNOWN_HOLDBACK_SKINS,
  TITLE_FONT_CANDIDATES,
  ACTIVE_PWA_CONTRACTS,
  REQUESTED_PWA_RECEIVERS,
  convertLibrarySkinToCustomSkinDef,
  exportTypographyPairing,
  inspectClientJsonPayload,
} from './pwa-bridge.js';

const INITIAL_SKIN_LIMIT = 48;
const RELEASE_BASE_URL = 'https://github.com/Trk-Nexus/trk-Avatar-Library/releases/tag/';

const state = {
  manifest: null,
  skins: [],
  skinVolumeMap: new Map(), // skinId -> { id, title }
  volumes: [],
  packs: [],
  fontPackMap: new Map(), // file -> fonts.json pack entry
  typography: null,
  locale: 'ja',
  query: '',
  activeTab: 'skins',
  skinVolumeFilter: 'all',
  skinCatFilter: 'all',
  skinCompatFilter: 'all',
  showAllSkins: false,
  packLicenseFilter: 'all',
  packTagFilter: 'all',
  packSort: 'default',
};

const $ = (id) => document.getElementById(id);

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '') node.textContent = text;
  return node;
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadJsonObject(obj, filename) {
  const text = JSON.stringify(obj, null, 2) + '\n';
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function announce(msg) {
  const live = $('hub-status-live');
  if (!live) return;
  live.hidden = false;
  live.textContent = msg;
}

function assignVolumes(skins, volumeGroups) {
  const allById = new Map(skins.map((s) => [s.id, s]));
  const seen = new Set();
  const map = new Map();
  for (const group of volumeGroups) {
    let ids = [];
    if (Array.isArray(group.ids)) {
      ids = group.ids;
    } else if (typeof group.category === 'string') {
      ids = skins.filter((s) => Array.isArray(s.cat) && s.cat.includes(group.category)).map((s) => s.id);
    } else if (group.remaining === true) {
      ids = skins.filter((s) => !seen.has(s.id)).map((s) => s.id);
    }
    for (const id of ids) {
      if (allById.has(id) && !seen.has(id)) {
        seen.add(id);
        map.set(id, { id: group.id, title: group.title });
      }
    }
  }
  return map;
}

function matchesQuery(haystackParts) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  return haystackParts.some((part) => typeof part === 'string' && part.toLowerCase().includes(q));
}

function getFilteredSkins() {
  return state.skins.filter((s) => {
    const vol = state.skinVolumeMap.get(s.id);
    if (state.skinVolumeFilter !== 'all' && (!vol || vol.id !== state.skinVolumeFilter)) return false;
    if (state.skinCatFilter !== 'all' && !(Array.isArray(s.cat) && s.cat.includes(state.skinCatFilter))) return false;
    const isHoldback = Object.prototype.hasOwnProperty.call(KNOWN_HOLDBACK_SKINS, s.id);
    if (state.skinCompatFilter === 'pwa-ready' && isHoldback) return false;
    if (state.skinCompatFilter === 'holdback' && !isHoldback) return false;
    if (state.skinCompatFilter === 'cli' && !s.cli) return false;
    if (state.skinCompatFilter === 'wizard' && !(Array.isArray(s.cat) && s.cat.includes('wizard'))) return false;

    return matchesQuery([
      s.id,
      s.label?.ja,
      s.label?.en,
      s.label?.zh,
      s.label?.ko,
      s.desc?.ja,
      s.desc?.en,
      ...(Array.isArray(s.cat) ? s.cat : []),
      vol?.title || '',
      s.readability || '',
    ]);
  });
}

function getFilteredPacks() {
  const filtered = state.packs.filter((p) => {
    const fp = state.fontPackMap.get(p.file);
    const fonts = Array.isArray(p.fonts) ? p.fonts : [];
    const licenses = fonts.map((f) => f.license);
    if (state.packLicenseFilter === 'sample' && p.folder !== 'packs') return false;
    if (
      state.packLicenseFilter !== 'all' &&
      state.packLicenseFilter !== 'sample' &&
      !licenses.some((l) => typeof l === 'string' && l.includes(state.packLicenseFilter))
    ) {
      return false;
    }
    const tags = new Set();
    for (const f of fonts) {
      if (Array.isArray(f.tags)) f.tags.forEach((t) => tags.add(t));
    }
    if (fp && Array.isArray(fp.fonts)) {
      for (const f of fp.fonts) {
        if (Array.isArray(f.tags)) f.tags.forEach((t) => tags.add(t));
      }
    }
    if (state.packTagFilter !== 'all' && !tags.has(state.packTagFilter)) return false;

    return matchesQuery([
      p.id,
      p.name,
      p.file,
      p.description,
      p.license,
      ...fonts.flatMap((f) => [f.family, f.note || '', ...(f.tags || [])]),
      ...[...tags],
    ]);
  });

  const sorted = [...filtered];
  if (state.packSort === 'size-asc') sorted.sort((a, b) => a.bytes - b.bytes);
  else if (state.packSort === 'size-desc') sorted.sort((a, b) => b.bytes - a.bytes);
  else if (state.packSort === 'cmap-desc') {
    const maxCmap = (p) => Math.max(0, ...(p.fonts || []).map((f) => f.cmap || 0));
    sorted.sort((a, b) => maxCmap(b) - maxCmap(a));
  }
  return sorted;
}

function getFilteredPairings() {
  const list = state.typography?.pairings || [];
  return list.filter((p) => {
    const slotFamilies = Object.values(p.slots || {}).flatMap((s) => [s.family, s.pack]);
    return matchesQuery([
      p.id,
      p.name,
      p.why,
      p.useFor,
      p.trkUse,
      ...(p.tags || []),
      ...slotFamilies,
    ]);
  });
}

function getFilteredReModernCount() {
  const drafts = state.manifest?.reModernStatus?.unregisteredDrafts || [];
  const matchingDrafts = drafts.filter((d) =>
    matchesQuery([d.id, d.label?.ja, d.label?.en, d.desc?.ja, d.desc?.en, 'pixel', 're-modern'])
  );
  const matchingFonts = TITLE_FONT_CANDIDATES.filter((c) =>
    matchesQuery([c.id, c.name, c.license, c.coversJa])
  );
  return matchingDrafts.length + matchingFonts.length;
}

function getFilteredPwaItems() {
  const active = ACTIVE_PWA_CONTRACTS.filter((c) =>
    matchesQuery([c.id, c.title, c.pwaModule, c.format, c.summary])
  );
  const receivers = REQUESTED_PWA_RECEIVERS.filter((r) =>
    matchesQuery([r.id, r.title, r.category, r.format, r.summary, ...(r.targetPwaModules || [])])
  );
  return { active, receivers, total: active.length + receivers.length };
}

function createSkinMiniPreview(skin) {
  const c = skin.colors || {};
  const wrap = el('div', 'skin-mini-preview');
  wrap.style.background = c.bg || '#141820';

  const stage = el('div', 'skin-mini-stage');
  stage.style.background = c.stage || '#1a202c';
  stage.style.color = c.ink || '#ffffff';
  const stageText = el('span', '', 'STAGE');
  const notesWrap = el('span', 'skin-mini-notes');
  const shapes = Array.isArray(skin.shapes) ? skin.shapes : ['circle', 'circle'];
  [c.don || '#ff4b4b', c.ka || '#4bc0ff'].forEach((col, idx) => {
    const shape = shapes[idx] || 'circle';
    const dot = el(
      'span',
      `skin-note-dot${shape === 'square' ? ' skin-note-dot--square' : shape === 'diamond' ? ' skin-note-dot--diamond' : ''}`
    );
    dot.style.background = col;
    notesWrap.appendChild(dot);
  });
  stage.append(stageText, notesWrap);

  const panel = el('div', 'skin-mini-panel');
  panel.style.background = c.panel || '#1e2633';
  panel.style.color = c.text || '#f0f4f8';
  const sampleLabel = el('span', '', skin.label?.[state.locale] || skin.label?.ja || skin.id);
  const pill = el('span', 'skin-mini-pill', 'ACT');
  pill.style.background = c.accent || '#38bdf8';
  pill.style.color = c.onAccent || '#ffffff';
  panel.append(sampleLabel, pill);

  wrap.append(stage, panel);
  return wrap;
}

function renderSkins() {
  const grid = $('skins-grid');
  const showMoreBtn = $('skins-show-more');
  const note = $('skins-showing-note');
  clearChildren(grid);

  const matched = getFilteredSkins();
  $('count-skins').textContent = String(matched.length);

  const isFiltered =
    Boolean(state.query) ||
    state.skinVolumeFilter !== 'all' ||
    state.skinCatFilter !== 'all' ||
    state.skinCompatFilter !== 'all';
  const limit = state.showAllSkins || isFiltered ? matched.length : INITIAL_SKIN_LIMIT;
  const visible = matched.slice(0, limit);

  note.textContent = `${matched.length} 種該当（表示中: ${visible.length} 種）`;

  if (visible.length === 0) {
    grid.appendChild(el('p', 'hub-card-desc', '条件に一致するスキンがありません。検索語またはフィルタを変更してください。'));
    showMoreBtn.hidden = true;
    return;
  }

  for (const skin of visible) {
    const card = el('article', 'hub-card');
    card.dataset.skinId = skin.id;
    card.appendChild(createSkinMiniPreview(skin));

    const title = el('h3', 'hub-card-title', skin.label?.[state.locale] || skin.label?.ja || skin.id);
    const idLine = el('div', 'hub-card-id', skin.id);
    const desc = el('p', 'hub-card-desc', skin.desc?.[state.locale] || skin.desc?.ja || '');

    const badges = el('div', 'hub-badges');
    const vol = state.skinVolumeMap.get(skin.id);
    if (vol) badges.appendChild(el('span', 'hub-badge', vol.title));
    if (skin.cli) badges.appendChild(el('span', 'hub-badge hub-badge--ok', '⌨ CLI対応'));
    if (skin.readability === 'intentional-low') {
      badges.appendChild(el('span', 'hub-badge hub-badge--warn', '⚠ 見づらさを意図 (intentional-low)'));
    } else if (Object.prototype.hasOwnProperty.call(KNOWN_HOLDBACK_SKINS, skin.id)) {
      badges.appendChild(el('span', 'hub-badge hub-badge--warn', `⏳ ${KNOWN_HOLDBACK_SKINS[skin.id].badgeJa}`));
    }

    const actions = el('div', 'hub-card-actions');
    const detailBtn = el('button', 'hub-btn hub-btn--primary', '詳細・PWA受け渡し');
    detailBtn.type = 'button';
    detailBtn.addEventListener('click', () => openSkinDetailDialog(skin));

    if (vol) {
      const rawLink = el('a', 'hub-btn', '1枚JSON');
      rawLink.href = `./skin-volumes/${encodeURIComponent(vol.id)}/items/${encodeURIComponent(skin.id)}.json`;
      rawLink.download = `${skin.id}.json`;
      actions.append(detailBtn, rawLink);
    } else {
      actions.appendChild(detailBtn);
    }

    card.append(title, idLine, badges, desc, actions);
    grid.appendChild(card);
  }

  if (matched.length > visible.length) {
    showMoreBtn.hidden = false;
    showMoreBtn.textContent = `残りの ${matched.length - visible.length} 種をすべて表示（全 ${matched.length} 種）`;
  } else {
    showMoreBtn.hidden = true;
  }
}

function openSkinDetailDialog(skin) {
  const dialog = $('skin-detail-dialog');
  const body = $('dialog-skin-body');
  clearChildren(body);

  $('dialog-skin-title').textContent = skin.label?.[state.locale] || skin.label?.ja || skin.id;
  $('dialog-skin-id').textContent = `ID: ${skin.id}`;

  if (skin.readability === 'intentional-low' && skin.readabilityReason) {
    const warnBox = el('div', 'hub-callout hub-callout--warn');
    const strong = el('strong', '', '⚠ 見づらさを意図した配色（readability: intentional-low）: ');
    const reasonText = el(
      'span',
      '',
      skin.readabilityReason[state.locale] || skin.readabilityReason.ja || ''
    );
    warnBox.append(strong, reasonText);
    body.appendChild(warnBox);
  } else if (Object.prototype.hasOwnProperty.call(KNOWN_HOLDBACK_SKINS, skin.id)) {
    const holdBox = el('div', 'hub-callout hub-callout--warn', KNOWN_HOLDBACK_SKINS[skin.id].noteJa);
    body.appendChild(holdBox);
  }

  body.appendChild(el('p', 'hub-card-desc', skin.desc?.[state.locale] || skin.desc?.ja || ''));

  const swatchGrid = el('div', 'swatch-grid');
  for (const [k, v] of Object.entries(skin.colors || {})) {
    const item = el('div', 'swatch-item');
    const box = el('span', 'swatch-box');
    box.style.background = v;
    const label = el('span', '', `${k}: ${v}`);
    item.append(box, label);
    swatchGrid.appendChild(item);
  }
  body.appendChild(swatchGrid);

  const converted = convertLibrarySkinToCustomSkinDef(skin, state.locale);
  const convBox = el('div', 'hub-callout');
  convBox.appendChild(
    el(
      'strong',
      '',
      '現行 trk-PWA（trk325）向けカスタムスキン変換（skin.shadow-taiko v1）:'
    )
  );
  convBox.appendChild(
    el(
      'p',
      'hub-card-desc',
      `保持される要素: ${converted.conversionReport.preservedFields.join(' ／ ')}`
    )
  );
  convBox.appendChild(
    el(
      'p',
      'hub-card-desc',
      `簡略化・自動導出される要素: ${converted.conversionReport.droppedFields.join(' ／ ')}`
    )
  );

  const btnRow = el('div', 'hub-card-actions');
  const dlCustomBtn = el('button', 'hub-btn hub-btn--primary', '📥 trk-PWA カスタムスキン (.skin.json) 書き出し');
  dlCustomBtn.type = 'button';
  dlCustomBtn.addEventListener('click', () => {
    downloadJsonObject(converted.payload, `${skin.id}.skin.json`);
    announce(`${skin.id}.skin.json を書き出しました`);
  });

  const dlRawBtn = el('button', 'hub-btn', '📥 14色 正本単体 JSON 書き出し');
  dlRawBtn.type = 'button';
  dlRawBtn.addEventListener('click', () => {
    downloadJsonObject(skin, `${skin.id}.json`);
    announce(`${skin.id}.json を書き出しました`);
  });

  const vol = state.skinVolumeMap.get(skin.id);
  btnRow.append(dlCustomBtn, dlRawBtn);
  if (vol) {
    const volLink = el('a', 'hub-btn', `📚 所属巻 (${vol.id}/skins.json)`);
    volLink.href = `./skin-volumes/${encodeURIComponent(vol.id)}/skins.json`;
    volLink.download = `${vol.id}-skins.json`;
    btnRow.appendChild(volLink);
  }
  convBox.appendChild(btnRow);
  body.appendChild(convBox);

  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function renderPacks() {
  const banner = $('packs-sets-banner');
  clearChildren(banner);
  const firstSet = state.manifest?.indices?.firstSet;
  const fontSet = state.manifest?.indices?.fontSet;
  if (firstSet && fontSet) {
    banner.appendChild(el('strong', '', '📥 まとめセット（GitHub Releases 配布・SHA-256 固定検証済み）: '));
    const p = el('p', 'hub-card-desc');
    const a1 = el('a', '', `${firstSet.title} (${firstSet.tag}, ${formatBytes(firstSet.archiveBytes)})`);
    a1.href = `${RELEASE_BASE_URL}${encodeURIComponent(firstSet.tag)}`;
    a1.target = '_blank';
    a1.rel = 'noopener noreferrer';
    const sep = document.createTextNode(' ／ ');
    const a2 = el('a', '', `${fontSet.title} (${fontSet.tag}, ${formatBytes(fontSet.archiveBytes)})`);
    a2.href = `${RELEASE_BASE_URL}${encodeURIComponent(fontSet.tag)}`;
    a2.target = '_blank';
    a2.rel = 'noopener noreferrer';
    p.append(
      a1,
      sep,
      a2,
      document.createTextNode(' — trk! の「設定 → 📦 カスタムパック」へ .stlib / .zip のままドロップして一括導入できます。')
    );
    banner.appendChild(p);
  }

  const grid = $('packs-grid');
  clearChildren(grid);
  const matched = getFilteredPacks();
  $('count-packs').textContent = String(matched.length);

  if (matched.length === 0) {
    grid.appendChild(el('p', 'hub-card-desc', '条件に一致するパックがありません。'));
    return;
  }

  for (const pack of matched) {
    const card = el('article', 'hub-card');
    const swatchBar = el('div', 'skin-mini-stage');
    swatchBar.style.background = pack.colors?.stage || '#1a202c';
    swatchBar.style.color = pack.colors?.accent || '#6ee7d8';
    swatchBar.textContent = pack.fonts?.length ? pack.fonts.map((f) => f.family).join(', ') : '見本スキンパック';

    const title = el('h3', 'hub-card-title', pack.name);
    const fileLine = el('div', 'hub-card-id', `${pack.file} (${formatBytes(pack.bytes)})`);
    const desc = el('p', 'hub-card-desc', pack.description || '');

    const badges = el('div', 'hub-badges');
    badges.appendChild(el('span', 'hub-badge', pack.license || '不明'));
    for (const f of pack.fonts || []) {
      badges.appendChild(el('span', 'hub-badge hub-badge--ok', `太さ ${f.weight} / ${f.cmap || '?'} 字`));
      for (const tag of f.tags || []) {
        badges.appendChild(el('span', 'hub-badge', `#${tag}`));
      }
    }

    const shaLine = el('div', 'hub-card-id', `SHA-256: ${String(pack.sha256).slice(0, 16)}…`);
    const actions = el('div', 'hub-card-actions');
    const copyShaBtn = el('button', 'hub-btn', 'SHA-256 をコピー');
    copyShaBtn.type = 'button';
    copyShaBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pack.sha256);
        announce(`${pack.name} の SHA-256 をコピーしました`);
      } catch {
        announce(`SHA-256: ${pack.sha256}`);
      }
    });
    actions.appendChild(copyShaBtn);

    card.append(swatchBar, title, fileLine, badges, desc, shaLine, actions);
    grid.appendChild(card);
  }
}

function renderTypography() {
  const grid = $('typography-grid');
  clearChildren(grid);
  const matched = getFilteredPairings();
  $('count-typography').textContent = String(matched.length);

  if (matched.length === 0) {
    grid.appendChild(el('p', 'hub-card-desc', '条件に一致する書体の組み合わせがありません。'));
    return;
  }

  const slotLabels = {
    display: '題字',
    heading: '見出し',
    body: '本文',
    caption: '注記',
    numeral: '数字',
    accent: '差し色',
  };

  for (const pairing of matched) {
    const card = el('article', 'hub-card');
    const title = el('h3', 'hub-card-title', pairing.name);
    const idLine = el('div', 'hub-card-id', `ID: ${pairing.id} ／ 倍率: ${pairing.scale}`);

    const badges = el('div', 'hub-badges');
    if (pairing.trkUse) {
      badges.appendChild(el('span', 'hub-badge hub-badge--ok', `🎵 ${pairing.trkUse}`));
    }
    for (const tag of pairing.tags || []) {
      badges.appendChild(el('span', 'hub-badge', `#${tag}`));
    }

    const why = el('p', 'hub-card-desc', `${pairing.why}（向く場面: ${pairing.useFor}）`);

    const table = el('table', 'typo-slots-table');
    const tbody = document.createElement('tbody');
    const reqPacks = new Set();
    for (const [slotKey, label] of Object.entries(slotLabels)) {
      const slot = pairing.slots?.[slotKey];
      if (!slot) continue;
      if (slot.pack) reqPacks.add(slot.pack.replace(/^font-packs\//, ''));
      const tr = document.createElement('tr');
      tr.append(
        el('th', '', label),
        el('td', '', `${slot.family} (${slot.weight})`)
      );
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const packsInfo = el('div', 'hub-card-id', `必要書体パック: ${[...reqPacks].join(', ')}`);

    const actions = el('div', 'hub-card-actions');
    const exportBtn = el('button', 'hub-btn hub-btn--primary', '📥 単体組 JSON 書き出し');
    exportBtn.type = 'button';
    exportBtn.addEventListener('click', () => {
      const exported = exportTypographyPairing(pairing);
      downloadJsonObject(exported, `pairing-${pairing.id}.json`);
      announce(`${pairing.name} の単体組 JSON を書き出しました`);
    });
    actions.appendChild(exportBtn);

    card.append(title, idLine, badges, why, table, packsInfo, actions);
    grid.appendChild(card);
  }
}

function renderReModern() {
  const canonicalBox = $('remodern-canonical-box');
  const draftsGrid = $('remodern-drafts-grid');
  const fontsGrid = $('remodern-title-fonts-grid');
  clearChildren(canonicalBox);
  clearChildren(draftsGrid);
  clearChildren(fontsGrid);

  const regIds = state.manifest?.reModernStatus?.registeredIds || [];
  const drafts = state.manifest?.reModernStatus?.unregisteredDrafts || [];
  $('count-remodern').textContent = String(getFilteredReModernCount());

  canonicalBox.appendChild(
    el('strong', '', `公式登録簿（catalog/re-modern/index.json）正式登録数: ${regIds.length} 件`)
  );
  canonicalBox.appendChild(
    el(
      'p',
      'hub-card-desc',
      regIds.length === 0
        ? '現在、正本に登録された正式作品はありません。trk-re-modern は機械検査の合格だけで自動昇格させず、出典・権利・可読性・安全な離脱・実機表示を人間が確認した作品のみを登録します。'
        : `登録済み ID: ${regIds.join(', ')}`
    )
  );

  for (const draft of drafts) {
    if (!matchesQuery([draft.id, draft.label?.ja, draft.label?.en, draft.desc?.ja, draft.desc?.en, 'pixel'])) {
      continue;
    }
    const card = el('article', 'hub-card');
    card.appendChild(createSkinMiniPreview(draft));
    const title = el('h3', 'hub-card-title', draft.label?.[state.locale] || draft.label?.ja || draft.id);
    const idLine = el('div', 'hub-card-id', `${draft.id} (${draft.draftPath})`);
    const badges = el('div', 'hub-badges');
    badges.appendChild(el('span', 'hub-badge hub-badge--warn', '🚧 制作案・未登録（正本外）'));
    const desc = el('p', 'hub-card-desc', draft.desc?.[state.locale] || draft.desc?.ja || '');
    const note = el('p', 'hub-card-id', draft.noteJa);
    card.append(title, idLine, badges, desc, note);
    draftsGrid.appendChild(card);
  }

  for (const cand of TITLE_FONT_CANDIDATES) {
    if (!matchesQuery([cand.id, cand.name, cand.license, cand.coversJa])) continue;
    const card = el('article', 'hub-card');
    const title = el('h3', 'hub-card-title', cand.name);
    const idLine = el('div', 'hub-card-id', `候補 ID: ${cand.id}`);
    const badges = el('div', 'hub-badges');
    if (cand.recommended) badges.appendChild(el('span', 'hub-badge hub-badge--ok', '推奨第1候補'));
    badges.appendChild(el('span', 'hub-badge', cand.license));
    const desc = el('p', 'hub-card-desc', cand.coversJa);
    const filesList = el(
      'div',
      'hub-card-id',
      cand.files
        .map((f) => `${f.name} (${formatBytes(f.bytes)}, SHA-256: ${f.sha256.slice(0, 16)}…)`)
        .join(' / ')
    );
    card.append(title, idLine, badges, desc, filesList);
    fontsGrid.appendChild(card);
  }
}

function renderPwaTab() {
  const deferredBox = $('pwa-deferred-scope');
  const activeGrid = $('pwa-active-contracts');
  const reqGrid = $('pwa-requested-receivers');
  clearChildren(deferredBox);
  clearChildren(activeGrid);
  clearChildren(reqGrid);

  const scope = DEFERRED_SCOPES[0];
  deferredBox.appendChild(el('strong', '', `📌 スコープ方針（${scope.title}）: `));
  deferredBox.appendChild(el('span', '', scope.summary));

  const { active, receivers, total } = getFilteredPwaItems();
  $('count-pwa').textContent = String(total);

  for (const c of active) {
    const card = el('article', 'hub-card');
    const badges = el('div', 'hub-badges');
    badges.appendChild(el('span', 'hub-badge hub-badge--ok', `稼働中 (${c.sinceBuild})`));
    badges.appendChild(el('span', 'hub-badge', c.id));
    const title = el('h3', 'hub-card-title', c.title);
    const mod = el('div', 'hub-card-id', `${c.pwaModule} — ${c.format}`);
    const summary = el('p', 'hub-card-desc', c.summary);
    card.append(badges, title, mod, summary);
    activeGrid.appendChild(card);
  }

  for (const r of receivers) {
    const card = el('article', 'hub-card');
    const badges = el('div', 'hub-badges');
    badges.appendChild(
      el(
        'span',
        'hub-badge hub-badge--warn',
        `要望中・優先度: ${r.priority.toUpperCase()}`
      )
    );
    badges.appendChild(el('span', 'hub-badge', r.id));
    const title = el('h3', 'hub-card-title', r.title);
    const mod = el('div', 'hub-card-id', `対象: ${r.targetPwaModules.join(', ')} ／ 形式: ${r.format}`);
    const summary = el('p', 'hub-card-desc', r.summary);
    const boundary = el('p', 'hub-card-id', `安全境界: ${r.safetyBoundary}`);
    card.append(badges, title, mod, summary, boundary);
    reqGrid.appendChild(card);
  }
}

function renderInspectorResult(report) {
  const out = $('inspector-result');
  clearChildren(out);
  const box = el('div', `hub-callout ${report.ok ? 'hub-callout--ok' : 'hub-callout--warn'}`);
  box.appendChild(el('strong', '', `${report.ok ? '✅ 検査合格' : '⚠ 不備または未対応'}: ${report.summary}`));
  box.appendChild(el('p', 'hub-card-id', `検出形式: ${report.detectedFormat}`));
  if (report.pwaSupport) {
    box.appendChild(el('p', 'hub-card-id', `trk-PWA 対応状況: ${report.pwaSupport}`));
  }
  for (const err of report.errors || []) {
    box.appendChild(el('p', '', `❌ ${err}`));
  }
  for (const warn of report.warnings || []) {
    box.appendChild(el('p', '', `⚠ ${warn}`));
  }
  out.appendChild(box);
}

function renderAll() {
  renderSkins();
  renderPacks();
  renderTypography();
  renderReModern();
  renderPwaTab();
}

function switchTab(tabKey) {
  state.activeTab = tabKey;
  const tabMap = {
    skins: ['tab-skins', 'panel-skins'],
    packs: ['tab-packs', 'panel-packs'],
    typography: ['tab-typography', 'panel-typography'],
    remodern: ['tab-remodern', 'panel-remodern'],
    pwa: ['tab-pwa', 'panel-pwa'],
  };
  for (const [key, [tId, pId]] of Object.entries(tabMap)) {
    const tab = $(tId);
    const panel = $(pId);
    const active = key === tabKey;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panel.hidden = !active;
  }
}

function setupControls() {
  // タブ切替 + 左右矢印キー操作
  const tabOrder = ['skins', 'packs', 'typography', 'remodern', 'pwa'];
  tabOrder.forEach((key, idx) => {
    const btn = $(`tab-${key}`);
    btn.addEventListener('click', () => switchTab(key));
    btn.addEventListener('keydown', (e) => {
      let nextIdx = -1;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabOrder.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabOrder.length) % tabOrder.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = tabOrder.length - 1;
      if (nextIdx >= 0) {
        e.preventDefault();
        const nextKey = tabOrder[nextIdx];
        switchTab(nextKey);
        $(`tab-${nextKey}`).focus();
      }
    });
  });

  // テーマ切替
  $('hub-theme-toggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem('trk-theme', next);
    } catch (_) {}
  });

  // 横断検索・言語
  $('hub-search').addEventListener('input', (e) => {
    state.query = e.target.value.trim();
    renderAll();
  });
  $('hub-search-clear').addEventListener('click', () => {
    $('hub-search').value = '';
    state.query = '';
    renderAll();
  });
  $('hub-locale').addEventListener('change', (e) => {
    state.locale = e.target.value;
    renderSkins();
    renderReModern();
  });

  // スキン絞り込み
  $('filter-skin-volume').addEventListener('change', (e) => {
    state.skinVolumeFilter = e.target.value;
    renderSkins();
  });
  $('filter-skin-cat').addEventListener('change', (e) => {
    state.skinCatFilter = e.target.value;
    renderSkins();
  });
  $('filter-skin-compat').addEventListener('change', (e) => {
    state.skinCompatFilter = e.target.value;
    renderSkins();
  });
  $('skins-show-more').addEventListener('click', () => {
    state.showAllSkins = true;
    renderSkins();
  });

  // パック絞り込み
  $('filter-pack-license').addEventListener('change', (e) => {
    state.packLicenseFilter = e.target.value;
    renderPacks();
  });
  $('sort-packs').addEventListener('change', (e) => {
    state.packSort = e.target.value;
    renderPacks();
  });

  // ダイアログ閉じる
  $('dialog-close-btn').addEventListener('click', () => {
    const d = $('skin-detail-dialog');
    if (typeof d.close === 'function') d.close();
    else d.removeAttribute('open');
  });

  // JSON 事前検査
  $('inspector-run').addEventListener('click', () => {
    const report = inspectClientJsonPayload($('inspector-input').value);
    renderInspectorResult(report);
  });

  $('inspector-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    $('inspector-input').value = text;
    renderInspectorResult(inspectClientJsonPayload(text));
  });

  $('sample-pack-catalog').addEventListener('click', async () => {
    const text = await (await fetch('./catalog/index.json')).text();
    $('inspector-input').value = text;
    renderInspectorResult(inspectClientJsonPayload(text));
  });
  $('sample-skin-vol').addEventListener('click', async () => {
    const text = await (await fetch('./skin-volumes/vol-07/skins.json')).text();
    $('inspector-input').value = text;
    renderInspectorResult(inspectClientJsonPayload(text));
  });
  $('sample-custom-skin').addEventListener('click', () => {
    const sampleSkin = state.skins.find((s) => s.id === 'wizard-cli') || state.skins[0];
    if (!sampleSkin) return;
    const { payload } = convertLibrarySkinToCustomSkinDef(sampleSkin, state.locale);
    const text = JSON.stringify(payload, null, 2);
    $('inspector-input').value = text;
    renderInspectorResult(inspectClientJsonPayload(text));
  });
  $('sample-title-backup').addEventListener('click', () => {
    const sampleEnvelope = {
      format: 'trk-title-font-works-backup',
      version: 1,
      state: 'ok',
      raw: JSON.stringify({
        'trk-re-modern-pixel-console': { font: 'galmuri', on: true },
      }),
    };
    const text = JSON.stringify(sampleEnvelope, null, 2);
    $('inspector-input').value = text;
    renderInspectorResult(inspectClientJsonPayload(text));
  });
}

async function init() {
  setupControls();
  const [manifest, skinsData, volumesData, indexData, fontsData, typoData] = await Promise.all([
    fetch('./catalog/library-manifest.json').then((r) => r.json()),
    fetch('./catalog/skins.json').then((r) => r.json()),
    fetch('./skin-volumes/volumes.json').then((r) => r.json()),
    fetch('./catalog/index.json').then((r) => r.json()),
    fetch('./catalog/fonts.json').then((r) => r.json()),
    fetch('./catalog/typography.json').then((r) => r.json()),
  ]);

  state.manifest = manifest;
  state.skins = skinsData.skins || [];
  state.volumes = volumesData.groups || [];
  state.skinVolumeMap = assignVolumes(state.skins, state.volumes);
  state.packs = indexData.packs || [];
  state.fontPackMap = new Map((fontsData.packs || []).map((p) => [p.file, p]));
  state.typography = typoData;

  // サマリー表示
  const s = manifest.summary;
  $('stat-skins').textContent = `${s.skinsTotal} 種 / ${s.skinVolumesTotal} 巻`;
  $('stat-packs').textContent = `${s.packsTotal} 本（書体 ${s.fontPacksTotal} 本・${s.fontWeightsTotal} ウェイト）`;
  $('stat-pairings').textContent = `${s.typographyPairingsTotal} 組・6 役`;
  $('stat-remodern').textContent = `正式登録 ${s.reModernRegisteredTotal} 件（制作案 ${s.reModernDraftsTotal} 件）`;
  $('stat-pwa-ref').textContent = `${PWA_BASELINE.build} (${PWA_BASELINE.commit.slice(0, 7)})`;

  // スキン巻セレクト初期化
  const volSelect = $('filter-skin-volume');
  for (const g of state.volumes) {
    const opt = el('option', '', g.title);
    opt.value = g.id;
    volSelect.appendChild(opt);
  }

  // スキンカテゴリセレクト初期化
  const catSet = new Set();
  for (const skin of state.skins) {
    for (const c of skin.cat || []) catSet.add(c);
  }
  const catSelect = $('filter-skin-cat');
  for (const c of [...catSet].sort()) {
    const opt = el('option', '', c);
    opt.value = c;
    catSelect.appendChild(opt);
  }

  // 書体タグチップ初期化
  const chipWrap = $('pack-tag-chips');
  const allTags = ['all', ...Object.keys(fontsData.tags || {})];
  for (const tag of allTags) {
    const chip = el('button', 'hub-chip', tag === 'all' ? 'すべてのタグ' : `#${tag}`);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(tag === 'all'));
    chip.addEventListener('click', () => {
      state.packTagFilter = tag;
      for (const child of chipWrap.querySelectorAll('.hub-chip')) {
        child.setAttribute('aria-pressed', String(child === chip));
      }
      renderPacks();
    });
    chipWrap.appendChild(chip);
  }

  renderAll();
}

init().catch((err) => {
  console.error('統合ライブラリの初期化に失敗しました:', err);
  announce('統合ライブラリの読み込みに失敗しました。');
});
