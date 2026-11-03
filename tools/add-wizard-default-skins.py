#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library Wizard 定番CLIスキン追加スクリプト
#
# CLIを使う人々の定番機能にインスパイアされた Wizard スキンを追加。
# すべて acceptance conditions §9.3 準拠の cli オブジェクトを持つ。
#
# 追加対象:
#   wizard-grep   — 検索・ハイライト重視（黄色マーカー）
#   wizard-man    — マニュアル・ドキュメント閲覧（serifフォント）
#   wizard-sudo   — 管理者権限・警告色（赤アクセント）
#
# catalog/skins.json にマージして使用します。

import json
from datetime import datetime, timezone

NEW_SKINS = [
    {
        "id": "wizard-grep",
        "label": {
            "ja": "ウィザード・グレップ",
            "en": "Wizard Grep",
            "zh": "巫师搜索",
            "ko": "마법사 검색"
        },
        "desc": {
            "ja": "テキスト検索・マッチ強調・黄色マーカー",
            "en": "Text search, match highlight, yellow marker",
            "zh": "文本搜索，匹配高亮，黄色标记",
            "ko": "텍스트 검색, 일치 강조, 노란색 마커"
        },
        "cat": ["wizard", "fun", "access"],
        "font": "\\\"Courier New\\\",\\\"Courier\\\",monospace",
        "type": {
            "title": "\\\"Courier New\\\",monospace",
            "weight": "600",
            "lh": "1.3",
            "titleWeight": "700",
            "titleSpace": ".03em",
            "titleTransform": "uppercase",
            "mark": "grep"
        },
        "colors": {
            "stage": "#0a0a0a",
            "ink": "#f8f8f2",
            "don": "#ff79c6",
            "ka": "#bd93f9",
            "text": "#f8f8f2",
            "muted": "#6272a4",
            "bg": "#0a0a0a",
            "panel": "#1a1a2e",
            "field": "#0a0a0a",
            "button": "#1a1a2e",
            "accent": "#ffff00",
            "onAccent": "#000000",
            "gold": "#ffff00",
            "border": "rgba(255,255,0,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "saturate(1.4) contrast(1.2) brightness(.9)",
        "cli": {
            "font": "\\\"Courier New\\\",\\\"Courier\\\",monospace",
            "prompt": "?",
            "caret": "#ffff00",
            "scan": 0.10
        }
    },
    {
        "id": "wizard-man",
        "label": {
            "ja": "ウィザード・マン",
            "en": "Wizard Man",
            "zh": "巫师手册",
            "ko": "마법사 매뉴얼"
        },
        "desc": {
            "ja": "manページ・ドキュメント閲覧・serifフォント",
            "en": "man page, document viewing, serif font",
            "zh": "man页面，文档查看，衬线字体",
            "ko": "man 페이지, 문서 조회, 세리프 글꼴"
        },
        "cat": ["wizard", "life", "grad"],
        "font": "\\\"Trajan Pro\\\",\\\"Garamond\\\",serif",
        "type": {
            "title": "\\\"Trajan Pro\\\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f5f5f5",
            "ink": "#1a1a1a",
            "don": "#d4af37",
            "ka": "#8d6e63",
            "text": "#1a1a1a",
            "muted": "#cbb6ac",
            "bg": "#ffffff",
            "panel": "#f5f5f5",
            "field": "#ffffff",
            "button": "#e0e0e0",
            "accent": "#cbd5e1",
            "onAccent": "#000000",
            "gold": "#ffe082",
            "border": "rgba(203,213,225,.30)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.1) brightness(1.02)",
        "cli": {
            "font": "\\\"Trajan Pro\\\",\\\"Garamond\\\",serif",
            "prompt": ">",
            "caret": "#cbd5e1",
            "scan": 0.05
        }
    },
    {
        "id": "wizard-sudo",
        "label": {
            "ja": "ウィザード・スードー",
            "en": "Wizard Sudo",
            "zh": "巫师根权限",
            "ko": "마법사 루트"
        },
        "desc": {
            "ja": "root権限・警告色・赤アクセント",
            "en": "root permission, warning color, red accent",
            "zh": "root权限，警告色，红色强调",
            "ko": "root 권한, 경고색, 빨간색 강조"
        },
        "cat": ["wizard", "dark", "access"],
        "font": "\\\"Cascadia Mono\\\",\\\"Consolas\\\",monospace",
        "type": {
            "title": "\\\"Cascadia Mono\\\",monospace",
            "weight": "700",
            "lh": "1.25",
            "titleWeight": "900",
            "titleSpace": "-.03em",
            "titleTransform": "uppercase",
            "mark": "root"
        },
        "colors": {
            "stage": "#0a0a0a",
            "ink": "#f8f8f2",
            "don": "#ff0040",
            "ka": "#ff5555",
            "text": "#f8f8f2",
            "muted": "#ff79c6",
            "bg": "#0a0a0a",
            "panel": "#1a1a1a",
            "field": "#0a0a0a",
            "button": "#1a1a2e",
            "accent": "#ff0040",
            "onAccent": "#ffffff",
            "gold": "#ff5555",
            "border": "rgba(255,0,64,.35)"
        },
        "shapes": ["square", "diamond"],
        "locked": False,
        "video": "hue-rotate(0deg) saturate(1.5) contrast(1.3) brightness(.8)",
        "cli": {
            "font": "\\\"Cascadia Mono\\\",\\\"Consolas\\\",monospace",
            "prompt": "#",
            "caret": "#ff0040",
            "scan": 0.15
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
