#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library 実験スキン カテゴリ「wizard」一括生成スクリプト
#
# テーマ: 「Wizard / オカルト・神秘・呪術」
#   CLI・ターミナル、呪文、魔導書、ルーン文字、錬金術、
#   タロット、水晶占い、ヴォイド、エルドリッチ、ヘルメティック、
#   ネクロマンサーなど、汎用性を超えた自由度と実験的なUXを誇る。
#   geek/hacker側ではなく、Wizard側の視野からスキンを捉える。
#
# 既存vol枠（vol.1〜vol.10）やglitchカテゴリに収まらない実験スキンとして、
# volを跨いでカテゴリ「wizard」を個別に持つ。16種を1セットとする。
#
# catalog/skins.json にマージして使用します。

import json
from datetime import datetime, timezone

WIZARD_IDS = [
    "wizard-cli", "wizard-spell", "wizard-grimoire", "wizard-rune",
    "wizard-alchemy", "wizard-terminal", "wizard-cauldron", "wizard-crystal",
    "wizard-tarot", "wizard-void", "wizard-arcane", "wizard-eldritch",
    "wizard-seance", "wizard-ouija", "wizard-hermetic", "wizard-necromancer",
]

WIZARD_SKINS = [
    {
        "id": "wizard-cli",
        "label": {
            "ja": "ウィザードCLI",
            "en": "Wizard CLI",
            "zh": "巫师命令行",
            "ko": "마법사 CLI"
        },
        "desc": {
            "ja": "黒い端末に白い呪文、コマンドライン魔術",
            "en": "Black terminal with white spells, command line wizardry",
            "zh": "黑色终端上的白色咒语，命令行巫术",
            "ko": "검은 터미널의 하얀 주문, 명령줄 마법"
        },
        "cat": ["wizard", "dark", "access"],
        "font": "\\\"Courier New\\\",\\\"Courier\\\",monospace",
        "type": {
            "title": "\\\"Courier New\\\",monospace",
            "weight": "600",
            "lh": "1.3",
            "titleWeight": "700",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "> cast spell"
        },
        "colors": {
            "stage": "#0a0a0a",
            "ink": "#e0e0e0",
            "don": "#d4af37",
            "ka": "#666666",
            "text": "#e0e0e0",
            "muted": "#333333",
            "bg": "#050505",
            "panel": "rgba(5,5,5,.98)",
            "field": "#0a0a0a",
            "button": "#1a1a1a",
            "accent": "#d4af37",
            "onAccent": "#000000",
            "gold": "#ffffff",
            "border": "rgba(212,175,55,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.2) brightness(.85)"
    },
    {
        "id": "wizard-spell",
        "label": {
            "ja": "スペルキャスト",
            "en": "Spell Cast",
            "zh": "施法",
            "ko": "주문 시전"
        },
        "desc": {
            "ja": "呪文の発動エフェクト、光の粒子と轟音",
            "en": "Spell activation effect, particles of light and roar",
            "zh": "咒语发动效果，光之粒子与轰鸣",
            "ko": "주문 발동 이펙트, 빛의 입자와 굉음"
        },
        "cat": ["wizard", "fun", "grad"],
        "font": "\\\"Trajan Pro\\\",\\\"Papyrus\\\",fantasy",
        "type": {
            "title": "\\\"Trajan Pro\\\",fantasy",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "700",
            "titleSpace": ".08em",
            "titleTransform": "uppercase",
            "mark": "✦ CAST ✦"
        },
        "colors": {
            "stage": "#1a0a2e",
            "ink": "#ffd700",
            "don": "#bb86fc",
            "ka": "#74b9ff",
            "text": "#ffd700",
            "muted": "#4a2a6a",
            "bg": "#0f051a",
            "panel": "rgba(15,5,26,.97)",
            "field": "#1a0a2e",
            "button": "#2a1a3e",
            "accent": "#bb86fc",
            "onAccent": "#000000",
            "gold": "#ffe082",
            "border": "rgba(187,134,252,.35)"
        },
        "shapes": ["circle", "diamond"],
        "locked": False,
        "video": "hue-rotate(270deg) saturate(1.5) brightness(.85) contrast(1.2)"
    },
    {
        "id": "wizard-grimoire",
        "label": {
            "ja": "魔導書",
            "en": "Grimoire",
            "zh": "魔导书",
            "ko": "마도서"
        },
        "desc": {
            "ja": "古びた魔導書、革製表紙と金箔文字",
            "en": "Ancient grimoire, leather cover and gold foil lettering",
            "zh": "古旧魔导书，皮革封面与金箔文字",
            "ko": "낡은 마도서, 가죽 표지와 금박 글씨"
        },
        "cat": ["wizard", "life", "grad"],
        "font": "\\\"Trajan Pro\\\",\\\"Garamond\\\",\\\"Noto Serif JP\\\",serif",
        "type": {
            "title": "\\\"Trajan Pro\\\",serif",
            "weight": "400",
            "lh": "1.75",
            "titleWeight": "600",
            "titleSpace": ".05em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#3e2723",
            "ink": "#f5f5f5",
            "don": "#d4af37",
            "ka": "#8d6e63",
            "text": "#f5f5f5",
            "muted": "#795548",
            "bg": "#261411",
            "panel": "rgba(38,20,17,.97)",
            "field": "#3e2723",
            "button": "#5d4037",
            "accent": "#d4af37",
            "onAccent": "#000000",
            "gold": "#ffe082",
            "border": "rgba(212,175,55,.35)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.35) contrast(1.15) brightness(.9)"
    },
    {
        "id": "wizard-rune",
        "label": {
            "ja": "ルーン文字",
            "en": "Rune",
            "zh": "卢恩文字",
            "ko": "룬 문자"
        },
        "desc": {
            "ja": "北欧ルーン刻印、石板と氷の青",
            "en": "Nordic rune carving, stone tablet and ice blue",
            "zh": "北欧卢恩刻印，石板与冰蓝",
            "ko": "노르드 룬 문자 새김, 돌판과 얼음 파랑"
        },
        "cat": ["wizard", "dark", "access"],
        "font": "\\\"Cinzel\\\",\\\"Trajan Pro\\\",serif",
        "type": {
            "title": "\\\"Cinzel\\\",serif",
            "weight": "700",
            "lh": "1.4",
            "titleWeight": "800",
            "titleSpace": ".15em",
            "titleTransform": "uppercase",
            "mark": "ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ"
        },
        "colors": {
            "stage": "#0f172a",
            "ink": "#e2e8f0",
            "don": "#cbd5e1",
            "ka": "#64748b",
            "text": "#e2e8f0",
            "muted": "#475569",
            "bg": "#020617",
            "panel": "rgba(2,6,23,.98)",
            "field": "#0f172a",
            "button": "#1e293b",
            "accent": "#cbd5e1",
            "onAccent": "#000000",
            "gold": "#f8fafc",
            "border": "rgba(203,213,225,.30)"
        },
        "shapes": ["square", "diamond"],
        "locked": False,
        "video": "saturate(.6) contrast(1.25) brightness(.8)"
    },
    {
        "id": "wizard-alchemy",
        "label": {
            "ja": "錬金術",
            "en": "Alchemy",
            "zh": "炼金术",
            "ko": "연금술"
        },
        "desc": {
            "ja": "賢者の石、鉛から金への変容、錬金実験",
            "en": "Philosopher's stone, transmutation of lead to gold, alchemical experiment",
            "zh": "贤者之石，铅转化为金，炼金实验",
            "ko": "현자의 돌, 납에서 금으로의 변환, 연금술 실험"
        },
        "cat": ["wizard", "fun", "grad"],
        "font": "\\\"Caslon\\\",\\\"Garamond\\\",serif",
        "type": {
            "title": "\\\"Caslon\\\",serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "☿ ☽ ♀"
        },
        "colors": {
            "stage": "#4a2c2a",
            "ink": "#d4af37",
            "don": "#ffd700",
            "ka": "#8b4513",
            "text": "#d4af37",
            "muted": "#795548",
            "bg": "#2a1a15",
            "panel": "rgba(42,26,21,.97)",
            "field": "#4a2c2a",
            "button": "#5d4037",
            "accent": "#ffd700",
            "onAccent": "#000000",
            "gold": "#ffe082",
            "border": "rgba(212,175,55,.35)"
        },
        "shapes": ["circle", "square"],
        "locked": False,
        "video": "sepia(.4) saturate(1.2) contrast(1.15) brightness(.9)"
    },
    {
        "id": "wizard-terminal",
        "label": {
            "ja": "魔導ターミナル",
            "en": "Wizard Terminal",
            "zh": "巫师终端",
            "ko": "마법사 터미널"
        },
        "desc": {
            "ja": "琥珀色モノクロCRT、呪文のプロンプト",
            "en": "Amber monochrome CRT, spell prompt",
            "zh": "琥珀色单色CRT，咒语提示符",
            "ko": "호박색 단색 CRT, 주문 프롬프트"
        },
        "cat": ["wizard", "dark", "life"],
        "font": "\\\"Courier New\\\",\\\"Courier\\\",monospace",
        "type": {
            "title": "\\\"Courier New\\\",monospace",
            "weight": "500",
            "lh": "1.4",
            "titleWeight": "700",
            "titleSpace": "0",
            "titleTransform": "",
            "mark": "grimoire> _"
        },
        "colors": {
            "stage": "#1a1a00",
            "ink": "#ffbf00",
            "don": "#ccaa00",
            "ka": "#4a4a00",
            "text": "#ffbf00",
            "muted": "#554400",
            "bg": "#0a0a00",
            "panel": "rgba(10,10,0,.98)",
            "field": "#1a1a00",
            "button": "#2a2a00",
            "accent": "#ffbf00",
            "onAccent": "#000000",
            "gold": "#ffff99",
            "border": "rgba(255,191,0,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "sepia(.5) contrast(1.15) brightness(.85)"
    },
    {
        "id": "wizard-cauldron",
        "label": {
            "ja": "大釜",
            "en": "Cauldron",
            "zh": "大锅",
            "ko": "대솥"
        },
        "desc": {
            "ja": "魔女の大釜、泡立つ緑のポーション",
            "en": "Witch's cauldron, bubbling green potion",
            "zh": "女巫的大锅，冒泡的绿色药水",
            "ko": "마녀의 대솥, 끓는 녹색 포션"
        },
        "cat": ["wizard", "fun", "dark"],
        "font": "\\\"Comic Sans MS\\\",\\\"Cursive\\\",fantasy",
        "type": {
            "title": "\\\"Comic Sans MS\\\",cursive",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "🧪 BUBBLE"
        },
        "colors": {
            "stage": "#1b5e20",
            "ink": "#a5d6a7",
            "don": "#81c784",
            "ka": "#388e3c",
            "text": "#a5d6a7",
            "muted": "#66bb6a",
            "bg": "#0d3b0d",
            "panel": "rgba(13,59,13,.97)",
            "field": "#1b5e20",
            "button": "#2e7d32",
            "accent": "#81c784",
            "onAccent": "#000000",
            "gold": "#c8e6c9",
            "border": "rgba(129,199,132,.35)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "hue-rotate(100deg) saturate(1.3) contrast(1.1) brightness(.9)"
    },
    {
        "id": "wizard-crystal",
        "label": {
            "ja": "クリスタルボール",
            "en": "Crystal Ball",
            "zh": "水晶球",
            "ko": "크리스털 볼"
        },
        "desc": {
            "ja": "水晶占い、未来を映す球体と紫の霧",
            "en": "Crystal gazing, sphere reflecting the future and purple mist",
            "zh": "水晶占卜，映照未来的球体与紫色薄雾",
            "ko": "수정 구 점술, 미래를 비추는 구체와 보라색 안개"
        },
        "cat": ["wizard", "grad", "light"],
        "font": "\\\"Playfair Display\\\",\\\"Noto Serif JP\\\",serif",
        "type": {
            "title": "\\\"Playfair Display\\\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "あア漢 Aa"
        },
        "colors": {
            "stage": "#4a148c",
            "ink": "#e1bee7",
            "don": "#ce93d8",
            "ka": "#ba68c8",
            "text": "#e1bee7",
            "muted": "#8e24aa",
            "bg": "#311b92",
            "panel": "rgba(49,27,146,.96)",
            "field": "#4a148c",
            "button": "#7b1fa2",
            "accent": "#ce93d8",
            "onAccent": "#000000",
            "gold": "#f3e5f5",
            "border": "rgba(206,147,216,.35)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "hue-rotate(280deg) saturate(1.2) brightness(.9) contrast(1.1)"
    },
    {
        "id": "wizard-tarot",
        "label": {
            "ja": "タロット",
            "en": "Tarot",
            "zh": "塔罗牌",
            "ko": "타로"
        },
        "desc": {
            "ja": "タロットカード、運命のカードリーディング",
            "en": "Tarot cards, card reading of fate",
            "zh": "塔罗牌，命运的卡片占卜",
            "ko": "타로 카드, 운명의 카드 리딩"
        },
        "cat": ["wizard", "fun", "dark"],
        "font": "\\\"Trajan Pro\\\",\\\"Garamond\\\",serif",
        "type": {
            "title": "\\\"Trajan Pro\\\",serif",
            "weight": "400",
            "lh": "1.65",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "♰"
        },
        "colors": {
            "stage": "#1a1a2e",
            "ink": "#e0d8f0",
            "don": "#bb86fc",
            "ka": "#74b9ff",
            "text": "#e0d8f0",
            "muted": "#4a4a6a",
            "bg": "#0f0b1e",
            "panel": "rgba(15,11,30,.97)",
            "field": "#1a1a2e",
            "button": "#2a163e",
            "accent": "#bb86fc",
            "onAccent": "#0d0b1e",
            "gold": "#ccd6f6",
            "border": "rgba(187,134,252,.35)"
        },
        "shapes": ["diamond", "circle"],
        "locked": False,
        "video": "hue-rotate(260deg) saturate(1.2) brightness(.85) contrast(1.15)"
    },
    {
        "id": "wizard-void",
        "label": {
            "ja": "ヴォイド",
            "en": "Void",
            "zh": "虚空",
            "ko": "보이드"
        },
        "desc": {
            "ja": "虚無の空間、すべてを飲み込む黒",
            "en": "Void space, black that swallows everything",
            "zh": "虚空，吞噬一切的黑",
            "ko": "공허 공간, 모든 것을 삼키는 검정"
        },
        "cat": ["wizard", "dark", "access"],
        "font": "\\\"Rajdhani\\\",\\\"Oswald\\\",sans-serif",
        "type": {
            "title": "\\\"Rajdhani\\\",sans-serif",
            "weight": "700",
            "lh": "1.1",
            "titleWeight": "900",
            "titleSpace": "-.04em",
            "titleTransform": "uppercase",
            "mark": "Ø"
        },
        "colors": {
            "stage": "#000000",
            "ink": "#000000",
            "don": "#111111",
            "ka": "#0a0a0a",
            "text": "#000000",
            "muted": "#1a1a1a",
            "bg": "#000000",
            "panel": "rgba(0,0,0,.99)",
            "field": "#000000",
            "button": "#050505",
            "accent": "#1a1a1a",
            "onAccent": "#000000",
            "gold": "#2a2a2a",
            "border": "rgba(26,26,26,.20)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "brightness(.6) contrast(1.4)"
    },
    {
        "id": "wizard-arcane",
        "label": {
            "ja": "アーケイン",
            "en": "Arcane",
            "zh": "奥秘",
            "ko": "신비"
        },
        "desc": {
            "ja": "神秘の魔法陣、発光する古代文字",
            "en": "Mystic magic circle, glowing ancient script",
            "zh": "神秘魔法阵，发光的古代文字",
            "ko": "신비한 마법 진, 빛나는 고대 문자"
        },
        "cat": ["wizard", "fun", "grad"],
        "font": "\\\"Cinzel\\\",\\\"Trajan Pro\\\",serif",
        "type": {
            "title": "\\\"Cinzel\\\",serif",
            "weight": "700",
            "lh": "1.5",
            "titleWeight": "800",
            "titleSpace": ".1em",
            "titleTransform": "uppercase",
            "mark": "✧ ARCANE ✧"
        },
        "colors": {
            "stage": "#2d0a3e",
            "ink": "#00ffff",
            "don": "#ff00ff",
            "ka": "#74b9ff",
            "text": "#00ffff",
            "muted": "#4a2a6a",
            "bg": "#1a052e",
            "panel": "rgba(26,5,46,.97)",
            "field": "#2d0a3e",
            "button": "#3d154e",
            "accent": "#ff00ff",
            "onAccent": "#000000",
            "gold": "#00ffff",
            "border": "rgba(255,0,255,.35)"
        },
        "shapes": ["circle", "diamond"],
        "locked": False,
        "video": "hue-rotate(280deg) saturate(1.6) brightness(.8) contrast(1.3)"
    },
    {
        "id": "wizard-eldritch",
        "label": {
            "ja": "エルドリッチ",
            "en": "Eldritch",
            "zh": "异形",
            "ko": "엘드리트치"
        },
        "desc": {
            "ja": "クトゥルフ的異形、不可視の恐怖と深淵の緑",
            "en": "Eldritch abomination, invisible terror and abyssal green",
            "zh": "克苏鲁式异形，无形的恐怖与深渊之绿",
            "ko": "크툴루식 이형체, 불가시의 공포와 심연의 녹색"
        },
        "cat": ["wizard", "dark", "fun"],
        "font": "\\\"Cinzel\\\",\\\"Trajan Pro\\\",serif",
        "type": {
            "title": "\\\"Cinzel\\\",serif",
            "weight": "700",
            "lh": "1.4",
            "titleWeight": "800",
            "titleSpace": ".12em",
            "titleTransform": "uppercase",
            "mark": "∿"
        },
        "colors": {
            "stage": "#0d2a2a",
            "ink": "#4ecdc4",
            "don": "#45b7aa",
            "ka": "#2c7873",
            "text": "#4ecdc4",
            "muted": "#3a6b6b",
            "bg": "#061a1a",
            "panel": "rgba(6,26,26,.98)",
            "field": "#0d2a2a",
            "button": "#1d3a3a",
            "accent": "#4ecdc4",
            "onAccent": "#000000",
            "gold": "#a8e6cf",
            "border": "rgba(78,205,196,.35)"
        },
        "shapes": ["diamond", "square"],
        "locked": False,
        "video": "hue-rotate(180deg) saturate(1.3) contrast(1.2) brightness(.8)"
    },
    {
        "id": "wizard-seance",
        "label": {
            "ja": "降霊術",
            "en": "Seance",
            "zh": "降灵术",
            "ko": "강령술"
        },
        "desc": {
            "ja": "ろうそくの灯りと霊媒、あの世との対話",
            "en": "Candlelight and medium, dialogue with the other world",
            "zh": "蜡烛之光与降灵师，与另一个世界的对话",
            "ko": "초불과 영매, 저세상과의 대화"
        },
        "cat": ["wizard", "life", "dark"],
        "font": "\\\"Garamond\\\",\\\"Noto Serif JP\\\",serif",
        "type": {
            "title": "\\\"Garamond\\\",serif",
            "weight": "400",
            "lh": "1.75",
            "titleWeight": "600",
            "titleSpace": ".05em",
            "titleTransform": "",
            "mark": "🕯️"
        },
        "colors": {
            "stage": "#4a2c2a",
            "ink": "#ffe082",
            "don": "#d4af37",
            "ka": "#8d6e63",
            "text": "#ffe082",
            "muted": "#795548",
            "bg": "#2a1a15",
            "panel": "rgba(42,26,21,.96)",
            "field": "#4a2c2a",
            "button": "#5d4037",
            "accent": "#ffe082",
            "onAccent": "#000000",
            "gold": "#ffecb3",
            "border": "rgba(212,175,55,.30)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.45) brightness(1.05) contrast(1.1)"
    },
    {
        "id": "wizard-ouija",
        "label": {
            "ja": "ウィジャ板",
            "en": "Ouija",
            "zh": "灵派",
            "ko": "위자 보드"
        },
        "desc": {
            "ja": "ウィジャ盤面、文字と数字の円周配置",
            "en": "Ouija board, letters and numbers in circular layout",
            "zh": "灵派板面，字母和数字的圆周布置",
            "ko": "위자 보드, 알파벳과 숫자의 원형 배치"
        },
        "cat": ["wizard", "fun", "dark"],
        "font": "\\\"Trajan Pro\\\",\\\"Papyrus\\\",fantasy",
        "type": {
            "title": "\\\"Trajan Pro\\\",fantasy",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "600",
            "titleSpace": ".06em",
            "titleTransform": "uppercase",
            "mark": "YES NO"
        },
        "colors": {
            "stage": "#1a1a1a",
            "ink": "#f5f5f5",
            "don": "#e0e0e0",
            "ka": "#666666",
            "text": "#f5f5f5",
            "muted": "#333333",
            "bg": "#0f0f0f",
            "panel": "rgba(15,15,15,.97)",
            "field": "#1a1a1a",
            "button": "#2a2a2a",
            "accent": "#e0e0e0",
            "onAccent": "#000000",
            "gold": "#ffffff",
            "border": "rgba(224,224,224,.25)"
        },
        "shapes": ["circle", "square"],
        "locked": False,
        "video": "grayscale(.4) contrast(1.2) brightness(.85)"
    },
    {
        "id": "wizard-hermetic",
        "label": {
            "ja": "ヘルメティック",
            "en": "Hermetic",
            "zh": "赫密斯",
            "ko": "헤르메스"
        },
        "desc": {
            "ja": "ヘルメス主義、黄金の黄昏と秘教幾何学",
            "en": "Hermeticism, golden twilight and occult geometry",
            "zh": "赫密斯主义，金色黄昏与秘教几何",
            "ko": "헤르메스주의, 황금 황혼과 비밀 기하학"
        },
        "cat": ["wizard", "grad", "light"],
        "font": "\\\"Trajan Pro\\\",\\\"Caslon\\\",serif",
        "type": {
            "title": "\\\"Trajan Pro\\\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "☿"
        },
        "colors": {
            "stage": "#b8860b",
            "ink": "#fffdf0",
            "don": "#ffd700",
            "ka": "#d4af37",
            "text": "#fffdf0",
            "muted": "#a08c5a",
            "bg": "#5c4033",
            "panel": "rgba(92,64,51,.96)",
            "field": "#b8860b",
            "button": "#8b6508",
            "accent": "#ffd700",
            "onAccent": "#000000",
            "gold": "#ffe082",
            "border": "rgba(212,175,55,.35)"
        },
        "shapes": ["square", "circle"],
        "locked": False,
        "video": "sepia(.25) saturate(1.1) brightness(1.02)"
    },
    {
        "id": "wizard-necromancer",
        "label": {
            "ja": "ネクロマンサー",
            "en": "Necromancer",
            "zh": "死灵法师",
            "ko": "네크로맨서"
        },
        "desc": {
            "ja": "死霊術、墓場の土と腐敗の紫",
            "en": "Necromancy, graveyard soil and decayed purple",
            "zh": "死灵法术，墓地土壤与腐败紫",
            "ko": "네크로맨시, 묘지 토양과 부패한 보라색"
        },
        "cat": ["wizard", "dark", "fun"],
        "font": "\\\"Cinzel\\\",\\\"Trajan Pro\\\",serif",
        "type": {
            "title": "\\\"Cinzel\\\",serif",
            "weight": "700",
            "lh": "1.35",
            "titleWeight": "800",
            "titleSpace": ".08em",
            "titleTransform": "uppercase",
            "mark": "☠"
        },
        "colors": {
            "stage": "#1a1a1a",
            "ink": "#bb86fc",
            "don": "#d4af37",
            "ka": "#4a4a4a",
            "text": "#bb86fc",
            "muted": "#333333",
            "bg": "#0a0a0a",
            "panel": "rgba(10,10,10,.98)",
            "field": "#1a1a1a",
            "button": "#2a2a2a",
            "accent": "#bb86fc",
            "onAccent": "#000000",
            "gold": "#ffe082",
            "border": "rgba(187,134,252,.35)"
        },
        "shapes": ["square", "diamond"],
        "locked": False,
        "video": "hue-rotate(260deg) saturate(1.3) contrast(1.25) brightness(.8)"
    },
]

def main():
    path = "catalog/skins.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data["skins"]}

    new_ids = []
    for skin in WIZARD_SKINS:
        if skin["id"] in existing_ids:
            print(f"スキップ（重複）: {skin['id']}")
            continue
        data["skins"].append(skin)
        existing_ids.add(skin["id"])
        new_ids.append(skin["id"])

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

    print(f"追加 wizard: {new_ids}")
    print(f"追加数: {len(new_ids)}")
    print(f"総スキン数: {data['count']}")
    print(f"カテゴリ: {data['categories']}")
    print(f"タイプスキン: {data['typeSkins']}")

    return new_ids

if __name__ == "__main__":
    main()
