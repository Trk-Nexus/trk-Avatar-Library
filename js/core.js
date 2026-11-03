// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: コアロジック — スキンカテゴリ、ベル初期値

// スキンカテゴリ（wizard を追加）
export const SKIN_CATS = {
  basic: { ja: "ベーシック", en: "Basic" },
  light: { ja: "ライト", en: "Light" },
  grad: { ja: "グラデーション", en: "Gradient" },
  fun: { ja: "ファン", en: "Fun" },
  dark: { ja: "ダーク", en: "Dark" },
  access: { ja: "アクセシビリティ", en: "Accessibility" },
  life: { ja: "ライフ", en: "Life" },
  type: { ja: "タイポグラフィ", en: "Typography" },
  miku: { ja: "ミク", en: "Miku" },
  glitch: { ja: "グリッチ", en: "Glitch" },
  wizard: { ja: "ウィザード", en: "Wizard" },
};

// cliBell の初期値（デフォルトオフ）
export const CLI_BELL_INITIAL = false;

// CLI の5操作感デフォルト値
export const CLI_FEATURE_DEFAULTS = {
  cursor: "block",
  opacity: 1,
  history: 50,
  completion: "tab",
  bell: CLI_BELL_INITIAL,
};
