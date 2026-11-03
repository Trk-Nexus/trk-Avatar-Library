#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# Wizard 定番CLIスキンの修正スクリプト
# - cli.font からクォートを除去（§9.3 準拠）
# - muted のコントラストを4.5:1以上に修正

import json

with open("catalog/skins.json", encoding="utf-8") as f:
    data = json.load(f)

fixes = {
    "wizard-grep": {
        "cli.font": "Courier New, Courier, monospace",
        "colors.muted": "#bd93f9",  # 明るい紫（Dracula系）
    },
    "wizard-man": {
        "cli.font": "Trajan Pro, Garamond, serif",
        "colors.muted": "#7b1fa2",  # 白背景に対して4.5:1以上
    },
    "wizard-sudo": {
        "cli.font": "Cascadia Mono, Consolas, monospace",
    },
}

fixed = []
for sid, cols in fixes.items():
    for s in data["skins"]:
        if s["id"] == sid:
            for key, val in cols.items():
                if key.startswith("colors."):
                    c = key.split(".", 1)[1]
                    s["colors"][c] = val
                else:
                    s[key] = val
            fixed.append(sid)
            print(f"Fixed {sid}: {cols}")
            break

with open("catalog/skins.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Fixed {len(fixed)} skins: {fixed}")
