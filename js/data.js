// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: CLI スキン外観データのサニタイズ・CSS 変数生成
//
// セキュリティ: 入力に ` ` \ .. ~ C: を含んではならない
//   (バッククォート、バックスラッシュ、相対パス ../、チルデ、Windows ドライブレター)

export const CLI_CURSOR_SHAPE = {
  block: "block",
  underline: "underline",
  bar: "bar",
};

// 使用禁止文字パターン
const FORBIDDEN_PATTERN = /[`\\]/;
const FORBIDDEN_PATH = /\.\./;
const FORBIDDEN_TILDE = /~/;
const FORBIDDEN_DRIVE = /^[Cc]:/;

// 値に使用禁止文字が含まれるか
function hasForbidden(value) {
  if (typeof value !== "string") return false;
  return (
    FORBIDDEN_PATTERN.test(value) ||
    FORBIDDEN_PATH.test(value) ||
    FORBIDDEN_TILDE.test(value) ||
    FORBIDDEN_DRIVE.test(value)
  );
}

// オブジェクトを再帰的にチェック
function checkForbidden(obj, path = "") {
  for (const [key, val] of Object.entries(obj || {})) {
    const p = path ? `${path}.${key}` : key;
    if (typeof val === "string") {
      if (hasForbidden(val)) {
        throw new Error(`使用禁止文字が含まれています: ${p} = ${val}`);
      }
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      checkForbidden(val, p);
    }
  }
}

// CLI スキン外観のサニタイズ
// cli: スキンの cli オブジェクト（font/prompt/caret/scan + 5操作感）
// 戻り値: 正規化済みの cliLook オブジェクト
export function sanitizeCliLook(cli) {
  if (!cli || typeof cli !== "object") {
    throw new Error("cli オブジェクトが不足しています");
  }

  // セキュリティチェック
  checkForbidden(cli);

  // font: クォート・バックスラッシュを除去し、カンマ後のスペースを正規化
  let font = "";
  if (cli.font) {
    font = String(cli.font)
      .replace(/\\"/g, "")
      .replace(/"/g, "")
      .replace(/\\\\/g, "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .join(", ");
  }

  // prompt: 1〜4 文字、クォート禁止
  let prompt = "";
  if (cli.prompt !== undefined) {
    prompt = String(cli.prompt);
    if (prompt.length < 1 || prompt.length > 4) {
      throw new Error(`cli.prompt は 1〜4 文字である必要があります（現在: ${prompt.length} 文字）`);
    }
    if (/["'\\`~]/.test(prompt)) {
      throw new Error(`cli.prompt に使用禁止文字が含まれています: ${prompt}`);
    }
  }

  // caret: #rgb / #rrggbb / currentColor
  let caret = "";
  if (cli.caret !== undefined) {
    caret = String(cli.caret);
    if (!caret.startsWith("#") && caret !== "currentColor") {
      throw new Error(`cli.caret は #rgb / #rrggbb / currentColor である必要があります（現在: ${caret}）`);
    }
  }

  // scan: 0 〜 0.6
  let scan = 0.1;
  if (cli.scan !== undefined) {
    scan = Number(cli.scan);
    if (isNaN(scan) || scan < 0 || scan > 0.6) {
      throw new Error(`cli.scan は 0 〜 0.6 の範囲である必要があります（現在: ${cli.scan}）`);
    }
  }

  // 5操作感
  const cursor =
    cli.cursor && ["block", "underline", "bar"].includes(cli.cursor)
      ? cli.cursor
      : "block";
  const opacity =
    typeof cli.opacity === "number" && cli.opacity >= 0.5 && cli.opacity <= 1
      ? cli.opacity
      : 1;
  const history =
    typeof cli.history === "number" && cli.history >= 10 && cli.history <= 200
      ? cli.history
      : 50;
  const completion =
    cli.completion && ["tab", "off"].includes(cli.completion)
      ? cli.completion
      : "tab";
  const bell = typeof cli.bell === "boolean" ? cli.bell : true;

  return {
    font,
    prompt,
    caret,
    scan,
    cursor,
    opacity,
    history,
    completion,
    bell,
  };
}

// CLI スキンの CSS 変数を生成
// 地（::before）に --cli-opacity を適用。文字は透けさせない。
export function cliLookVars(look, root = document.documentElement) {
  if (!look) return;
  root.style.setProperty("--cli-font", look.font);
  root.style.setProperty("--cli-prompt", look.prompt);
  root.style.setProperty("--cli-caret", look.caret);
  root.style.setProperty("--cli-scan", String(look.scan));
  root.style.setProperty("--cli-cursor", look.cursor);
  root.style.setProperty("--cli-opacity", String(look.opacity));
  root.style.setProperty("--cli-history", String(look.history));
  root.style.setProperty("--cli-completion", look.completion);
  root.style.setProperty("--cli-bell", String(look.bell));
}
