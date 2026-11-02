#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library スキン vol.1 生成スクリプト
# テーマ: 「夜の情景と光の色彩」 — 日本の夜の情景をモチーフにした16種類
# catalog/skins.json にマージして使用します。

import json
from datetime import datetime, timezone

SKINS_VOL1 = [
    {
        "id": "lanternAlley",
        "label": {
            "ja": "提灯横丁",
            "en": "Lantern Alley",
            "zh": "提灯横丁",
            "ko": "등불 골목"
        },
        "desc": {
            "ja": "暖かな提灯の光が並ぶ祭りの夜道",
            "en": "A festival night street lined with warm lantern lights",
            "zh": "暖暖提灯光排列的祭夜街道",
            "ko": "따뜻한 등불이 늘어선 축제 밤길"
        },
        "cat": ["life", "fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#2a1810,#0f0703)",
            "ink": "#fff4e6",
            "don": "#ff5a2e",
            "ka": "#46c2cb",
            "text": "#fff4e6",
            "muted": "#c9ad96",
            "bg": "linear-gradient(180deg,#0f0703,#060301)",
            "panel": "rgba(26,10,5,.95)",
            "field": "#1a0a05",
            "button": "#2a1810",
            "accent": "#ff5a2e",
            "onAccent": "#fff4e6",
            "gold": "#ffc861",
            "border": "rgba(255,90,46,.30)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.5) saturate(1.3) hue-rotate(-15deg) brightness(.7) contrast(1.2)"
    },
    {
        "id": "moonlitTerrace",
        "label": {
            "ja": "月光テラス",
            "en": "Moonlit Terrace",
            "zh": "月光露台",
            "ko": "달빛 테라스"
        },
        "desc": {
            "ja": "静かな月明かりの下、銀色に染まるテラス",
            "en": "A terrace dyed silver under quiet moonlight",
            "zh": "安静月光下，染成银色的露台",
            "ko": "조용한 달빛 아래 은빛으로 물든 테라스"
        },
        "cat": ["light", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#0d1b2a",
            "ink": "#e0e7ff",
            "don": "#ff8abf",
            "ka": "#7fd3c4",
            "text": "#e0e7ff",
            "muted": "#a8b8d0",
            "bg": "#0a1422",
            "panel": "rgba(10,20,34,.95)",
            "field": "#0d1b2a",
            "button": "#15263a",
            "accent": "#7fd3c4",
            "onAccent": "#050c14",
            "gold": "#c89bff",
            "border": "rgba(127,211,196,.25)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "grayscale(.3) hue-rotate(180deg) saturate(.8) brightness(.8) contrast(1.1)"
    },
    {
        "id": "fireflyValley",
        "label": {
            "ja": "蛍の谷",
            "en": "Firefly Valley",
            "zh": "萤火谷",
            "ko": "반딧불 계곡"
        },
        "desc": {
            "ja": "暗闇に浮かぶ緑と黄色の蛍の光",
            "en": "Green and yellow firefly lights floating in the dark",
            "zh": "黑暗中漂浮的绿色和黄色萤火虫光",
            "ko": "어둠에 떠 있는 초록과 노랑 반딧불 빛"
        },
        "cat": ["dark", "grad", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#050805,#000000)",
            "ink": "#d4f5c4",
            "don": "#ffd93d",
            "ka": "#6eff6e",
            "text": "#d4f5c4",
            "muted": "#8fb88f",
            "bg": "linear-gradient(180deg,#000000,#050805)",
            "panel": "rgba(0,8,0,.96)",
            "field": "#050805",
            "button": "#0a1c0a",
            "accent": "#6eff6e",
            "onAccent": "#000000",
            "gold": "#ffd93d",
            "border": "rgba(110,255,110,.30)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "grayscale(.4) hue-rotate(100deg) saturate(1.5) brightness(.5) contrast(1.3)"
    },
    {
        "id": "midnightCafe",
        "label": {
            "ja": "深夜喫茶",
            "en": "Midnight Cafe",
            "zh": "深夜咖啡厅",
            "ko": "심야 찻집"
        },
        "desc": {
            "ja": "コーヒーの香りと、ブラウンのやさしい夜",
            "en": "Coffee aroma and gentle brown night",
            "zh": "咖啡香气与温柔棕色之夜",
            "ko": "커피 향과 부드러운 브라운 밤"
        },
        "cat": ["life", "light"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#3e2723",
            "ink": "#efebe9",
            "don": "#ff7043",
            "ka": "#8d6e63",
            "text": "#efebe9",
            "muted": "#a1887f",
            "bg": "#4e342e",
            "panel": "rgba(62,39,35,.96)",
            "field": "#3e2723",
            "button": "#5d4037",
            "accent": "#ff7043",
            "onAccent": "#3e2723",
            "gold": "#d7ccc8",
            "border": "rgba(255,112,67,.28)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.4) saturate(1.1) brightness(.85) contrast(1.05)"
    },
    {
        "id": "snowyShrine",
        "label": {
            "ja": "雪の神社",
            "en": "Snowy Shrine",
            "zh": "雪之神社",
            "ko": "눈 신사"
        },
        "desc": {
            "ja": "白い雪に包まれた神社と、朱色の鳥居",
            "en": "A shrine wrapped in white snow, with a vermilion torii gate",
            "zh": "白雪包裹的神社与朱红鸟居",
            "ko": "흰 눈에 싸인 신사와 주홍색 도리이"
        },
        "cat": ["dark", "light", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#0f1a2e,#080d1a)",
            "ink": "#f3f4f6",
            "don": "#c73e3a",
            "ka": "#2c5f7c",
            "text": "#f3f4f6",
            "muted": "#a8b8c8",
            "bg": "linear-gradient(180deg,#080d1a,#04060d)",
            "panel": "rgba(15,26,46,.95)",
            "field": "#0f1a2e",
            "button": "#1c2a46",
            "accent": "#c73e3a",
            "onAccent": "#ffffff",
            "gold": "#f0c987",
            "border": "rgba(255,255,255,.20)"
        },
        "shapes": ["circle", "diamond"],
        "locked": False,
        "video": "grayscale(.5) contrast(1.15) brightness(.75)"
    },
    {
        "id": "autumnMaple",
        "label": {
            "ja": "紅葉の夜",
            "en": "Autumn Maple Night",
            "zh": "红叶之夜",
            "ko": "단풍밤"
        },
        "desc": {
            "ja": "赤と橙と黄色、夜に舞う紅葉のグラデ",
            "en": "Red, orange, and yellow autumn maple gradient dancing at night",
            "zh": "红、橙、黄，夜晚飞舞的红叶渐变",
            "ko": "빨강과 주황과 노랑, 밤에 춤추는 단풍 그라데이션"
        },
        "cat": ["grad", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#4a1515,#1a0a05)",
            "ink": "#fff1e0",
            "don": "#e0568a",
            "ka": "#a8b545",
            "text": "#fff1e0",
            "muted": "#8c6a5a",
            "bg": "linear-gradient(180deg,#1a0a05,#0d0502)",
            "panel": "rgba(74,21,21,.95)",
            "field": "#4a1515",
            "button": "#6b2a2a",
            "accent": "#e0568a",
            "onAccent": "#fff1e0",
            "gold": "#d9782a",
            "border": "rgba(224,86,120,.30)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.3) saturate(1.25) hue-rotate(-20deg) brightness(.7) contrast(1.2)"
    },
    {
        "id": "summerNight",
        "label": {
            "ja": "夏の夜風",
            "en": "Summer Night Breeze",
            "zh": "夏夜之风",
            "ko": "여름 밤바람"
        },
        "desc": {
            "ja": "打ち上げ花火と、ネオンのきらめく夜",
            "en": "Fireworks and neon glittering at night",
            "zh": "烟花与闪烁的霓虹之夜",
            "ko": "불꽃놀이와 반짝이는 네온 밤"
        },
        "cat": ["fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#050810,#000000)",
            "ink": "#ffffff",
            "don": "#ff3df0",
            "ka": "#3df0ff",
            "text": "#ffffff",
            "muted": "#8fa8bb",
            "bg": "linear-gradient(180deg,#000000,#050810)",
            "panel": "rgba(8,14,24,.95)",
            "field": "#060e18",
            "button": "#0b1826",
            "accent": "#3df0ff",
            "onAccent": "#032027",
            "gold": "#ff3df0",
            "border": "rgba(61,240,255,.28)"
        },
        "shapes": ["circle", "square"],
        "locked": False,
        "video": "grayscale(.2) hue-rotate(180deg) saturate(1.6) brightness(.65) contrast(1.3)"
    },
    {
        "id": "zenStone",
        "label": {
            "ja": "禅の石庭",
            "en": "Zen Stone Garden",
            "zh": "禅石庭",
            "ko": "선 돌정원"
        },
        "desc": {
            "ja": "白砂と黒石、静謐な禅の情景",
            "en": "White sand and black stones, a quiet Zen scene",
            "zh": "白沙与黑石，静谧的禅之情景",
            "ko": "白 모래와 검은 돌, 정적인 선 장면"
        },
        "cat": ["light", "access"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#e8e8e8",
            "ink": "#1c1c1c",
            "don": "#262626",
            "ka": "#8c8c8c",
            "text": "#1c1c1c",
            "muted": "#5c5c5c",
            "bg": "#ececec",
            "panel": "rgba(250,250,250,.97)",
            "field": "#f8f8f8",
            "button": "#e2e2e2",
            "accent": "#1c1c1c",
            "onAccent": "#ffffff",
            "gold": "#6e6e6e",
            "border": "rgba(40,40,40,.24)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "grayscale(1) contrast(1.1) brightness(1.05)"
    },
    {
        "id": "inkWash",
        "label": {
            "ja": "墨流し",
            "en": "Ink Wash Flow",
            "zh": "墨流し",
            "ko": "먹 흘림"
        },
        "desc": {
            "ja": "和紙に墨の濃淡、朱の判子だけの差し色",
            "en": "Ink wash on washi paper, with only a red seal as accent",
            "zh": "宣纸上的墨色浓淡，仅以朱印点缀",
            "ko": "한지 위의 먹 농담, 주인 한 점만 더한 색"
        },
        "cat": ["light", "type"],
        "font": "\"Hiragino Mincho ProN\",\"Yu Mincho\",\"YuMincho\",\"Noto Serif JP\",\"Noto Serif CJK JP\",\"Noto Serif SC\",\"Noto Serif KR\",serif",
        "type": {
            "title": "",
            "weight": "400",
            "lh": "1.75",
            "titleWeight": "600",
            "titleSpace": ".1em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f3efe6",
            "ink": "#1b1b1b",
            "don": "#1d1d1d",
            "ka": "#7d7a72",
            "text": "#1b1b1b",
            "muted": "#56534c",
            "bg": "#f3efe6",
            "panel": "#fbf8f1",
            "field": "#ffffff",
            "button": "#e7e1d3",
            "accent": "#b3261e",
            "onAccent": "#ffffff",
            "gold": "#8f3500",
            "border": "rgba(27,27,27,.25)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "grayscale(.6) contrast(1.05)"
    },
    {
        "id": "paperMoon",
        "label": {
            "ja": "紙月の夜",
            "en": "Paper Moon Night",
            "zh": "纸月之夜",
            "ko": "종이 달밤"
        },
        "desc": {
            "ja": "和紙の灯りと、やわらかな月の光",
            "en": "Washi paper light and soft moonlight",
            "zh": "和纸灯与柔和的月光",
            "ko": "와시 종이 불빛과 부드러운 달빛"
        },
        "cat": ["light", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#f4eee0",
            "ink": "#2b2620",
            "don": "#b5533c",
            "ka": "#5f7f8f",
            "text": "#2b2620",
            "muted": "#60584e",
            "bg": "#efe9dc",
            "panel": "#fbf8f1",
            "field": "#fffdf8",
            "button": "#e6dfd0",
            "accent": "#b5533c",
            "onAccent": "#fff8f0",
            "gold": "#a67c2e",
            "border": "rgba(60,45,30,.25)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.2) brightness(1.1) contrast(.95)"
    },
    {
        "id": "copperHour",
        "label": {
            "ja": "銅色の時",
            "en": "Copper Hour",
            "zh": "铜色时刻",
            "ko": "구리색 시간"
        },
        "desc": {
            "ja": "夕日に染まる銅色の空と、街の灯り",
            "en": "Copper-colored sky dyed by sunset and city lights",
            "zh": "夕阳染成的铜色天空与城市灯火",
            "ko": "노을로 물든 구리색 하늘과 도시 불빛"
        },
        "cat": ["grad", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#b87333,#4a1e1e)",
            "ink": "#fff7e0",
            "don": "#ff7043",
            "ka": "#8d6e63",
            "text": "#fff7e0",
            "muted": "#a1887f",
            "bg": "linear-gradient(180deg,#4a1e1e,#2a0f0f)",
            "panel": "rgba(184,115,51,.95)",
            "field": "#b87333",
            "button": "#8d4e2a",
            "accent": "#ff7043",
            "onAccent": "#2a0f0f",
            "gold": "#ffc861",
            "border": "rgba(255,112,67,.30)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.4) saturate(1.2) hue-rotate(-10deg) brightness(.8) contrast(1.1)"
    },
    {
        "id": "lavenderHill",
        "label": {
            "ja": "ラベンダーの丘",
            "en": "Lavender Hill",
            "zh": "薰衣草之丘",
            "ko": "라벤더 언덕"
        },
        "desc": {
            "ja": "紫色に包まれた丘と、静寂な夜",
            "en": "A hill wrapped in purple and a quiet night",
            "zh": "紫色包裹的山丘与寂静之夜",
            "ko": "보라색에 싸인 언덕과 고요한 밤"
        },
        "cat": ["light", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#e6e6fa,#d8bfd8)",
            "ink": "#4a4060",
            "don": "#c17ad8",
            "ka": "#9fd8ff",
            "text": "#4a4060",
            "muted": "#8a80a0",
            "bg": "linear-gradient(180deg,#f0e6ff,#e0d0e8)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#e8e0f0",
            "accent": "#c17ad8",
            "onAccent": "#4a4060",
            "gold": "#d8bfd8",
            "border": "rgba(193,122,216,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.05) brightness(1.05)"
    },
    {
        "id": "emeraldNight",
        "label": {
            "ja": "エメラルドの夜",
            "en": "Emerald Night",
            "zh": "翡翠之夜",
            "ko": "에메랄드 밤"
        },
        "desc": {
            "ja": "深い緑の宝石色、夜の海の底",
            "en": "Deep green jewel color, the bottom of the night sea",
            "zh": "深绿宝石色，夜海之底",
            "ko": "깊은 녹색 보석색, 밤바다 바닥"
        },
        "cat": ["dark", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#052028,#000609)",
            "ink": "#e6fbff",
            "don": "#ff7a6b",
            "ka": "#3ee6c8",
            "text": "#e6fbff",
            "muted": "#8fb8c1",
            "bg": "linear-gradient(180deg,#062a33,#010a10)",
            "panel": "rgba(6,32,40,.95)",
            "field": "#052028",
            "button": "#0a3540",
            "accent": "#3ee6c8",
            "onAccent": "#032a24",
            "gold": "#ffd166",
            "border": "rgba(64,220,220,.28)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "grayscale(.7) hue-rotate(160deg) saturate(1.3) brightness(.55) contrast(1.2)"
    },
    {
        "id": "cherrySnow",
        "label": {
            "ja": "桜吹雪の夜",
            "en": "Cherry Blossom Snow Night",
            "zh": "樱花飘雪之夜",
            "ko": "벚꽃 눈비 밤"
        },
        "desc": {
            "ja": "桜の花びらが舞う、淡いピンクの夜",
            "en": "A pale pink night with cherry blossom petals dancing",
            "zh": "樱花花瓣飞舞的淡粉色之夜",
            "ko": "벚꽃 꽃잎이舞는 연분홍색 밤"
        },
        "cat": ["light", "fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#ffeef3,#ffd1dc)",
            "ink": "#3a2330",
            "don": "#e0568a",
            "ka": "#5aa9e6",
            "text": "#3a2330",
            "muted": "#7c5968",
            "bg": "linear-gradient(180deg,#fff0f4,#ffe6f0)",
            "panel": "rgba(255,250,252,.97)",
            "field": "#ffffff",
            "button": "#ffe6ee",
            "accent": "#e0568a",
            "onAccent": "#000000",
            "gold": "#d9782a",
            "border": "rgba(214,77,128,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.25) saturate(1.15) brightness(1.06)"
    },
    {
        "id": "ironMorning",
        "label": {
            "ja": "鉄の朝",
            "en": "Iron Morning",
            "zh": "铁之晨",
            "ko": "철의 아침"
        },
        "desc": {
            "ja": "工場地帯の朝、鉄とコンクリートの灰色",
            "en": "Industrial district morning, gray of iron and concrete",
            "zh": "工业区的早晨，铁与混凝土的灰色",
            "ko": "공업 지대의 아침, 철과 콘크리트의 회색"
        },
        "cat": ["dark", "access"],
        "font": "\"Courier New\",Courier,\"Cascadia Mono\",Consolas,\"Noto Sans Mono\",monospace",
        "type": None,
        "colors": {
            "stage": "#2a2a2a",
            "ink": "#e0e0e0",
            "don": "#ffff00",
            "ka": "#00e5ff",
            "text": "#e0e0e0",
            "muted": "#808080",
            "bg": "#1a1a1a",
            "panel": "rgba(42,42,42,.98)",
            "field": "#2a2a2a",
            "button": "#3a3a3a",
            "accent": "#ffff00",
            "onAccent": "#000000",
            "gold": "#ffff00",
            "border": "#ffffff"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "grayscale(1) brightness(.6) contrast(1.4)"
    },
    {
        "id": "goldLeafNight",
        "label": {
            "ja": "金箔の夜",
            "en": "Gold Leaf Night",
            "zh": "金箔之夜",
            "ko": "금박 밤"
        },
        "desc": {
            "ja": "黒地に輝く金箔、豪華で気高い夜",
            "en": "Gold leaf shining on black, a luxurious and noble night",
            "zh": "黑地上闪耀的金箔，豪华高贵之夜",
            "ko": "검은 배경에 빛나는 금박, 호화롭고 기품 있는 밤"
        },
        "cat": ["dark", "grad", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#1a1510,#0a0500)",
            "ink": "#fdf6e3",
            "don": "#ffd166",
            "ka": "#b8912e",
            "text": "#fdf6e3",
            "muted": "#cabfe0",
            "bg": "linear-gradient(180deg,#0a0500,#050200)",
            "panel": "rgba(26,21,16,.96)",
            "field": "#1a1510",
            "button": "#2a2018",
            "accent": "#ffd166",
            "onAccent": "#1a1000",
            "gold": "#ffe9a8",
            "border": "rgba(255,209,102,.34)"
        },
        "shapes": ["circle", "diamond"],
        "locked": False,
        "video": "grayscale(1) contrast(1.5) sepia(1) hue-rotate(18deg) saturate(1.4) brightness(.55)"
    }
]

def main():
    path = "catalog/skins.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data["skins"]}
    new_count = 0
    for skin in SKINS_VOL1:
        if skin["id"] in existing_ids:
            print(f"スキップ（重複）: {skin['id']}")
            continue
        data["skins"].append(skin)
        existing_ids.add(skin["id"])
        new_count += 1

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

    print(f"追加スキン数: {new_count}")
    print(f"総スキン数: {data['count']}")
    print(f"カテゴリ: {data['categories']}")
    print(f"タイプスキン: {data['typeSkins']}")

if __name__ == "__main__":
    main()
