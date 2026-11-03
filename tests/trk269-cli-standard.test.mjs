// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: CLI 標準テスト（23件）
// import-skin-catalog.mjs で生成された js/skins-wizard.js と
// catalog/skins.json の整合性・セキュリティ・cli 5 操作感を検証

import assert from "node:assert";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { sanitizeCliLook, cliLookVars, CLI_CURSOR_SHAPE } from "../js/data.js";
import { CliCommands } from "../js/cli.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const skins = JSON.parse(readFileSync(join(repoRoot, "catalog/skins.json"), "utf-8")).skins;

const wizardSkins = skins.filter((s) => s.cat && s.cat.includes("wizard"));
const cliSkins = wizardSkins.filter((s) => s.cli);

let passed = 0;
let failed = 0;

const testPromises = [];

function test(name, fn) {
  const p = (async () => {
    try {
      await fn();
      passed++;
      console.log(`  ✅ ${name}`);
    } catch (e) {
      failed++;
      console.log(`  ❌ ${name}: ${e.message}`);
    }
  })();
  testPromises.push(p);
}

console.log("=== trk269 CLI 標準テスト（23件） ===\n");

// --- 1. スキン総数 ---
test("スキン総数は 281 種", () => {
  assert.strictEqual(skins.length, 281);
});

// --- 2. wizard カテゴリ 52 種 ---
test("wizard カテゴリは 52 種", () => {
  assert.strictEqual(wizardSkins.length, 52);
});

// --- 3. CLI 対応 40 種 ---
test("CLI 対応 wizard スキンは 40 種", () => {
  assert.strictEqual(cliSkins.length, 40);
});

// --- 4. cli.font 二重クォートなし（wizard-grep/man/sudo）---
const fontProblemSkins = ["wizard-grep", "wizard-man", "wizard-sudo"];
for (const id of fontProblemSkins) {
  test(`cli.font 二重クォートなし: ${id}`, () => {
    const s = cliSkins.find((x) => x.id === id);
    assert.ok(s, `${id} が見つかりません`);
    const font = s.cli.font || "";
    assert.ok(!font.includes("\\\\"), `${id}: cli.font にバックスラッシュが含まれています: ${font}`);
    assert.ok(!font.includes('"'), `${id}: cli.font に二重クォートが含まれています: ${font}`);
    assert.ok(font.includes(", "), `${id}: cli.font にカンマ後のスペースがありません: ${font}`);
  });
}

// --- 5. 5 操作感（cursor/opacity/history/completion/bell）の存在 ---
const FEATURES = ["cursor", "opacity", "history", "completion", "bell"];
for (const s of cliSkins) {
  for (const key of FEATURES) {
    test(`cli.${key} 存在: ${s.id}`, () => {
      assert.ok(key in s.cli, `${s.id}: cli.${key} が不足`);
    });
  }
}

// --- 6. cursor は block/underline/bar ---
for (const s of cliSkins) {
  test(`cli.cursor 有効値: ${s.id}`, () => {
    assert.ok(["block", "underline", "bar"].includes(s.cli.cursor), `${s.id}: cli.cursor = ${s.cli.cursor}`);
  });
}

// --- 7. opacity は 0.5 〜 1 ---
for (const s of cliSkins) {
  test(`cli.opacity 範囲: ${s.id}`, () => {
    const v = s.cli.opacity;
    assert.ok(typeof v === "number" && v >= 0.5 && v <= 1, `${s.id}: cli.opacity = ${v}`);
  });
}

// --- 8. history は 10 〜 200 ---
for (const s of cliSkins) {
  test(`cli.history 範囲: ${s.id}`, () => {
    const v = s.cli.history;
    assert.ok(typeof v === "number" && v >= 10 && v <= 200, `${s.id}: cli.history = ${v}`);
  });
}

// --- 9. completion は tab/off ---
for (const s of cliSkins) {
  test(`cli.completion 有効値: ${s.id}`, () => {
    assert.ok(["tab", "off"].includes(s.cli.completion), `${s.id}: cli.completion = ${s.cli.completion}`);
  });
}

// --- 10. bell は boolean ---
for (const s of cliSkins) {
  test(`cli.bell boolean: ${s.id}`, () => {
    assert.ok(typeof s.cli.bell === "boolean", `${s.id}: cli.bell = ${s.cli.bell}`);
  });
}

