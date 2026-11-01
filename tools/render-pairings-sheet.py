#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""組み合わせ見本の「縮刷版」を作る（1 枚の PNG。2026-11-01・返事13 のお願い）

なぜ要るか：
  相手（trk-PWA）は実機で `gallery/pairings.html` を見られない。14 組の差が「どのくらいか」を
  目で比べるために、**1 枚に全 14 組**を並べた画像が要る、というお願い（返事13 §5-1）。
  ブラウザが無いので、HTML を撮るのではなく **同じデータ・同じ書体で描き直します**。

何を描くか：
  ・各組の 1 行目：題字（display）＋見出し（heading）
  ・2 行目：本文（body）＋注記（caption）
  ・左に組の名前と倍率、右に使う書体（display／body）
  ・書体は `catalog/preview/*.woff2`（見本の字だけの抜き出し）を PIL で読み込んで使う

使い方：
  python3 tools/render-pairings-sheet.py                 # docs/2026-11-01-組み合わせ縮刷版.png
  python3 tools/render-pairings-sheet.py --out=/tmp/x.png --cols=2
必要なもの：python3・Pillow・fontTools（woff2 を解くのに brotli も）
"""
import argparse, json, os, sys, tempfile

from fontTools.ttLib import TTFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TYP = os.path.join(REPO, "catalog/typography.json")
PREVIEW = os.path.join(REPO, "catalog/preview")
FALLBACK = os.environ.get("TRK_FALLBACK_FONT", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
# 紙（見出し・説明）の字は、倉庫の中の書体（Noto Sans JP）を使う。日本語が出る端末フォントが無い環境でも崩れないように
UI_PACK = os.path.join(REPO, "font-packs/noto-sans-jp.stpack")
UI_FILES = {400: "fonts/TrkNotoSansJP400.woff2", 500: "fonts/TrkNotoSansJP500.woff2", 700: "fonts/TrkNotoSansJP700.woff2"}

SCALE = {}


def load_fonts(tmpdir):
    """書体を PIL が読める TTF に解いておく。

    **紙に描くときは本物の書体**（各パックの woff2）を使う（見本用の抜き出しだと、見本の文に無い字が □ になる）。
    パックに無いときだけ catalog/preview/ の抜き出しに落ちる。"""
    from PIL import ImageFont
    import zipfile
    fonts = {}

    # 目録から「family＋太さ → どのパックの、どのファイルか」を引けるようにする
    index = json.load(open(os.path.join(REPO, "catalog/index.json"), encoding="utf-8"))
    where = {}
    for p in index["packs"]:
        for f in p.get("fonts", []):
            where[(f["family"], f.get("weight", 400))] = (p["file"], f["file"])

    def full_file(family, weight):
        """パックから本物の書体を取り出して TTF にする（1 回だけ）"""
        hit = where.get((family, weight))
        if not hit:
            return None
        pack, inner = hit
        out = os.path.join(tmpdir, f"full-{family}-{weight}.ttf")
        if os.path.exists(out):
            return out
        try:
            with zipfile.ZipFile(os.path.join(REPO, pack)) as z:
                src = os.path.join(tmpdir, f"full-{family}-{weight}.woff2")
                open(src, "wb").write(z.read(inner))
            f = TTFont(src)
            f.flavor = None
            f.save(out)
            return out
        except Exception as e:
            print(f"⚠️ {family} {weight} を取り出せませんでした（{e}）", file=sys.stderr)
            return None

    def ui_file(weight):
        """紙の字（説明・組の名前）用。パックから取り出して TTF にする"""
        out = os.path.join(tmpdir, f"ui-{weight}.ttf")
        if not os.path.exists(out):
            with zipfile.ZipFile(UI_PACK) as z:
                src = os.path.join(tmpdir, f"ui-{weight}.woff2")
                open(src, "wb").write(z.read(UI_FILES.get(weight, UI_FILES[400])))
            f = TTFont(src)
            f.flavor = None
            f.save(out)
        return out

    def family_file(family, weight):
        path = os.path.join(PREVIEW, f"{family}-{weight}.woff2")
        if not os.path.exists(path):
            return None
        out = os.path.join(tmpdir, f"{family}-{weight}.ttf")
        if not os.path.exists(out):
            f = TTFont(path)
            f.flavor = None
            f.save(out)
        return out

    def get(family, weight, px):
        key = (family, weight, px)
        if key in fonts:
            return fonts[key]
        if family == "UI":
            path = ui_file(weight) if os.path.exists(UI_PACK) else FALLBACK
        else:
            path = full_file(family, weight) or family_file(family, weight) or FALLBACK
        try:
            fonts[key] = ImageFont.truetype(path, px)
        except Exception:
            fonts[key] = ImageFont.load_default()
        return fonts[key]

    return get


def main():
    ap = argparse.ArgumentParser()
    # 既定は docs/（配る 1 枚。セットにも入れて、実機で開けるようにしています）
  ap.add_argument("--out", default=os.path.join(REPO, "docs/2026-11-01-組み合わせ縮刷版.png"))
    ap.add_argument("--cols", type=int, default=2)
    ap.add_argument("--width", type=int, default=1400)
    args = ap.parse_args()

    from PIL import Image, ImageDraw
    data = json.load(open(TYP, encoding="utf-8"))
    for s in data["scales"]:
        SCALE[str(s["id"])] = s
    get = load_fonts(tempfile.mkdtemp(prefix="trk-sheet-"))

    pairings = data["pairings"]
    cols = max(1, args.cols)
    W = args.width
    pad = 34
    gap = 22
    colW = (W - pad * 2 - gap * (cols - 1)) // cols

    # 各カードの高さを先に測る（行数は固定：題字／見出し／本文 2 行／注記／メタ）
    CARD_H = 250
    rows = (len(pairings) + cols - 1) // cols
    head = 128
    H = head + rows * (CARD_H + gap) + pad

    img = Image.new("RGB", (W, H), "#ffffff")
    d = ImageDraw.Draw(img)
    ink, muted, line = "#14181f", "#5b6472", "#d7dce4"

    def text(xy, s, family="UI", weight=400, px=16, fill=ink):
        d.text(xy, s, font=get(family, weight, px), fill=fill)

    # 見出し（この紙）
    text((pad, 30), "trk! 書体の組み合わせ 14 組（縮刷版）", weight=700, px=28)
    text((pad, 72), "題字・見出し・本文・注記を本物の書体で組んだもの。倍率は本文を 1 とした比。", px=15, fill=muted)
    text((pad, 96), "データ：catalog/typography.json ／ 書体：各パックの woff2 から見本の字だけを抜いたもの（catalog/preview/）", px=13, fill=muted)

    for i, p in enumerate(pairings):
        r, c = divmod(i, cols)
        x = pad + c * (colW + gap)
        y = head + r * (CARD_H + gap)
        d.rounded_rectangle([x, y, x + colW, y + CARD_H], radius=14, outline=line, fill="#fbfcfe")
        sc = SCALE.get(str(p["scale"]), SCALE["1.25"])
        sl = p["slots"]
        disp, head_s = sl["display"], sl["heading"]
        body, cap = sl["body"], sl["caption"]
        s = p["sample"]

        # メタ（左：名前と倍率／右：書体）
        text((x + 18, y + 14), p["name"], weight=700, px=17)
        text((x + 18, y + 40), f"倍率 {p['scale']}・{len({v['family'] for v in sl.values()})} 家族", px=12, fill=muted)
        meta = f"題字 {disp['family'].replace('Trk', '')} {disp['weight']}／本文 {body['family'].replace('Trk', '')} {body['weight']}"
        text((x + colW - 18 - d.textlength(meta, font=get("UI", 400, 12)), y + 18), meta, px=12, fill=muted)

        # 題字（倍率の display で。紙の上では 34px 前後に抑える）
        dpx = max(20, min(40, int(round(16 * sc["sizes"]["display"]))))
        text((x + 18, y + 62), s["display"], disp["family"], disp["weight"], dpx)
        # 見出し
        hpx = max(14, min(24, int(round(16 * sc["sizes"]["heading"]))))
        text((x + 18, y + 62 + dpx + 10), s["heading"], head_s["family"], head_s["weight"], hpx, fill="#2a3342")
        # 本文（幅で折り返す。2 行まで）
        bpx = 16
        yy = y + 62 + dpx + 10 + hpx + 16
        limit = colW - 36
        buf, drawn = "", 0
        for ch in s["body"]:
            if d.textlength(buf + ch, font=get(body["family"], body["weight"], bpx)) > limit:
                text((x + 18, yy + drawn * (bpx + 7)), buf, body["family"], body["weight"], bpx, fill="#1d2430")
                buf, drawn = "", drawn + 1
                if drawn >= 2:
                    break
            buf += ch
        if buf and drawn < 2:
            text((x + 18, yy + drawn * (bpx + 7)), buf, body["family"], body["weight"], bpx, fill="#1d2430")
        # 注記
        text((x + 18, y + CARD_H - 30), s["caption"], cap["family"], cap["weight"], 12, fill=muted)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    img.save(args.out, "PNG", optimize=True)
    print(f"✅ {os.path.relpath(args.out, REPO)} — {len(pairings)} 組・{W}×{H} px・{os.path.getsize(args.out):,} B")


if __name__ == "__main__":
    main()
