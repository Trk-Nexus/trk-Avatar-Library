// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: ターミナル定番コマンド実装 + 5 つの cli 操作感
//
// コマンド:
//   pwd / ls(=list/dir) / cd(=skin) / cat <#|曲名> / grep <語句> /
//   man(=help) / history / clear / echo / bell on|off
//   `;` と `|` でつなぐ
//
// セキュリティ: 生のパス（/、..、~、C:）は受け付けない
// bell の音は AudioContext で生成（外部ファイル不要）
// opacity は地（::before）に適用。文字は透けさせない。

import { sanitizeCliLook, cliLookVars, CLI_CURSOR_SHAPE } from "./data.js";

// 5 操作感のデフォルト値
export const CLI_DEFAULTS = {
  cursor: "block",
  opacity: 1,
  history: 50,
  completion: "tab",
  bell: true,
};

// wizard 辞書・設定の localStorage キー
export const WIZARD_STORAGE_KEY = "trk-wizard-data";

// wizard データの初期値
export const WIZARD_DEFAULTS = {
  dictionary: {},
  settings: {
    theme: "dark",
    fontSize: "medium",
    scanLine: 0.15,
    bell: true,
  },
};

// wizard データを localStorage から読み込み
export function loadWizardData() {
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return { ...WIZARD_DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      dictionary: parsed.dictionary || {},
      settings: { ...WIZARD_DEFAULTS.settings, ...(parsed.settings || {}) },
    };
  } catch (e) {
    return { ...WIZARD_DEFAULTS };
  }
}

// wizard データを localStorage に保存
export function saveWizardData(data) {
  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage 使用不可時は無視
  }
}

// コマンド履歴
export class CliHistory {
  constructor(max = 50) {
    this.max = max;
    this.entries = [];
    this.pointer = this.entries.length;
  }
  add(cmd) {
    if (!cmd || !cmd.trim()) return;
    this.entries.push(cmd.trim());
    if (this.entries.length > this.max) this.entries.shift();
    this.pointer = this.entries.length;
  }
  list() {
    return [...this.entries];
  }
  prev() {
    if (this.pointer > 0) this.pointer--;
    return this.entries[this.pointer] || "";
  }
  next() {
    if (this.pointer < this.entries.length - 1) this.pointer++;
    return this.entries[this.pointer] || "";
  }
}

