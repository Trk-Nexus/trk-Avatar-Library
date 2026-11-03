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
        return this.cmdMan();
      case "history":
        return this.cmdHistory(args);
      case "clear":
        return this.cmdClear();
      case "echo":
        return args;
      case "bell":
        return this.cmdBell(args);
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

  cmdMan() {
    return `trk CLI 定番コマンド:
  pwd        カレントパスを表示
  ls / list / dir  ファイル一覧
  cd / skin  スキンを適用
  cat <#>    曲情報を表示
  grep <語句>  テキストを検索
  man / help  このヘルプを表示
  history    コマンド履歴
  clear      画面をクリア
  echo <text>  テキストを表示
  bell on|off  ベル音を切替
  ;  |        コマンドをつなぐ`;
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
