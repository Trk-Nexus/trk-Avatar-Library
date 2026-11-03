#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# Wizard スキンのコントラスト修正スクリプト（第2弾）
# muted のコントラストを 4.5:1 以上に修正

import json

with open("catalog/skins.json", encoding="utf-8") as f:
    data = json.load(f)

# muted のコントラスト修正（4.5:1 以上を確保）
muted_fixes = {
    "wizard-tmux": {"muted": "#a6e22e", "panel": "#3e3d32", "field": "#272822"},
    "wizard-nord": {"muted": "#8fbcbb", "panel": "#3b4252", "field": "#2e3440"},
}

fixed = []
for sid, cols in muted_fixes.items():
    for s in data["skins"]:
        if s["id"] == sid:
            for c, v in cols.items():
                s["colors"][c] = v
            fixed.append(sid)
            print(f"Fixed {sid}: {cols}")
            break

with open("catalog/skins.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Fixed {len(fixed)} skins: {fixed}")
