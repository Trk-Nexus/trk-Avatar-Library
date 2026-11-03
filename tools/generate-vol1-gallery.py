#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library スキン vol.1 ギャラリー HTML 生成スクリプト
# catalog/skins.json から vol.1 の16スキンを読み、スタンドアロンの見本 HTML を書き出します。

import json
from html import escape

VOL1_IDS = [
    "lanternAlley", "moonlitTerrace", "fireflyValley", "midnightCafe",
    "snowyShrine", "autumnMaple", "summerNight", "zenStone",
    "inkWash", "paperMoon", "copperHour", "lavenderHill",
    "emeraldNight", "cherrySnow", "ironMorning", "goldLeafNight",
]

def pick_label(o, lang="ja"):
    if not isinstance(o, dict):
        return ""
    return o.get(lang) or o.get("ja") or o.get("en") or ""


def lum(hex_color):
    """相対輝度を計算（テキスト色の自動選択用）"""
    m = __import__("re").match(r"^#([0-9a-f]{6})$", hex_color or "", __import__("re").I)
    if not m:
        return 0
    c = [0, 2, 4]
    vals = [int(m.group(1)[i:i+2], 16) / 255 for i in c]
    vals = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in vals]
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2]


def text_color(bg_hex):
    return "#000000" if lum(bg_hex) > 0.5 else "#ffffff"


