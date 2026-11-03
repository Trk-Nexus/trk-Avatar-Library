// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: 多言語対応 — catWizard（ウィザードカテゴリ）4 言語

export const I18N = {
  ja: {
    catWizard: "ウィザード",
    cliCursor: "カーソル形状",
    cliOpacity: "不透明度（地）",
    cliHistory: "コマンド履歴数",
    cliCompletion: "補完",
    cliBell: "ベル音",
  },
  en: {
    catWizard: "Wizard",
    cliCursor: "Cursor shape",
    cliOpacity: "Opacity (base)",
    cliHistory: "History size",
    cliCompletion: "Completion",
    cliBell: "Bell sound",
  },
  zh: {
    catWizard: "巫师",
    cliCursor: "光标形状",
    cliOpacity: "不透明度（地）",
    cliHistory: "命令历史数",
    cliCompletion: "补全",
    cliBell: "铃声",
  },
  ko: {
    catWizard: "마법사",
    cliCursor: "커서 모양",
    cliOpacity: "불투명도（지면）",
    cliHistory: "명령 기록 수",
    cliCompletion: "자동 완성",
    cliBell: "종소리",
  },
};

export function t(key, lang = "ja") {
  const dict = I18N[lang] || I18N.ja;
  return dict[key] || key;
}
