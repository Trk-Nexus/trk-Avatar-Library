/* 見本ページ（gallery/pairings.html）の動き。2026-11-01・trk242 の「組み合わせ」と「設定の細分化」の試作。
   データは同じ HTML の中（<script id="typ" type="application/json">）から読みます。外部へは何もしません。
   書体は catalog/preview/ の見本用 woff2（各パックから見本の字だけ抜いたもの）を base64 で埋め込んでいます。 */
(function () {
  "use strict";
  var DATA = JSON.parse(document.getElementById("typ").textContent);
  var TYP = DATA.typography;
  var PREVIEW = {};                       /* "family|weight" → base64 の woff2 */
  DATA.previews.forEach(function (p) { PREVIEW[p.family + "|" + p.weight] = p.b64; });

  var ROLES = TYP.slots.map(function (s) { return s.id; });
  var ROLE_LABEL = {};
  TYP.slots.forEach(function (s) { ROLE_LABEL[s.id] = s.label; });
  var SCALE = {};
  TYP.scales.forEach(function (s) { SCALE[s.id] = s; });
  var RATIO = SCALE["1.25"];              /* 見本の初期値（TYP.scales の並びの 1.25 を使う） */
  TYP.scales.forEach(function (s) { if (s.id === "1.25") RATIO = s; });

  /* ---------- @font-face を組み立てる ---------- */
  var faces = [];
  Object.keys(PREVIEW).forEach(function (k) {
    var f = k.split("|");
    faces.push('@font-face{font-family:"trk-' + f[0] + "-" + f[1] + '";src:url(data:font/woff2;base64,' + PREVIEW[k] + ') format("woff2");font-display:swap;font-weight:' + f[1] + ';font-style:normal}');
  });
  var st = document.createElement("style");
  st.textContent = faces.join("\n");
  document.head.appendChild(st);

  function stack(family, weight) {
    var k = family + "|" + weight;
    var own = PREVIEW[k] ? '"trk-' + family + "-" + weight + '"' : "";
    return (own ? own + "," : "") + '"' + family + '",' + '"Hiragino Sans","Noto Sans JP",system-ui,sans-serif';
  }
  function hasPreview(family, weight) { return !!PREVIEW[family + "|" + weight]; }

  /* ---------- 1 組ぶんの見本（実物の書体で出す） ---------- */
  function specimen(p, opt) {
    opt = opt || {};
    var base = opt.base || 16;
    var scale = SCALE[String(p.scale)] || RATIO;
    var sizes = scale.sizes;
    var clamp = function (px, min, max) { return Math.max(min, Math.min(max, px)); };
    var out = ['<div class="spec">'];
    ROLES.forEach(function (role) {
      var s = p.slots[role];
      if (!s) return;
      var text = (p.sample || {})[role] || "";
      var size, cls = "r-" + role;
      if (role === "display") size = clamp(base * sizes.display, 18, 44);
      else if (role === "heading") size = clamp(base * sizes.heading, 14, 30);
      else if (role === "body") size = clamp(base * sizes.body, 12, 18);
      else if (role === "caption") size = clamp(base * sizes.caption, 10, 15);
      else if (role === "numeral") size = clamp(base * sizes.heading, 13, 22);
      else size = clamp(base * sizes.body, 12, 18);
      var track = (p.tracking && typeof p.tracking[role] === "number") ? p.tracking[role] : 0;
      var lead = (p.leading && typeof p.leading[role] === "number") ? p.leading[role] : 1.6;
      var weight = s.weight || 400;
      /* 差し色・数字は、同じ家族の見本が無ければ本文の家族で出す（字は同じ、雰囲気だけ近づける） */
      var fam = hasPreview(s.family, weight) ? s.family : (hasPreview(p.slots.body.family, p.slots.body.weight || 400) ? p.slots.body.family : s.family);
      var wt = hasPreview(s.family, weight) ? weight : 400;
      out.push('<p class="' + cls + '" style="font-family:' + stack(fam, wt) + ";font-weight:" + wt +
        ";font-size:" + size.toFixed(1) + "px;letter-spacing:" + track + "em;line-height:" + lead + '">' +
        escapeHtml(text) + (hasPreview(s.family, weight) ? "" : '<span class="fake" title="この書体の見本は埋め込んでいません（アプリに入れると本物になります）">見本外</span>') + "</p>");
    });
    out.push("</div>");
    return out.join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; });
  }

  /* ---------- 組み合わせのカード ---------- */
  var cards = document.getElementById("cards");
  TYP.pairings.forEach(function (p, i) {
    var scale = SCALE[String(p.scale)];
    var fams = {};
    ROLES.forEach(function (r) { if (p.slots[r]) fams[p.slots[r].family + " " + (p.slots[r].weight || 400)] = 1; });
    var chips = ROLES.filter(function (r) { return p.slots[r]; }).map(function (r) {
      var s = p.slots[r];
      return "<li><b>" + ROLE_LABEL[r] + "</b><span>" + escapeHtml(s.family) + " " + (s.weight || 400) + "</span></li>";
    }).join("");
    var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + escapeHtml(t) + "</span>"; }).join("");
    var html = '<article class="card" id="c-' + p.id + '">' +
      '<header><h3>' + escapeHtml(p.name) + '<small>#' + (i + 1) + "・倍率 " + p.scale + "（" + scale.label + "）</small></h3>" +
      '<p class="why">' + escapeHtml(p.why) + "</p>" +
      '<p class="use">どこで：' + escapeHtml(p.useFor) + "</p>" + tags + "</header>" +
      specimen(p) +
      '<details><summary>役ごとの設定（' + Object.keys(fams).length + " 家族）</summary><ul class=\"roles\">" + chips + "</ul>" +
      "<p class=\"packs\">パック：" + (p.packs || []).map(function (x) { return "<code>" + escapeHtml(x.replace("font-packs/", "").replace(".stpack", "")) + "</code>"; }).join(" ") + "</p></details>" +
      '<p class="tune"><button type="button" data-edit="' + p.id + '">この組み合わせをエディターで開く</button></p>' +
      "</article>";
    cards.insertAdjacentHTML("beforeend", html);
  });

  /* ---------- エディターの試作（役ごとに書体・倍率・字間・行間を変える） ---------- */
  var EMBEDDED = DATA.previews.map(function (p) { return p.family + " " + p.weight; });
  var edit = {
    id: TYP.pairings[0].id,
    base: 16,
    scale: String(TYP.pairings[0].scale),
    slots: clone(TYP.pairings[0].slots),
    tracking: clone(TYP.pairings[0].tracking || {}),
    leading: clone(TYP.pairings[0].leading || {}),
    sample: clone(TYP.pairings[0].sample)
  };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pairingById(id) { for (var i = 0; i < TYP.pairings.length; i++) if (TYP.pairings[i].id === id) return TYP.pairings[i]; return null; }

  var form = document.getElementById("form");
  var previewBox = document.getElementById("editSpecimen");
  var out = document.getElementById("exportJson");

  function renderForm() {
    var rows = ROLES.map(function (r) {
      var s = edit.slots[r];
      var opts = EMBEDDED.map(function (k) {
        var sel = (k === s.family + " " + s.weight) ? " selected" : "";
        return '<option value="' + k + '"' + sel + ">" + k + "</option>";
      }).join("");
      return "<tr><th>" + ROLE_LABEL[r] + "</th>" +
        '<td><select data-role="' + r + '" data-k="font">' + opts + "</select></td>" +
        '<td><input type="number" data-role="' + r + '" data-k="track" min="-0.05" max="0.2" step="0.01" value="' + (edit.tracking[r] !== undefined ? edit.tracking[r] : 0) + '"></td>' +
        '<td><input type="number" data-role="' + r + '" data-k="lead" min="0.9" max="2.4" step="0.05" value="' + (edit.leading[r] !== undefined ? edit.leading[r] : 1.6) + '"></td>' +
        "</tr>";
    }).join("");
    var scales = TYP.scales.map(function (s) {
      return '<option value="' + s.id + '"' + (String(s.id) === String(edit.scale) ? " selected" : "") + ">" + s.label + "（" + s.sizes.display + "）</option>";
    }).join("");
    form.innerHTML = "<table><thead><tr><th>役</th><th>書体（見本に入っているもの）</th><th>字間 em</th><th>行間</th></tr></thead><tbody>" +
      rows + "</tbody></table>" +
      '<div class="global"><label>基本サイズ <input id="gBase" type="number" min="10" max="28" step="1" value="' + edit.base + '"> px</label>' +
      '<label>倍率 <select id="gScale">' + scales + "</select></label>" +
      '<button type="button" id="gReset">この組の元の値に戻す</button>' +
      '<button type="button" id="gExport">設定を JSON で書き出す</button></div>';
  }

  function currentPairing() {
    return {
      id: edit.id, name: (pairingById(edit.id) || {}).name || "カスタム",
      scale: edit.scale, slots: edit.slots, tracking: edit.tracking,
      leading: edit.leading, sample: edit.sample
    };
  }

  function renderPreview() {
    previewBox.innerHTML = specimen(currentPairing(), { base: edit.base });
  }

  /* 書き出す形（trk-PWA の返事13 §3 で合意した形）。
     ・`size` は入れない（大きさは base と scale から決める＝出どころを 1 つに）
     ・`preset` は**利用者の段階**（one／pair／roles／digits）で、この試作はいちばん細かい roles
     ・`pack` は覚え書き（無くても動く） */
  function renderOut() {
    var slots = {};
    ROLES.forEach(function (r) {
      var s = edit.slots[r];
      slots[r] = {
        family: s.family, weight: s.weight || 400,
        tracking: edit.tracking[r] !== undefined ? edit.tracking[r] : 0,
        leading: edit.leading[r] !== undefined ? edit.leading[r] : 1.6
      };
      if (s.pack) slots[r].pack = s.pack;
    });
    var obj = {
      format: "trk-typography", version: 1,
      pairing: edit.id, preset: "roles", base: edit.base, scale: String(edit.scale), slots: slots
    };
    out.textContent = JSON.stringify(obj, null, 2);
  }

  function renderAll() { renderForm(); renderPreview(); renderOut(); }

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "gBase") { edit.base = Math.max(10, Math.min(28, Number(t.value) || 16)); renderPreview(); renderOut(); return; }
    if (t.id === "gScale") { edit.scale = t.value; renderPreview(); renderOut(); return; }
    if (!t.dataset || !t.dataset.role) return;
    var r = t.dataset.role;
    if (t.dataset.k === "font") {
      var parts = t.value.split(" ");
      var w = Number(parts.pop());
      edit.slots[r] = { pack: edit.slots[r].pack, family: parts.join(" "), weight: w };
    } else if (t.dataset.k === "track") {
      edit.tracking[r] = Number(t.value) || 0;
    } else if (t.dataset.k === "lead") {
      edit.leading[r] = Number(t.value) || 1.6;
    }
    renderPreview(); renderOut();
  });

  document.addEventListener("change", function (e) {
    if (e.target.id === "gScale") { edit.scale = e.target.value; renderPreview(); renderOut(); }
  });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.edit) {
      var p = pairingById(t.dataset.edit);
      if (!p) return;
      edit = { id: p.id, base: 16, scale: String(p.scale), slots: clone(p.slots), tracking: clone(p.tracking || {}), leading: clone(p.leading || {}), sample: clone(p.sample) };
      renderAll();
      document.getElementById("editor").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (t.id === "gReset") {
      var q = pairingById(edit.id);
      if (q) { edit.slots = clone(q.slots); edit.tracking = clone(q.tracking || {}); edit.leading = clone(q.leading || {}); edit.scale = String(q.scale); edit.base = 16; renderAll(); }
      return;
    }
    if (t.id === "gExport") {
      out.hidden = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(out.textContent).then(function () {
          t.textContent = "コピーしました";
          setTimeout(function () { t.textContent = "設定を JSON で書き出す"; }, 1400);
        }, function () {});
      }
    }
    if (t.dataset && t.dataset.jump) {
      var el = document.querySelector(t.dataset.jump);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* ---------- 倍率の早見（倍率を切り替えると 4 段の大きさが変わる） ---------- */
  var ratioBox = document.getElementById("ratioDemo");
  var ratioSel = document.getElementById("ratio");
  function paintRatio() {
    var s = SCALE[ratioSel.value] || RATIO;
    ratioBox.innerHTML = ["display", "heading", "body", "caption"].map(function (r) {
      var px = (16 * s.sizes[r]);
      return '<div class="line"><span class="lbl">' + ROLE_LABEL[r] + " " + s.sizes[r] + "em</span>" +
        '<span style="font-size:' + px.toFixed(1) + 'px">文字の大きさ ' + Math.round(px) + "px</span></div>";
    }).join("");
  }
  if (ratioSel) { ratioSel.addEventListener("change", paintRatio); paintRatio(); }

  renderAll();
})();