def main():
    CAT = {
        "all": "すべて",
        "basic": "定番",
        "light": "ライト",
        "grad": "グラデーション",
        "fun": "遊び心",
        "dark": "ダーク",
        "access": "見やすさ",
        "life": "生活",
        "type": "書体",
        "miku": "ミク",
    }

    with open("catalog/skins.json", encoding="utf-8") as f:
        data = json.load(f)

    vol1_skins = [s for s in data["skins"] if s["id"] in VOL1_IDS]
    vol1_skins.sort(key=lambda s: VOL1_IDS.index(s["id"]))

    # HTML の head
    html = """<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>trk! スキン見本 vol.1 — 夜の情景と光の色彩（16種）— trk-Avatar-Library</title>
<style>
  :root{--bg:#0b0c10;--panel:#14161d;--line:#2a2e3a;--text:#f2f3f7;--muted:#a9adbd;--accent:#ff3b55;}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif}
  header{padding:22px 20px 10px;max-width:1200px;margin:0 auto}
  h1{font-size:22px;margin:0 0 6px}
  .lead{color:var(--muted);font-size:13px;margin:0 0 14px}
  .theme{display:inline-block;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.05em;margin-bottom:10px}
  .tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 8px}
  .tools input{flex:1 1 240px;padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
  .chip{padding:5px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:13px;font-weight:700;cursor:pointer}
  .chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
  .count{color:var(--muted);font-size:13px;margin:6px 0 0}
  main{max-width:1200px;margin:0 auto;padding:14px 20px 60px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
  .card{border-radius:16px;padding:14px 16px;border:2px solid var(--c-border);background:var(--c-bg);color:var(--c-text);
    display:flex;flex-direction:column;gap:8px;min-height:200px;position:relative;overflow:hidden;font-family:var(--c-font,inherit)}
  .card::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent 40%,rgba(0,0,0,.08) 60%);pointer-events:none}
  .card .meta{position:absolute;top:10px;right:10px;font-size:10px;font-family:ui-monospace,monospace;color:var(--c-muted);letter-spacing:.05em}
  .card .dots{display:flex;gap:6px;margin-bottom:4px}
  .card .dot{width:12px;height:12px;border-radius:50%}
  .card b{font-size:17px;font-family:var(--c-title,inherit);font-weight:var(--c-weight,700);letter-spacing:var(--c-space,normal)}
  .card .spec{font-size:18px;font-family:var(--c-title,inherit);font-weight:var(--c-weight,700);letter-spacing:var(--c-space,normal);text-transform:var(--c-transform,none)}
  .card small{opacity:.85;font-size:12px;line-height:1.4;font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif}
  .card .cat{margin-top:auto;font-size:11px;font-weight:700;letter-spacing:.08em}
  .empty{color:var(--muted);padding:40px 0;text-align:center}
  footer{max-width:1200px;margin:0 auto;padding:0 20px 40px;color:var(--muted);font-size:12px;border-top:1px solid var(--line);margin-top:30px}
  a{color:var(--accent)}
  .badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.05em;margin-left:6px}
  .badge.locked{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3)}
  .badge.free{background:rgba(76,175,80,.2);color:#a5d6a7;border:1px solid rgba(76,175,80,.4)}
</style>
</head>
<body>
<header>
  <div class="theme">🌙 vol.1 夜の情景と光の色彩</div>
  <h1>trk! スキン見本 vol.1 <span id="total"></span></h1>
  <p class="lead">日本の夜の情景をモチーフにした16種類のスキン。アプリを起動せずに、端末でそのまま開いて見比べられます。</p>
  <div class="tools">
    <input id="q" type="search" placeholder="🔍 名前・説明・カテゴリで絞る（例：桜 / 夜 / 禅 / 金箔）" autocomplete="off">
  </div>
  <div class="chips" id="chips"></div>
  <p class="count" id="count"></p>
</header>
<main><div class="grid" id="grid"></div><p class="empty" id="empty" hidden>見つかりませんでした。言葉を変えてください。</p></main>
<footer>
  trk-Avatar-Library スキン vol.1（16種）。カタログ: <code>catalog/skins.json</code>。<br>
  各スキンの色はリズムゲームの判定・テキスト・背景などに適用されます。GPL-3.0-or-later。
</footer>
<script>
(function () {
  const SKINS = __SKINS_JSON__;
  const CAT = __CAT_JSON__;
  const ORDER = ["all","basic","light","grad","fun","dark","access","life","type","miku"];
  let state = { q:"", cat:"all" };

  function textOf(s) {
    return [s.label.ja, s.label.en, s.label.zh, s.label.ko, s.desc.ja, s.desc.en, s.desc.zh, s.desc.ko, s.id, s.cat.join(" ")].join(" ").toLowerCase();
  }
  function matches(s) {
    const words = state.q.trim().toLowerCase(/\s+/g, " ").split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const t = textOf(s);
    return words.every(w => t.indexOf(w) >= 0);
  }
  function render() {
    const grid = document.getElementById("grid");
    const list = SKINS.filter(s => {
      if (state.cat !== "all" && s.cat.indexOf(state.cat) < 0) return false;
      return matches(s);
    });
    grid.textContent = "";
    document.getElementById("empty").hidden = list.length > 0;
    document.getElementById("count").textContent = list.length === SKINS.length ? "（16種）" : "（" + list.length + "／16種）";
    list.forEach(s => {
      const c = s.colors;
      const el = document.createElement("div");
      el.className = "card";
      el.style.setProperty("--c-bg", c.stage);
      el.style.setProperty("--c-text", c.text);
      el.style.setProperty("--c-border", c.border);
      el.style.setProperty("--c-muted", c.muted);
      if (s.font) el.style.setProperty("--c-font", s.font);
      if (s.type) {
        if (s.type.title) el.style.setProperty("--c-title", s.type.title);
        if (s.type.titleWeight) el.style.setProperty("--c-weight", s.type.titleWeight);
        if (s.type.titleSpace) el.style.setProperty("--c-space", s.type.titleSpace);
        if (s.type.titleTransform) el.style.setProperty("--c-transform", s.type.titleTransform);
      }
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = s.id + " · " + s.cat.join("/");
      const dots = document.createElement("div");
      dots.className = "dots";
      [c.accent, c.gold, c.text].forEach(col => {
        const d = document.createElement("div");
        d.className = "dot";
        d.style.background = col;
        dots.appendChild(d);
      });
      const name = document.createElement("b");
      name.textContent = (s.locked ? "🔒 " : "") + s.label.ja;
      const nameEn = document.createElement("div");
      nameEn.style.fontSize = "12px";
      nameEn.style.opacity = ".75";
      nameEn.style.marginBottom = "6px";
      nameEn.textContent = s.label.en;
      const spec = document.createElement("div");
      spec.className = "spec";
      spec.textContent = s.type && s.type.mark ? s.type.mark : "あア漢 Aa 12";
      const desc = document.createElement("small");
      desc.textContent = s.desc.ja || "";
      const catDiv = document.createElement("div");
      catDiv.className = "cat";
      catDiv.textContent = s.cat.map(x => CAT[x] || x).join("  ");
      el.append(meta, dots, name, nameEn, spec, desc, catDiv);
      grid.appendChild(el);
    });
  }
  const chips = document.getElementById("chips");
  ORDER.forEach(k => {
    const b = document.createElement("button");
    b.className = "chip" + (k === "all" ? " on" : "");
    b.type = "button";
    b.textContent = CAT[k] || k;
    b.addEventListener("click", () => {
      state.cat = k;
      [...chips.children].forEach(x => x.classList.toggle("on", x === b));
      render();
    });
    chips.appendChild(b);
  });
  document.getElementById("q").addEventListener("input", e => { state.q = e.target.value; render(); });
  document.getElementById("total").textContent = "（16種）";
  render();
})();
</script>
</body>
</html>
"""

    # スキンJSONを埋め込み（JavaScript用）
    skins_data = []
    for s in vol1_skins:
        skins_data.append({
            "id": s["id"],
            "label": s["label"],
            "desc": s["desc"],
            "cat": s["cat"],
            "font": s.get("font", ""),
            "type": s.get("type"),
            "colors": s["colors"],
            "shapes": s.get("shapes", ["circle", "circle"]),
            "locked": s.get("locked", False),
        })

    skins_json = json.dumps(skins_data, ensure_ascii=False, indent=2)
    # JSON内の</script>をエスケープ
    skins_json = skins_json.replace("</script>", "<\\/script>")

    cat_json = json.dumps(CAT, ensure_ascii=False)

    html = html.replace("__SKINS_JSON__", skins_json)
    html = html.replace("__CAT_JSON__", cat_json)

    out = "gallery/skins-vol1.html"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ {out} を書き出しました（{len(vol1_skins)}種）")


if __name__ == "__main__":
    main()