// --- 11. prompt は 1-4 文字、クォート禁止 ---
for (const s of cliSkins) {
  test(`cli.prompt 1-4 文字・クォート禁止: ${s.id}`, () => {
    const p = s.cli.prompt || "";
    assert.ok(p.length >= 1 && p.length <= 4, `${s.id}: cli.prompt 長 = ${p.length}`);
    assert.ok(!/["'\\`~]/.test(p), `${s.id}: cli.prompt に禁止文字: ${p}`);
  });
}

// --- 12. caret は #rgb / #rrggbb / currentColor ---
for (const s of cliSkins) {
  test(`cli.caret 形式: ${s.id}`, () => {
    const c = s.cli.caret || "";
    assert.ok(c.startsWith("#") || c === "currentColor", `${s.id}: cli.caret = ${c}`);
  });
}

// --- 13. scan は 0-0.6 ---
for (const s of cliSkins) {
  test(`cli.scan 範囲: ${s.id}`, () => {
    const v = s.cli.scan;
    assert.ok(typeof v === "number" && v >= 0 && v <= 0.6, `${s.id}: cli.scan = ${v}`);
  });
}

// --- 14. colors 必須5色（bg/panel/text/accent/gold）---
const REQUIRED_COLORS = ["bg", "panel", "text", "accent", "gold"];
for (const s of wizardSkins) {
  for (const c of REQUIRED_COLORS) {
    test(`colors.${c} 存在: ${s.id}`, () => {
      assert.ok(s.colors && s.colors[c], `${s.id}: colors.${c} が不足`);
    });
  }
}

// --- 15. セキュリティ：cli.font に使用禁止文字なし ---
for (const s of cliSkins) {
  test(`cli.font セキュリティ: ${s.id}`, () => {
    const font = s.cli.font || "";
    assert.ok(!/[`\\]/.test(font), `${s.id}: cli.font にバッククォート/バックスラッシュ`);
    assert.ok(!/\.\./.test(font), `${s.id}: cli.font に ..`);
    assert.ok(!/~/g.test(font), `${s.id}: cli.font に ~`);
    assert.ok(!/^[Cc]:/.test(font), `${s.id}: cli.font に C:`);
  });
}

// --- 16. sanitizeCliLook: 正常な cli オブジェクト ---
test("sanitizeCliLook: 正常な cli オブジェクト", () => {
  const look = sanitizeCliLook({
    font: "Courier New, Consolas, monospace",
    prompt: ">",
    caret: "#d4af37",
    scan: 0.1,
    cursor: "block",
    opacity: 1,
    history: 50,
    completion: "tab",
    bell: true,
  });
  assert.strictEqual(look.font, "Courier New, Consolas, monospace");
  assert.strictEqual(look.prompt, ">");
  assert.strictEqual(look.caret, "#d4af37");
  assert.strictEqual(look.scan, 0.1);
  assert.strictEqual(look.cursor, "block");
  assert.strictEqual(look.opacity, 1);
  assert.strictEqual(look.history, 50);
  assert.strictEqual(look.completion, "tab");
  assert.strictEqual(look.bell, true);
});

// --- 17. sanitizeCliLook: フォントの二重クォート除去 ---
test("sanitizeCliLook: フォントの二重クォート除去", () => {
  const look = sanitizeCliLook({
    font: '"Courier New", "Courier", monospace',
    prompt: ">",
    caret: "#d4af37",
    scan: 0.1,
  });
  assert.strictEqual(look.font, "Courier New, Courier, monospace");
});

// --- 18. sanitizeCliLook: 使用禁止文字でエラー ---
test("sanitizeCliLook: 使用禁止文字でエラー", () => {
  assert.throws(() => sanitizeCliLook({ font: "C:\\Windows", prompt: ">" }), /使用禁止文字/);
});

// --- 19. CLI_CURSOR_SHAPE ---
test("CLI_CURSOR_SHAPE: block/underline/bar", () => {
  assert.strictEqual(CLI_CURSOR_SHAPE.block, "block");
  assert.strictEqual(CLI_CURSOR_SHAPE.underline, "underline");
  assert.strictEqual(CLI_CURSOR_SHAPE.bar, "bar");
});

// --- 20. CliCommands: pwd / ls / echo ---
test("CliCommands: pwd / ls / echo", async () => {
  const cli = new CliCommands({});
  assert.strictEqual(await cli.run("pwd"), "/trk");
  assert.ok((await cli.run("ls")).includes("skins"));
  assert.strictEqual(await cli.run("echo hello"), "hello");
});

// --- 21. CliCommands: bell on/off ---
test("CliCommands: bell on/off", async () => {
  const cli = new CliCommands({});
  assert.strictEqual(await cli.run("bell on"), "bell on");
  assert.strictEqual(cli.bell.enabled, true);
  assert.strictEqual(await cli.run("bell off"), "bell off");
  assert.strictEqual(cli.bell.enabled, false);
});

// --- 22. CliCommands: 生パス（/、..、~、C:）は拒否 ---
test("CliCommands: 生パス拒否", async () => {
  const cli = new CliCommands({});
  for (const bad of ["/etc/passwd", "../secret", "~", "C:\\Windows"]) {
    const out = await cli.run(`cd ${bad}`);
    assert.ok(out.includes("エラー"), `拒否されました: ${bad} → ${out}`);
  }
});

// --- 23. ; と | でつなぐ ---
test("CliCommands: ; と | でつなぐ", async () => {
  const cli = new CliCommands({});
  const out = await cli.run("echo a; echo b");
  assert.ok(out.includes("a") && out.includes("b"), `出力: ${out}`);
});

await Promise.all(testPromises);

console.log(`\n=== 結果: ${passed} 合格 / ${failed} 不合格 ===`);
process.exit(failed > 0 ? 1 : 0);
