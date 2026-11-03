#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library Wizard 定番CLIスキン追加スクリプト（第2弾）
#
# CLIを使う人々の定番機能にインスパイアされた Wizard スキンを追加。
# すべて acceptance conditions §9.3 準拠の cli オブジェクトを持つ。
#
# 追加対象:
#   wizard-pipe   — パイプライン・フロー重視（青空・矢印・フロー感）
#   wizard-history — 履歴・タイムスタンプ重視（過去の呪文・タイムスタンプ）
#   wizard-tmux   — マルチペイン重視（画面分割・グリッド・ペイン操作）
#   wizard-nord   — 定番カラースキーム（Nord）Wizard風（青灰系・落ち着いた夜間モード）
#
# catalog/skins.json にマージして使用します。

import json
from datetime import datetime, timezone

NEW_SKINS = [
    {
        "id": "wizard-pipe",
        "label": {
            "ja": "ウィザード・パイプ",
            "en": "Wizard Pipe",
            "zh": "巫师管道",
            "ko": "마법사 파이프"
        },
        "desc": {
            "ja": "コマンドをつなぐ・矢印・フロー感",
            "en": "Connecting commands, arrows, flow",
            "zh": "连接命令，箭头，流程感",
            "ko": "명령어 연결, 화살표, 흐름감"
        },
        "cat": ["wizard", "fun", "grad"],
        "font": "Rajdhani, Oswald, sans-serif",
        "type": {
            "title": "Rajdhani, sans-serif",
            "weight": "600",
            "lh": "1.25",
            "titleWeight": "700",
            "titleSpace": "-.01em",
            "titleTransform": "",
            "mark": "→"
        },
        "colors": {
            "stage": "#050510",
            "ink": "#00ffff",
            "don": "#ff00ff",
            "ka": "#4a4a6a",
            "text": "#00ffff",
            "muted": "#88c0d0",
            "bg": "#05050a",
            "panel": "#0a0a1a",
            "field": "#0a0a10",
            "button": "#1a1a2a",
            "accent": "#00ffff",
            "onAccent": "#000000",
            "gold": "#ff00ff",
            "border": "rgba(0,255,255,.35)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "hue-rotate(200deg) saturate(1.6) brightness(.75) contrast(1.3)",
        "cli": {
            "font": "Rajdhani, Oswald, sans-serif",
            "prompt": "→",
            "caret": "#00ffff",
            "scan": 0.12
        }
    },
    {
        "id": "wizard-history",
        "label": {
            "ja": "ウィザード・ヒストリー",
            "en": "Wizard History",
            "zh": "巫师历史",
            "ko": "마법사 기록"
        },
        "desc": {
            "ja": "コマンド履歴・過去の呪文・タイムスタンプ",
            "en": "Command history, past spells, timestamps",
            "zh": "命令历史，过去的咒语，时间戳",
            "ko": "명령어 기록, 과거 주문, 타임스탬프"
        },
        "cat": ["wizard", "life", "dark"],
        "font": "Courier New, Courier, monospace",
        "type": {
            "title": "Courier New, monospace",
            "weight": "400",
            "lh": "1.4",
            "titleWeight": "600",
            "titleSpace": "0",
            "titleTransform": "",
            "mark": "@"
        },
        "colors": {
            "stage": "#00000a",
            "ink": "#80deea",
            "don": "#4db6ac",
            "ka": "#4a4a6a",
            "text": "#80deea",
            "muted": "#4db6ac",
            "bg": "#000005",
            "panel": "#0a0a15",
            "field": "#00000a",
            "button": "#0a0a2a",
            "accent": "#80deea",
            "onAccent": "#000000",
            "gold": "#b2ebf2",
            "border": "rgba(128,222,234,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "brightness(1.05) saturate(.9) contrast(1.02)",
        "cli": {
            "font": "Courier New, Courier, monospace",
            "prompt": "@",
            "caret": "#80deea",
            "scan": 0.10
        }
    },
    {
        "id": "wizard-tmux",
        "label": {
            "ja": "ウィザード・ティムックス",
            "en": "Wizard Tmux",
            "zh": "巫师分屏",
            "ko": "마법사 다중창"
        },
        "desc": {
            "ja": "画面分割・グリッド・ペイン操作",
            "en": "Screen split, grid, pane operation",
            "zh": "屏幕分割，网格，窗格操作",
            "ko": "화면 분할, 그리드, 창 분할 조작"
        },
        "cat": ["wizard", "fun", "access"],
        "font": "JetBrains Mono, monospace",
        "type": {
            "title": "JetBrains Mono, monospace",
            "weight": "600",
            "lh": "1.3",
            "titleWeight": "700",
            "titleSpace": "-.02em",
            "titleTransform": "",
            "mark": "+"
        },
        "colors": {
            "stage": "#272822",
            "ink": "#f8f8f2",
            "don": "#f92672",
            "ka": "#a6e22e",
            "text": "#f8f8f2",
            "muted": "#75715e",
            "bg": "#272822",
            "panel": "#3e3d32",
            "field": "#272822",
            "button": "#3e3d32",
            "accent": "#f92672",
            "onAccent": "#ffffff",
            "gold": "#a6e22e",
            "border": "rgba(249,38,114,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "saturate(1.2) contrast(1.15) brightness(.95)",
        "cli": {
            "font": "JetBrains Mono, monospace",
            "prompt": "+",
            "caret": "#f92672",
            "scan": 0.08
        }
    },
    {
        "id": "wizard-nord",
        "label": {
            "ja": "ウィザード・ノルド",
            "en": "Wizard Nord",
            "zh": "巫师北欧",
            "ko": "마법사 노르딕"
        },
        "desc": {
            "ja": "青灰系・落ち着いた夜間モード",
            "en": "Blue-gray, calm night mode",
            "zh": "蓝灰色，平静的夜间模式",
            "ko": "청회색, 차분한 야간 모드"
        },
        "cat": ["wizard", "grad", "light"],
        "font": "JetBrains Mono, monospace",
        "type": {
            "title": "JetBrains Mono, monospace",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#2e3440",
            "ink": "#d8dee9",
            "don": "#88c0d0",
            "ka": "#81a1c1",
            "text": "#d8dee9",
            "muted": "#4c566a",
            "bg": "#2e3440",
            "panel": "#3b4252",
            "field": "#2e3440",
            "button": "#434c5e",
            "accent": "#88c0d0",
            "onAccent": "#2e3440",
            "gold": "#eceff4",
            "border": "rgba(136,192,208,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "saturate(.8) brightness(1.02)",
        "cli": {
            "font": "JetBrains Mono, monospace",
            "prompt": ">",
            "caret": "#88c0d0",
            "scan": 0.06
        }
    },
]

def main():
    path = "catalog/skins.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data["skins"]}

    added = []
    for skin in NEW_SKINS:
        if skin["id"] in existing_ids:
            print(f"スキップ（重複）: {skin['id']}")
            continue
        data["skins"].append(skin)
        existing_ids.add(skin["id"])
        added.append(skin["id"])

    # カテゴリカウントを再計算
    cat_count = {}
    type_count = 0
    for s in data["skins"]:
        for c in s["cat"]:
            cat_count[c] = cat_count.get(c, 0) + 1
        if "type" in s["cat"]:
            type_count += 1

    data["count"] = len(data["skins"])
    data["typeSkins"] = type_count
    data["categories"] = cat_count
    data["generatedAt"] = datetime.now(timezone.utc).isoformat()

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"追加: {added}")
    print(f"追加数: {len(added)}")
    print(f"総スキン数: {data['count']}")
    print(f"カテゴリ: {data['categories']}")
    print(f"タイプスキン: {data['typeSkins']}")

    return added

if __name__ == "__main__":
    main()
