// SPDX-License-Identifier: GPL-3.0-or-later
/* 📦 .stpack（trk! のパック）を Node から読むための小さな入口（2026-10-31）

   trk-PWA の `js/zip-io.js`（アプリ本体と同じ ZIP の読み書き。ZIP64 対応・CRC 検証つき）を
   そのまま読み込んで使います。**同じ道具で検査する**ためで、ZIP の実装をこのリポジトリに複製しません。

   使い方：
     import { openZip, readJsonEntry, listEntries } from "./lib/zip.mjs";
     const zip = await openZip(fs.readFileSync("packs/foo.stpack"));   // Buffer でも Blob でも可
   trk-PWA の場所：
     --trk=/path/to/trk-PWA ／ 環境変数 TRK_PWA ／ 既定は ../trk-PWA
*/
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* HERE は tools/lib。リポジトリの根は2つ上、その隣の trk-PWA は3つ上から見ます */
const DEFAULT_TRK = process.env.TRK_PWA || path.resolve(HERE, "..", "..", "..", "trk-PWA");

export function zipIOPath(trk) {
  const root = path.resolve(trk || DEFAULT_TRK);
  const file = path.join(root, "js/zip-io.js");
  if (!fs.existsSync(file)) {
    throw new Error(`trk-PWA の js/zip-io.js が見つかりません: ${file}\n--trk=/path/to/trk-PWA で指定してください`);
  }
  return file;
}

export function loadZipIO(trk) {
  const sandbox = {
    window: {}, console,
    Blob, Response, CompressionStream, DecompressionStream,
    TextEncoder, TextDecoder, Uint8Array, Uint16Array, Uint32Array, Int32Array, DataView, ArrayBuffer,
    crypto, Promise, Map, Set, Object, Array, Number, String, Math, JSON, Date, Error, TypeError, RangeError,
    Infinity, NaN, isFinite, isNaN, parseInt, parseFloat, setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(zipIOPath(trk), "utf8"), sandbox, { filename: "trk-PWA/js/zip-io.js" });
  return sandbox.window.Trk.zipIO;
}

const asBlob = data => (data instanceof Blob ? data : new Blob([data]));

export async function openZip(data, trk) {
  const zipIO = loadZipIO(trk);
  const blob = asBlob(data);
  const zip = await zipIO.zipOpen(blob);
  return {
    zipIO, zip,
    names() { return zip.entries.map(e => e.name); },
    has(name) { return zip.entries.some(e => e.name === name); },
    entry(name) { return zip.entries.find(e => e.name === name) || null; },
    async read(name, limit = 64 * 1024 * 1024) {
      const e = zip.entries.find(x => x.name === name);
      if (!e) return null;
      const blob = await zipIO.zipEntryBlob(zip, e, limit, true);
      return new Uint8Array(await blob.arrayBuffer());
    },
    async readText(name, limit) {
      const bytes = await this.read(name, limit);
      return bytes ? new TextDecoder().decode(bytes) : null;
    },
  };
}

export async function readJsonEntry(zipped, name) {
  const text = await zipped.readText(name);
  if (text == null) return null;
  try { return JSON.parse(text); } catch (_) { return null; }
}

export function listEntries(zipped) {
  return zipped.zip.entries.map(e => ({ name:e.name, bytes:e.usize, method:e.method }));
}
