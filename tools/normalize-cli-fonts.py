#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# すべてのスキンの cli.font を正規化（クォート・バックスラッシュ除去）
# そして muted のコントラストを4.5:1以上に修正

import json
import re

with open("catalog/skins.json", encoding="utf-8") as f:
    data = json.load(f)

# cli.font からクォートとバックスラッシュを除去
font_fixed = []
for s in data["skins"]:
    cli = s.get("cli")
    if cli and "font" in cli:
        original = cli["font"]
        # クォートとバックスラッシュを除去
        cleaned = original.replace('\\"', '').replace('"', '').replace('\\', '')
        if cleaned != original:
            cli["font"] = cleaned
            font_fixed.append(s["id"])

# muted のコントラスト修正（4.5:1 以上を確保）
muted_fixes = {
    "wizard-grep": ("#bd93f9", "#1a1a2e", "#0a0a0a"),  # muted, panel, field
    "wizard-man": ("#7b1fa2", "#f5f5f5", "#ffffff"),
    "wizard-sudo": ("#ff79c6", "#1a1a1a", "#0a0a0a"),
}

muted_fixed = []
for sid, (muted, panel, field) in muted_fixes.items():
    for s in data["skins"]:
        if s["id"] == sid:
            s["colors"]["muted"] = muted
            s["colors"]["panel"] = panel
            s["colors"]["field"] = field
            muted_fixed.append(sid)
            print(f"Fixed muted for {sid}: muted={muted}, panel={panel}, field={field}")
            break

with open("catalog/skins.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"cli.font 正規化: {len(font_fixed)} 件 ({font_fixed})")
print(f"muted コントラスト修正: {len(muted_fixed)} 件 ({muted_fixed})")