// bell 音を AudioContext で生成
export class CliBell {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.ctx = null;
  }
  ensureCtx() {
    if (!this.ctx && typeof AudioContext !== "undefined") {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }
  ring() {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// 生パスの使用禁止チェック（/、..、~、C:）
export function isForbiddenPath(input) {
  if (typeof input !== "string") return false;
  return /\.\./.test(input) || /~/.test(input) || /^[Cc]:/.test(input) || /^\//.test(input);
}

// コマンドを ; と | で分割
export function splitCommands(input) {
  if (!input) return [];
  // ; で区切る（パイプより優先度低）
  const parts = input.split(";").map((s) => s.trim()).filter(Boolean);
  return parts.map((p) => {
    const pipes = p.split("|").map((s) => s.trim()).filter(Boolean);
    return { raw: p, pipes };
  });
}

// 定番コマンドのハンドラ群
export class CliCommands {
  constructor(skinManager) {
    this.skinManager = skinManager;
    this.history = new CliHistory(CLI_DEFAULTS.history);
    this.bell = new CliBell(CLI_DEFAULTS.bell);
    this.wizardData = loadWizardData();
  }

  setHistoryMax(n) {
    this.history.max = n;
  }
  setBellEnabled(v) {
    this.bell.enabled = v;
  }

  // コマンドを実行
  async run(input) {
    this.bell.ring();
    this.history.add(input);
    const segments = splitCommands(input);
    const outputs = [];
    for (const seg of segments) {
      if (seg.pipes.length === 1) {
        const out = await this.runOne(seg.pipes[0]);
        if (out !== undefined) outputs.push(out);
      } else {
        // パイプ: 前の出力を次のコマンドの stdin として渡す
        let prev = "";
        for (let i = 0; i < seg.pipes.length; i++) {
          const out = await this.runOne(seg.pipes[i], i > 0 ? prev : undefined);
          prev = out !== undefined ? String(out) : "";
          if (i === seg.pipes.length - 1 && out !== undefined) outputs.push(out);
        }
      }
    }
    return outputs.join("\n");
  }

  async runOne(cmd, stdin) {
    const [name, ...rest] = cmd.split(/\s+/).filter(Boolean);
    if (!name) return "";
    const args = rest.join(" ");

    switch (name.toLowerCase()) {
      case "pwd":
        return this.cmdPwd();
      case "ls":
      case "list":
      case "dir":
        return this.cmdLs(args);
      case "cd":
      case "skin":
        return this.cmdCd(args);
      case "cat":
        return this.cmdCat(args);
      case "grep":
        return this.cmdGrep(args, stdin);
      case "man":
      case "help":
        return this.cmdMan(args);
      case "history":
        return this.cmdHistory(args);
      case "clear":
        return this.cmdClear();
      case "echo":
        return args;
      case "bell":
        return this.cmdBell(args);
      case "wizard":
        return this.cmdWizard(args);
      default:
        return `コマンドが見つかりません: ${name}`;
    }
  }

  cmdPwd() {
    return "/trk";
  }

  cmdLs(args) {
    if (isForbiddenPath(args)) {
      return "エラー: 生のパスは受け付けません";
    }
    return "skins  wizard  cli  catalog  tools  tests";
  }

  async cmdCd(args) {
    if (isForbiddenPath(args)) {
      return "エラー: 生のパスは受け付けません";
    }
    if (!args) return "使用方法: cd <skin-id>";
    if (this.skinManager && typeof this.skinManager.applySkin === "function") {
      try {
        await this.skinManager.applySkin(args);
        return `スキンを適用しました: ${args}`;
      } catch (e) {
        return `スキンが見つかりません: ${args}`;
      }
    }
    return `スキン: ${args}`;
  }

  cmdCat(args) {
    if (isForbiddenPath(args)) {
      return "エラー: 生のパスは受け付けません";
    }
    if (!args) return "使用方法: cat <#|曲名>";
    return `cat: ${args}`;
  }

  cmdGrep(args, stdin) {
    if (!args) return "使用方法: grep <語句>";
    const source = stdin !== undefined ? stdin : "";
    const lines = source.split("\n").filter((l) => l.includes(args));
    return lines.length > 0 ? lines.join("\n") : "(一致なし)";
  }

  cmdMan(args = "") {
    const lower = args.trim().toLowerCase();
    if (lower === "-wizard" || lower === "--wizard") {
      return this.cmdWizardHelp();
    }
    if (lower === "--tutorial") {
      return this.cmdTutorial();
    }
    return `trk CLI 定番コマンド:
  pwd        カレントパスを表示
  ls / list / dir  ファイル一覧
  cd / skin  スキンを適用
  cat <#>    曲情報を表示
  grep <語句>  テキストを検索
  man / help  このヘルプを表示
  help -wizard  wizard機能一覧を表示
  help --tutorial  初心者向けチュートリアルを表示
  history    コマンド履歴
  clear      画面をクリア
  echo <text>  テキストを表示
  bell on|off  ベル音を切替
  wizard     wizard辞書・設定を管理
  ;  |        コマンドをつなぐ`;
  }

  cmdWizardHelp() {
    return `wizard機能一覧（Special UX Experiences）:

  wizard            現在のwizard設定と辞書を表示
  wizard <単語> rec  単語をwizard辞書に登録
  wizard rec <単語>  単語をwizard辞書に登録（同上）
  wizard dict        登録済み辞書一覧を表示
  wizard export      設定をJSON形式でエクスポート
  wizard import      エクスポート済み設定をインポート
  wizard reset       辞書と設定をリセット

  特殊体験スキン:
  wizard-aura-caster     マウス追従オーラ＋グラデーションアニメーション
  wizard-glitch-sorcerer  グリッチ・色ずれ・走査線エフェクト
  wizard-crystal-gazer   ガラスモーフィズム＋backdrop-filterぼかし
  wizard-void-walker     発光テキスト＋星屑ドリフトエフェクト
  wizard-view-transition-master  View Transitions API スムーズ遷移
  wizard-anchor-positioner  Anchor Positioning アンカー固定
  wizard-scroll-driven-visionary  Scroll-driven Animations スクロール連動
  wizard-container-query-responder  Container Queries コンテナ連動レイアウト
  wizard-reduce-motion-accessor  prefers-reduced-motion モーション制御
  wizard-focus-ring-navigator  :focus-visible キーボード完全操作`;
  }

  cmdTutorial() {
    return `🎓 trk Wizard チュートリアル—最初の体験:

1. スキンを変更してみる
   cd wizard-cli        黒端末ウィザードCLIを適用
   cd wizard-aura-caster オーラキャスター（発光オーラ体験）

2. 辞書に単語を登録する
   wizard 魔導書 rec    「魔導書」を辞書登録
   wizard rec 呪文      「呪文」を辞書登録（別形式）
   wizard dict          登録済み一覧を表示

3. 設定をエクスポートして持ち運ぶ
   wizard export        現在の設定をJSONで出力
   （出力内容をコピーし、別環境で wizard import で復元）

4. キーボードショートカット
   Ctrl+K / Cmd+K  設定パネルを開閉
   Esc             パネル・ポップオーバーを閉じる
   ?               ショートカットヘルプを表示
   ↓ / ↑           スキン一覧をナビゲート
   Enter / Space   スキンを適用

まずは「cd wizard-aura-caster」でオーラキャスターを試してみてください！`;
  }

  cmdWizard(args = "") {
    const parts = args.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      // 引数なし: 現在の設定と辞書数を表示
      const dictCount = Object.keys(this.wizardData.dictionary).length;
      return `wizard設定:
  テーマ: ${this.wizardData.settings.theme}
  フォントサイズ: ${this.wizardData.settings.fontSize}
  スキャンライン: ${this.wizardData.settings.scanLine}
  ベル音: ${this.wizardData.settings.bell ? "on" : "off"}
  辞書登録数: ${dictCount} 語

  使用方法:
  wizard <単語> rec    単語を辞書登録
  wizard rec <単語>    同上（別形式）
  wizard dict          辞書一覧表示
  wizard export        設定をエクスポート
  wizard import        設定をインポート
  wizard reset         リセット`;
    }

    const first = parts[0].toLowerCase();

    // wizard export / import / reset / dict
    if (first === "export") {
      const json = JSON.stringify(this.wizardData, null, 2);
      return `wizard設定エクスポート:\n${json}`;
    }
    if (first === "import") {
      // import の引数はスペースを含むJSONを考慮し、args から "import " を除いた残りをそのまま使う
      const jsonStr = args.trim().replace(/^import\s+/i, "").trim();
      if (!jsonStr) {
        return "wizard import <JSON文字列>  でインポートしてください。\n例: wizard import '{\"dictionary\":{\"魔導書\":\"魔導書\"},\"settings\":{\"theme\":\"dark\"}}'";
      }
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.dictionary) this.wizardData.dictionary = { ...this.wizardData.dictionary, ...parsed.dictionary };
        if (parsed.settings) this.wizardData.settings = { ...this.wizardData.settings, ...parsed.settings };
        saveWizardData(this.wizardData);
        return "wizard設定をインポートしました。";
      } catch (e) {
        return "エラー: JSONの解析に失敗しました。正しいJSON形式で入力してください。";
      }
    }
    if (first === "reset") {
      this.wizardData = { ...WIZARD_DEFAULTS };
      saveWizardData(this.wizardData);
      return "wizard設定と辞書をリセットしました。";
    }
    if (first === "dict" || first === "list") {
      const dict = this.wizardData.dictionary;
      const keys = Object.keys(dict);
      if (keys.length === 0) return "辞書に登録された単語はありません。";
      return `wizard辞書（${keys.length}語）:\n` + keys.map((k) => `  ${k} → ${dict[k]}`).join("\n");
    }

    // wizard <単語> rec または wizard rec <単語>
    let targetWord = null;
    if (parts.length >= 2 && parts[1] === "rec") {
      targetWord = parts[0];
    } else if (first === "rec" && parts.length >= 2) {
      targetWord = parts.slice(1).join(" ");
    } else if (parts.length >= 2 && parts[parts.length - 1] === "rec") {
      targetWord = parts.slice(0, -1).join(" ");
    }

    if (targetWord) {
      // セキュリティチェック
      if (isForbiddenPath(targetWord)) {
        return "エラー: 使用禁止文字が含まれています";
      }
      if (targetWord.length > 50) {
        return "エラー: 単語は50文字以内で入力してください";
      }
      // 登録（値は自分自身、またはユーザーが後に追加できる）
      this.wizardData.dictionary[targetWord] = targetWord;
      saveWizardData(this.wizardData);
      return `wizard辞書に登録しました: "${targetWord}"`;
    }

    return `使用方法:
  wizard <単語> rec    単語を辞書登録
  wizard rec <単語>    同上（別形式）
  wizard dict          辞書一覧表示
  wizard export        設定をエクスポート
  wizard import <json> 設定をインポート
  wizard reset         リセット`;
  }

  cmdHistory(args) {
    const entries = this.history.list();
    if (args === "clear") {
      this.history.entries = [];
      return "履歴をクリアしました";
    }
    return entries.map((e, i) => `${i + 1}: ${e}`).join("\n") || "(履歴なし)";
  }

  cmdClear() {
    return "__CLEAR__";
  }

  cmdBell(args) {
    if (args === "on") {
      this.bell.enabled = true;
      return "bell on";
    }
    if (args === "off") {
      this.bell.enabled = false;
      return "bell off";
    }
    return this.bell.enabled ? "bell on" : "bell off";
  }
}
