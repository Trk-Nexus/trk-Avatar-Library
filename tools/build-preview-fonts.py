#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""組み合わせ見本（gallery/pairings.html）に埋める「見本用の小さな woff2」を作る。

この倉庫の書体パックから、見本に出す字だけを取り出して woff2（数 KB〜数十 KB）にします。
出来たものは catalog/preview/ に置き、`tools/export-pairing-gallery.mjs` が base64 で HTML に埋めます。
（本番の書体は各 .stpack に入っているものを使います。ここで作るのは**見本のための抜き出し**です）

必要なもの：python3 と `pip install fonttools brotli`
使い方：python3 tools/build-preview-fonts.py [--all]
    既定は catalog/typography.json に出てくる書体だけ。--all は 42 書体すべて。
"""
import argparse, base64, json, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "tools"))
OUT = os.path.join(REPO, "catalog", "preview")

BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
PUNCT = " .,:;!?'\"()[]{}<>/\\|-–—_+=*&%$#@~^`"
JP_PUNCT = "、。・「」『』（）［］【】〈〉《》ー〜〜～！？：；…‥※→←↑↓★☆○●■□▲△▼▽◆◇"

# 見本に出す文（長すぎると woff2 が大きくなるので、役ごとに切る）。
# 上限は catalog/typography.json の sampleLimits（ページ・検査と同じ値を使う）
SPECIMEN = {"display": 14, "heading": 20, "body": 30, "caption": 14}
# 題字・見出し・本文・注記だけを本物の書体で出します（差し色と数字は、同じ家族があれば使い、無ければ端末の書体）

def sample_chars():
    """見本の文（typography.json・役ごとに切ったもの）から、使う字を集める。
    ページの地の文は端末の書体で出します（埋め込むのは見本の書体だけ）。"""
    path = os.path.join(REPO, "catalog", "typography.json")
    chars = set(BASE + PUNCT + JP_PUNCT)
    if os.path.exists(path):
        data = json.load(open(path, encoding="utf-8"))
        limits = data.get("sampleLimits") or SPECIMEN
        for p in data.get("pairings", []):
            for slot in SPECIMEN:
                chars |= set((p.get("sample") or {}).get(slot, "")[:limits.get(slot, SPECIMEN[slot])])
    return chars

def subset(src, dst, chars):
    from fontTools import subset
    from fontTools.ttLib import TTFont
    f = TTFont(src)
    cmap = f.getBestCmap()
    want = "".join(sorted(c for c in chars if ord(c) in cmap))
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.desubroutinize = False
    # 見本は日本語の文字を並べるだけなので、組版の表（GSUB/GPOS）は落として軽くする
    opts.layout_features = []
    opts.name_IDs = [1, 2, 3, 4, 6]
    opts.notdef_outline = True
    opts.recalc_bounds = True
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(options=opts)
    sub.populate(text=want)
    sub.subset(font)
    subset.save_font(font, dst, opts)
    return len(want), os.path.getsize(dst)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    chars = sample_chars()
    typ = json.load(open(os.path.join(REPO, "catalog", "typography.json"), encoding="utf-8"))

    # 目録（catalog/index.json）の fonts[].file が、パックの中の本当のファイル名です
    cat = json.load(open(os.path.join(REPO, "catalog", "index.json"), encoding="utf-8"))
    where = {}
    for p in cat["packs"]:
        for f in p.get("fonts", []):
            where[(f["family"], f.get("weight", 400))] = (p["file"], f["file"])

    # **その書体が見本で出す字だけ**を抜く（書体ごとに必要な字がちがう）
    limits = typ.get("sampleLimits") or SPECIMEN
    need = {}
    for p in typ["pairings"]:
        for slot, f in p["slots"].items():
            if slot not in SPECIMEN:
                continue
            key = (f["family"], f["weight"])
            need.setdefault(key, set()).update((p.get("sample") or {}).get(slot, "")[:limits.get(slot, SPECIMEN[slot])])
    if args.all:
        for key in where:
            need.setdefault(key, chars)

    total = 0
    made = []
    for (family, weight) in sorted(need):
        if (family, weight) not in where:
            print("skip（目録にありません）", family, weight)
            continue
        pack, inner = where[(family, weight)]
        stpack = os.path.join(REPO, pack)
        if not os.path.exists(stpack):
            print("skip（パックがありません）", pack)
            continue
        # .stpack（無圧縮 zip）から書体を取り出す
        import zipfile
        with zipfile.ZipFile(stpack) as z:
            tmp = os.path.join("/tmp", "preview-src.woff2")
            open(tmp, "wb").write(z.read(inner))
        dst = os.path.join(OUT, f"{family}-{weight}.woff2")
        n, size = subset(tmp, dst, need[(family, weight)])
        total += size
        made.append((family, weight, n, size, pack, inner))
        print(f"{family}-{weight}: {n} 字 → {size:,} B")
    print(f"\n{len(made)} 本・合計 {total:,} B（base64 で約 {int(total*4/3):,} B）")
    json.dump({"generatedAt": "2026-11-01", "chars": len(chars),
               "about": "gallery/pairings.html に埋め込む見本用の woff2（各パックの書体から、見本に出す字だけを抜いたもの）",
               "fonts": [{"family": f, "weight": w, "chars": n, "bytes": b,
                          "pack": pk, "file": fl} for f, w, n, b, pk, fl in made]},
              open(os.path.join(OUT, "SOURCE.json"), "w"), ensure_ascii=False, indent=2)
    open(os.path.join(OUT, "SOURCE.json"), "a").write("\n")

if __name__ == "__main__":
    main()
