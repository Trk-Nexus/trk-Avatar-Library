#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library スキン vol.10 一括生成スクリプト
#
# vol.10: 建築・都市・インテリア (Architecture & City) — 16種
#   テーマ: 「建築・都市・インテリア」
#   アールデコ、ブルータリズム、ゴシック大聖堂、禅寺、東京ナイト、
#   パリカフェ、ニューヨーク地下鉄、ヴェネチア運河、京都町家、
#   砂漠モスク、アイスホテル、ツリーハウス、灯台、風車、時計塔、
#   竹林などをモチーフ。
#   建築の質感と都市の雰囲気を重視した配色に設計。
#
# catalog/skins.json にマージして使用します。

import json
from datetime import datetime, timezone

VOL10_IDS = [
    "art-deco", "brutalist", "gothic-cathedral", "zen-temple",
    "tokyo-night", "paris-cafe", "new-york-subway", "venice-canal",
    "kyoto-machiya", "desert-mosque", "ice-hotel", "tree-house",
    "lighthouse", "windmill", "clock-tower", "bamboo-forest",
]

VOL10_SKINS = [
    {
        "id": "art-deco",
        "label": {
            "ja": "アールデコ",
            "en": "Art Deco",
            "zh": "装饰艺术",
            "ko": "아르데코"
        },
        "desc": {
            "ja": "幾何学的黄金時代、ゴージャスでモダンな装飾",
            "en": "Geometric golden age, gorgeous and modern ornament",
            "zh": "几何学黄金时代，华丽而现代的装饰",
            "ko": "기하학적 황금기, 화려하고 현대적인 장식"
        },
        "cat": ["grad", "fun", "light"],
        "font": "\"Trajan Pro\",\"Papyrus\",fantasy",
        "type": {
            "title": "\"Trajan Pro\",fantasy",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".05em",
            "titleTransform": "uppercase",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "linear-gradient(180deg,#d4af37,#b8860b,#8b4513)",
            "ink": "#fffdf0",
            "don": "#ffd700",
            "ka": "#bdc3c7",
            "text": "#fffdf0",
            "muted": "#a08c5a",
            "bg": "linear-gradient(180deg,#5c4033,#3e2723)",
            "panel": "rgba(139,69,19,.96)",
            "field": "#8b4513",
            "button": "#a0522d",
            "accent": "#ffd700",
            "onAccent": "#3e2723",
            "gold": "#ffe082",
            "border": "rgba(212,175,55,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "sepia(.3) saturate(1.2) brightness(1.02) contrast(1.1)"
    },
    {
        "id": "brutalist",
        "label": {
            "ja": "ブルータリズム",
            "en": "Brutalist",
            "zh": "粗野主义",
            "ko": "브루탈리즘"
        },
        "desc": {
            "ja": "コンクリートの無骨さ、素材そのままの質感",
            "en": "Roughness of concrete, raw material texture",
            "zh": "混凝土的粗犷，原材料质感",
            "ko": "콘크리트의 투박함, 원재료 그대로의 질감"
        },
        "cat": ["dark", "access"],
        "font": "\"Oswald\",\"Rajdhani\",sans-serif",
        "type": {
            "title": "\"Oswald\",sans-serif",
            "weight": "700",
            "lh": "1.3",
            "titleWeight": "800",
            "titleSpace": "-.02em",
            "titleTransform": "uppercase",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#4a4a4a",
            "ink": "#e0e0e0",
            "don": "#95a5a6",
            "ka": "#7f8c8d",
            "text": "#e0e0e0",
            "muted": "#7f8c8d",
            "bg": "#2c2c2c",
            "panel": "rgba(44,44,44,.98)",
            "field": "#3a3a3a",
            "button": "#4a4a4a",
            "accent": "#95a5a6",
            "onAccent": "#ffffff",
            "gold": "#bdc3c7",
            "border": "rgba(189,195,199,.20)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "grayscale(.8) contrast(1.15) brightness(.9)"
    },
    {
        "id": "gothic-cathedral",
        "label": {
            "ja": "ゴシック大聖堂",
            "en": "Gothic Cathedral",
            "zh": "哥特式大教堂",
            "ko": "고딕 대성당"
        },
        "desc": {
            "ja": "ステンドグラス、高天井と神秘的な光",
            "en": "Stained glass, high ceiling and mystical light",
            "zh": "彩色玻璃，高天井与神秘光芒",
            "ko": "스테인드글라스, 높은 천장과 신비로운 빛"
        },
        "cat": ["dark", "grad"],
        "font": "\"Trajan Pro\",\"Garamond\",serif",
        "type": {
            "title": "\"Trajan Pro\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#1a1a2e",
            "ink": "#e0d8f0",
            "don": "#bb86fc",
            "ka": "#74b9ff",
            "text": "#e0d8f0",
            "muted": "#8a7aaa",
            "bg": "#0d0b1e",
            "panel": "rgba(13,11,30,.97)",
            "field": "#1a1a2e",
            "button": "#2a163e",
            "accent": "#bb86fc",
            "onAccent": "#0d0b1e",
            "gold": "#ccd6f6",
            "border": "rgba(187,134,252,.28)"
        },
        "shapes": ["circle", "diamond"],
        "locked": False,
        "video": "hue-rotate(260deg) saturate(1.2) brightness(.9) contrast(1.1)"
    },
    {
        "id": "zen-temple",
        "label": {
            "ja": "禅寺",
            "en": "Zen Temple",
            "zh": "禅寺",
            "ko": "선사"
        },
        "desc": {
            "ja": "枯山水、静寂と和の情緒",
            "en": "Karesansui, silence and Japanese emotion",
            "zh": "枯山水，寂静与日本情感",
            "ko": "건산수, 정적과 일본 정서"
        },
        "cat": ["light", "life"],
        "font": "\"Hiragino Mincho ProN\",\"Yu Mincho\",\"YuMincho\",\"Noto Serif JP\",serif",
        "type": {
            "title": "\"Hiragino Mincho ProN\",serif",
            "weight": "400",
            "lh": "1.75",
            "titleWeight": "600",
            "titleSpace": ".1em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f3f4f6",
            "ink": "#1a202c",
            "don": "#d4af37",
            "ka": "#4a5d6a",
            "text": "#1a202c",
            "muted": "#718096",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#e2e8f0",
            "accent": "#d4af37",
            "onAccent": "#ffffff",
            "gold": "#f6e05e",
            "border": "rgba(26,32,44,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.1) brightness(1.02)"
    },
    {
        "id": "tokyo-night",
        "label": {
            "ja": "東京ナイト",
            "en": "Tokyo Night",
            "zh": "东京之夜",
            "ko": "도쿄 밤"
        },
        "desc": {
            "ja": "ネオンと雨の路地、都会の夜",
            "en": "Neon and rainy alley, city night",
            "zh": "霓虹和雨巷，都市之夜",
            "ko": "네온과 비 오는 골목길, 대도시 밤"
        },
        "cat": ["fun", "grad", "dark"],
        "font": "\"Orbitron\",\"Futura\",system-ui,sans-serif",
        "type": {
            "title": "\"Orbitron\",sans-serif",
            "weight": "700",
            "lh": "1.2",
            "titleWeight": "900",
            "titleSpace": "-.05em",
            "titleTransform": "uppercase",
            "mark": "TOKYO"
        },
        "colors": {
            "stage": "#0a0a1a",
            "ink": "#00ffff",
            "don": "#ff00ff",
            "ka": "#ff0040",
            "text": "#00ffff",
            "muted": "#404060",
            "bg": "#000000",
            "panel": "rgba(10,10,26,.98)",
            "field": "#0a0a1a",
            "button": "#1a1a2a",
            "accent": "#00ffff",
            "onAccent": "#000000",
            "gold": "#ffff00",
            "border": "rgba(0,255,255,.30)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "hue-rotate(180deg) saturate(1.6) brightness(.75) contrast(1.3)"
    },
    {
        "id": "paris-cafe",
        "label": {
            "ja": "パリカフェ",
            "en": "Paris Cafe",
            "zh": "巴黎咖啡厅",
            "ko": "파리 카페"
        },
        "desc": {
            "ja": "テラス席とエッフェル塔、優雅な午後",
            "en": "Terrace seats and Eiffel Tower, elegant afternoon",
            "zh": "露台座位和埃菲尔铁塔，优雅的下午",
            "ko": "테라스席과 에펠탑, 우아한 오후"
        },
        "cat": ["light", "life"],
        "font": "\"Playfair Display\",\"Noto Serif JP\",serif",
        "type": {
            "title": "\"Playfair Display\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f5e6d3",
            "ink": "#4a3728",
            "don": "#d4af37",
            "ka": "#8c9eac",
            "text": "#4a3728",
            "muted": "#8c8074",
            "bg": "#ffe082",
            "panel": "rgba(255,255,255,.96)",
            "field": "#fffef5",
            "button": "#e8dec7",
            "accent": "#d4af37",
            "onAccent": "#4a3728",
            "gold": "#ffe082",
            "border": "rgba(140,158,172,.20)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.2) saturate(1.05) brightness(1.03)"
    },
    {
        "id": "new-york-subway",
        "label": {
            "ja": "ニューヨーク地下鉄",
            "en": "New York Subway",
            "zh": "纽约地铁",
            "ko": "뉴욕 지하철"
        },
        "desc": {
            "ja": "タイルと電車の音、都会の鼓動",
            "en": "Tiles and train sounds, urban pulse",
            "zh": "瓷砖和火车声，都市脉搏",
            "ko": "타일과 전차 소리, 대도시 맥박"
        },
        "cat": ["dark", "fun"],
        "font": "\"Impact\",\"Haettenschweiler\",sans-serif",
        "type": {
            "title": "\"Impact\",sans-serif",
            "weight": "900",
            "lh": "1.1",
            "titleWeight": "900",
            "titleSpace": "-.05em",
            "titleTransform": "uppercase",
            "mark": "NYC"
        },
        "colors": {
            "stage": "#2c3e50",
            "ink": "#f0f0f0",
            "don": "#e74c3c",
            "ka": "#3498db",
            "text": "#f0f0f0",
            "muted": "#7f8c8d",
            "bg": "#1a252f",
            "panel": "rgba(26,37,47,.97)",
            "field": "#2c3e50",
            "button": "#3a4a5a",
            "accent": "#3498db",
            "onAccent": "#ffffff",
            "gold": "#f1c40f",
            "border": "rgba(52,152,219,.24)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.15) brightness(.9)"
    },
    {
        "id": "venice-canal",
        "label": {
            "ja": "ヴェネチア運河",
            "en": "Venice Canal",
            "zh": "威尼斯运河",
            "ko": "베네치아 운하"
        },
        "desc": {
            "ja": "水路とゴンドラ、水の都の情景",
            "en": "Waterways and gondola, city of water scenery",
            "zh": "水道和贡多拉，水都情景",
            "ko": "수로와 곤돌라, 물의 도시 풍경"
        },
        "cat": ["light", "grad"],
        "font": "\"Garamond\",\"Baskerville\",serif",
        "type": {
            "title": "\"Garamond\",serif",
            "weight": "400",
            "lh": "1.65",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#2a4d69",
            "ink": "#fdf5e6",
            "don": "#d4af37",
            "ka": "#4ecdc4",
            "text": "#fdf5e6",
            "muted": "#5d8aa8",
            "bg": "#1a3a5a",
            "panel": "rgba(26,58,90,.96)",
            "field": "#2a4d69",
            "button": "#3a5d79",
            "accent": "#4ecdc4",
            "onAccent": "#1a3a5a",
            "gold": "#ffe082",
            "border": "rgba(78,205,196,.28)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.1) brightness(1.02)"
    },
    {
        "id": "kyoto-machiya",
        "label": {
            "ja": "京都町家",
            "en": "Kyoto Machiya",
            "zh": "京都町家",
            "ko": "쿄토 정가"
        },
        "desc": {
            "ja": "格子と坪庭、和の町並み",
            "en": "Lattice and tsuboniwa, Japanese townscape",
            "zh": "格子和坪庭，和风街道",
            "ko": "격자와 츠보니와, 와풍 거리"
        },
        "cat": ["light", "life"],
        "font": "\"Hiragino Kaku Gothic ProN\",\"Hiragino Sans\",sans-serif",
        "type": {
            "title": "\"Hiragino Kaku Gothic ProN\",sans-serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".02em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f5f5dc",
            "ink": "#2c241d",
            "don": "#a5522e",
            "ka": "#4a5d6a",
            "text": "#2c241d",
            "muted": "#8c8074",
            "bg": "#faf7f2",
            "panel": "rgba(255,254,248,.97)",
            "field": "#ffffff",
            "button": "#eae4d9",
            "accent": "#a5522e",
            "onAccent": "#f4f1ea",
            "gold": "#b8860b",
            "border": "rgba(44,36,29,.15)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "sepia(.18) brightness(1.01)"
    },
    {
        "id": "desert-mosque",
        "label": {
            "ja": "砂漠モスク",
            "en": "Desert Mosque",
            "zh": "沙漠清真寺",
            "ko": "사막 모스크"
        },
        "desc": {
            "ja": "砂色とミナレット、砂漠の聖域",
            "en": "Sand color and minaret, desert sanctuary",
            "zh": "沙色和宣礼塔，沙漠圣域",
            "ko": "모래색과 미나레트, 사막 성역"
        },
        "cat": ["light", "grad"],
        "font": "\"Trajan Pro\",\"Garamond\",serif",
        "type": {
            "title": "\"Trajan Pro\",serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f4a460",
            "ink": "#4a3728",
            "don": "#d4af37",
            "ka": "#8c9eac",
            "text": "#4a3728",
            "muted": "#cd853f",
            "bg": "#deb887",
            "panel": "rgba(255,255,255,.96)",
            "field": "#fffef5",
            "button": "#e8dec7",
            "accent": "#d4af37",
            "onAccent": "#4a3728",
            "gold": "#ffe082",
            "border": "rgba(205,133,63,.24)"
        },
        "shapes": ["circle", "diamond"],
        "locked": False,
        "video": "sepia(.25) saturate(1.1) brightness(1.02)"
    },
    {
        "id": "ice-hotel",
        "label": {
            "ja": "アイスホテル",
            "en": "Ice Hotel",
            "zh": "冰酒店",
            "ko": "아이스 호텔"
        },
        "desc": {
            "ja": "氷の部屋とオーロラ、北国の冷気",
            "en": "Ice room and aurora, northern cold air",
            "zh": "冰房和极光，北国冷气",
            "ko": "얼음 방과 오로라, 북극 냉기"
        },
        "cat": ["light", "grad", "access"],
        "font": "\"Rajdhani\",\"Oswald\",sans-serif",
        "type": {
            "title": "\"Rajdhani\",sans-serif",
            "weight": "400",
            "lh": "1.4",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#e0f7fa",
            "ink": "#006064",
            "don": "#b2ebf2",
            "ka": "#80deea",
            "text": "#006064",
            "muted": "#4db6ac",
            "bg": "#b2ebf2",
            "panel": "rgba(255,255,255,.97)",
            "field": "#ffffff",
            "button": "#e0f7fa",
            "accent": "#4db6ac",
            "onAccent": "#ffffff",
            "gold": "#fff9c4",
            "border": "rgba(77,182,172,.24)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "brightness(1.05) saturate(.9) contrast(1.02)"
    },
    {
        "id": "tree-house",
        "label": {
            "ja": "ツリーハウス",
            "en": "Tree House",
            "zh": "树屋",
            "ko": "트리 하우스"
        },
        "desc": {
            "ja": "木の上の家、緑と木の温もり",
            "en": "House on trees, green and wood warmth",
            "zh": "树上的房子，绿色与木头的温暖",
            "ko": "나무 위의 집, 초록과 나무의 온기"
        },
        "cat": ["life", "grad"],
        "font": "\"Comic Sans MS\",\"Cursive\",fantasy",
        "type": {
            "title": "\"Comic Sans MS\",cursive",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#4caf50",
            "ink": "#1b5e20",
            "don": "#ffab91",
            "ka": "#81c784",
            "text": "#1b5e20",
            "muted": "#66bb6a",
            "bg": "#c8e6c9",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#a5d6a7",
            "accent": "#81c784",
            "onAccent": "#ffffff",
            "gold": "#d4e157",
            "border": "rgba(46,125,50,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.15) brightness(1.05)"
    },
    {
        "id": "lighthouse",
        "label": {
            "ja": "灯台",
            "en": "Lighthouse",
            "zh": "灯塔",
            "ko": "등대"
        },
        "desc": {
            "ja": "灯台の光と海、夜道を照らす",
            "en": "Lighthouse light and sea, illuminating the night road",
            "zh": "灯塔的光和海，照亮夜路",
            "ko": "등대의 빛과 바다, 밤길을 비추는"
        },
        "cat": ["grad", "life"],
        "font": "\"Montserrat\",system-ui,sans-serif",
        "type": {
            "title": "\"Montserrat\",sans-serif",
            "weight": "400",
            "lh": "1.55",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "linear-gradient(180deg,#0a192f,#071a33)",
            "ink": "#ccd6f6",
            "don": "#ffd700",
            "ka": "#4ecdc4",
            "text": "#ccd6f6",
            "muted": "#4f5b7a",
            "bg": "linear-gradient(180deg,#071a33,#050c17)",
            "panel": "rgba(10,25,47,.96)",
            "field": "#0a192f",
            "button": "#16213e",
            "accent": "#ffd700",
            "onAccent": "#050c17",
            "gold": "#ffe082",
            "border": "rgba(255,215,0,.28)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "hue-rotate(200deg) saturate(1.2) brightness(.85) contrast(1.15)"
    },
    {
        "id": "windmill",
        "label": {
            "ja": "風車",
            "en": "Windmill",
            "zh": "风车",
            "ko": "풍차"
        },
        "desc": {
            "ja": "オランダ風車、牧草地と青空",
            "en": "Dutch windmill, pasture and blue sky",
            "zh": "荷兰风车，牧场和蓝天",
            "ko": "네덜란드 풍차, 목장과 파란 하늘"
        },
        "cat": ["light", "life"],
        "font": "\"Garamond\",\"Noto Serif JP\",serif",
        "type": {
            "title": "\"Garamond\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "600",
            "titleSpace": ".04em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#81c784",
            "ink": "#1b5e20",
            "don": "#ffd700",
            "ka": "#4ecdc4",
            "text": "#1b5e20",
            "muted": "#66bb6a",
            "bg": "#c8e6c9",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#a5d6a7",
            "accent": "#4ecdc4",
            "onAccent": "#ffffff",
            "gold": "#d4e157",
            "border": "rgba(46,125,50,.22)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "saturate(1.1) brightness(1.04)"
    },
    {
        "id": "clock-tower",
        "label": {
            "ja": "時計塔",
            "en": "Clock Tower",
            "zh": "钟楼",
            "ko": "시계탑"
        },
        "desc": {
            "ja": "ビッグベン、時を告げる鐘の音",
            "en": "Big Ben, bell sound telling time",
            "zh": "大笨钟，报时的钟声",
            "ko": "빅벤, 시간을 알려주는 종소리"
        },
        "cat": ["dark", "basic"],
        "font": "\"Caslon\",\"Garamond\",serif",
        "type": {
            "title": "\"Caslon\",serif",
            "weight": "400",
            "lh": "1.65",
            "titleWeight": "600",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#2c3e50",
            "ink": "#ecf0f1",
            "don": "#d4af37",
            "ka": "#bdc3c7",
            "text": "#ecf0f1",
            "muted": "#7f8c8d",
            "bg": "#1a252f",
            "panel": "rgba(26,37,47,.97)",
            "field": "#2c3e50",
            "button": "#3a4a5a",
            "accent": "#d4af37",
            "onAccent": "#1a252f",
            "gold": "#f1c40f",
            "border": "rgba(189,195,199,.20)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.2) contrast(1.1) brightness(.9)"
    },
    {
        "id": "bamboo-forest",
        "label": {
            "ja": "竹林",
            "en": "Bamboo Forest",
            "zh": "竹林",
            "ko": "대나무 숲"
        },
        "desc": {
            "ja": "京都の竹林、緑の階調と静寂",
            "en": "Kyoto bamboo forest, green gradient and silence",
            "zh": "京都竹林，绿色渐变与寂静",
            "ko": "교토 대나무 숲, 초록 농담과 정적"
        },
        "cat": ["light", "grad"],
        "font": "\"Hiragino Mincho ProN\",\"Yu Mincho\",\"YuMincho\",\"Noto Serif JP\",serif",
        "type": {
            "title": "\"Hiragino Mincho ProN\",serif",
            "weight": "400",
            "lh": "1.75",
            "titleWeight": "600",
            "titleSpace": ".1em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#81c784",
            "ink": "#1b5e20",
            "don": "#ffab91",
            "ka": "#4caf50",
            "text": "#1b5e20",
            "muted": "#66bb6a",
            "bg": "#c8e6c9",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#a5d6a7",
            "accent": "#4caf50",
            "onAccent": "#ffffff",
            "gold": "#d4e157",
            "border": "rgba(46,125,50,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.05) brightness(1.03)"
    },
]

def main():
    path = "catalog/skins.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data["skins"]}

    new_ids = []
    for skin in VOL10_SKINS:
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

    print(f"追加 vol.10: {new_ids}")
    print(f"追加数: {len(new_ids)}")
    print(f"総スキン数: {data['count']}")
    print(f"カテゴリ: {data['categories']}")
    print(f"タイプスキン: {data['typeSkins']}")

    return new_ids

if __name__ == "__main__":
    main()
