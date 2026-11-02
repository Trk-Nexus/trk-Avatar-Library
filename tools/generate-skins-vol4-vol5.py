#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# trk-Avatar-Library スキン vol.4・vol.5 一括生成スクリプト
#
# vol.4: 人気フォント・ウェブデザイン (Popular Fonts & Web Design) — 16種
#   vol.3と重複しない、ウェブ・UIで広く使われる人気フォントを彷彿とさせるスキン。
#   日本語フォントも含め、各書体の特徴を type フィールドで設計。
# vol.5: スイーツ・カフェ (Sweets & Cafe) — 16種
#   食べ物・スイーツをモチーフにしたカラフルで遊び心のあるスキン。
#
# catalog/skins.json にマージして使用します。

import json
from datetime import datetime, timezone

VOL4_IDS = [
    "montserrat", "opensans", "noto-sans-jp", "hiragino-kaku",
    "avenir", "proxima-nova", "lato", "roboto",
    "source-sans-pro", "ubuntu", "playfair-display", "merriweather",
    "oswald", "raleway", "poppins", "inter",
]

VOL5_IDS = [
    "matcha", "chocolate", "strawberry-cake", "macaron",
    "croissant", "espresso", "crepe", "donut",
    "parfait", "mochi", "dango", "melon-pan",
    "taiyaki", "creme-brulee", "tart", "pancake",
]

VOL4_SKINS = [
    {
        "id": "montserrat",
        "label": {
            "ja": "モントセラート",
            "en": "Montserrat",
            "zh": "蒙特塞拉特",
            "ko": "몬트세라트"
        },
        "desc": {
            "ja": "幾何学的なゴシック、モダンでクリーンな書体",
            "en": "Geometric sans, modern and clean",
            "zh": "几何学无衬线体，现代且简洁",
            "ko": "기하학적 고딕, 모던하고 깨끗한 서체"
        },
        "cat": ["type", "basic"],
        "font": "\"Montserrat\",system-ui,sans-serif",
        "type": {
            "title": "\"Montserrat\",sans-serif",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "700",
            "titleSpace": "-.02em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f8f9fa",
            "ink": "#212529",
            "don": "#e74c3c",
            "ka": "#3498db",
            "text": "#212529",
            "muted": "#7f8c8d",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#ecf0f1",
            "accent": "#3498db",
            "onAccent": "#ffffff",
            "gold": "#f1c40f",
            "border": "rgba(33,37,41,.12)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "brightness(1.02) contrast(1.01)"
    },
    {
        "id": "opensans",
        "label": {
            "ja": "オープンサンス",
            "en": "Open Sans",
            "zh": "开放无衬线",
            "ko": "오픈 산스"
        },
        "desc": {
            "ja": "人間的なゴシック、読みやすさと親しみやすさ",
            "en": "Humanist sans, legibility and friendliness",
            "zh": "人本主义无衬线体，可读性和亲和力",
            "ko": "휴먼체 고딕, 가독성과 친근함"
        },
        "cat": ["type", "light"],
        "font": "\"Open Sans\",system-ui,sans-serif",
        "type": {
            "title": "\"Open Sans\",sans-serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#eef2f3",
            "ink": "#34495e",
            "don": "#e74c3c",
            "ka": "#2ecc71",
            "text": "#34495e",
            "muted": "#95a5a6",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.97)",
            "field": "#ffffff",
            "button": "#d5dbdb",
            "accent": "#2ecc71",
            "onAccent": "#ffffff",
            "gold": "#f39c12",
            "border": "rgba(52,73,94,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "brightness(1.03) contrast(.99)"
    },
    {
        "id": "noto-sans-jp",
        "label": {
            "ja": "ノトサンスJP",
            "en": "Noto Sans JP",
            "zh": "思源黑体 JP",
            "ko": "노토 산스 JP"
        },
        "desc": {
            "ja": "日本語ウェブの定番、バランスの取れた角ゴシック",
            "en": "Japanese web standard, balanced gothic",
            "zh": "日语网页标准，均衡的角ゴシック",
            "ko": "일본어 웹 표준, 균형 잡힌 고딕"
        },
        "cat": ["type", "basic"],
        "font": "\"Noto Sans JP\",\"Noto Sans CJK JP\",sans-serif",
        "type": {
            "title": "\"Noto Sans JP\",sans-serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "700",
            "titleSpace": ".02em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#fafafa",
            "ink": "#1a1a1a",
            "don": "#d32f2f",
            "ka": "#1976d2",
            "text": "#1a1a1a",
            "muted": "#757575",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#eeeeee",
            "accent": "#1976d2",
            "onAccent": "#ffffff",
            "gold": "#ffa000",
            "border": "rgba(26,26,26,.12)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.02) brightness(1.01)"
    },
    {
        "id": "hiragino-kaku",
        "label": {
            "ja": "ヒラギノ角ゴ",
            "en": "Hiragino Kaku Gothic",
            "zh": "椿圆角ゴシック",
            "ko": "히라기노 각 고딕"
        },
        "desc": {
            "ja": "macOS の定番、丸みを帯びた上品な角ゴシック",
            "en": "macOS standard, rounded elegant gothic",
            "zh": "macOS 标准，圆润优雅的角ゴシック",
            "ko": "macOS 표준, 둥글고 우아한 각 고딕"
        },
        "cat": ["type", "light"],
        "font": "\"Hiragino Kaku Gothic ProN\",\"Hiragino Sans\",sans-serif",
        "type": {
            "title": "\"Hiragino Kaku Gothic ProN\",sans-serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#fbfcfc",
            "ink": "#2c3e50",
            "don": "#c0392b",
            "ka": "#2980b9",
            "text": "#2c3e50",
            "muted": "#7f8c8d",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#ecf0f1",
            "accent": "#2980b9",
            "onAccent": "#ffffff",
            "gold": "#f1c40f",
            "border": "rgba(44,62,80,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "brightness(1.01) contrast(1.01)"
    },
    {
        "id": "avenir",
        "label": {
            "ja": "アヴェニール",
            "en": "Avenir",
            "zh": "未来体",
            "ko": "아베니르"
        },
        "desc": {
            "ja": "フランス生まれの幾何学ゴシック、洗練された書体",
            "en": "French geometric sans, refined and elegant",
            "zh": "法国几何学无衬线体，精致优雅",
            "ko": "프랑스 기하학적 고딕, 세련되고 우아한 서체"
        },
        "cat": ["type", "light"],
        "font": "\"Avenir\",\"Avenir Next\",system-ui,sans-serif",
        "type": {
            "title": "\"Avenir\",sans-serif",
            "weight": "400",
            "lh": "1.55",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#eceff1",
            "ink": "#37474f",
            "don": "#d32f2f",
            "ka": "#0288d1",
            "text": "#37474f",
            "muted": "#78909c",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#cfd8dc",
            "accent": "#0288d1",
            "onAccent": "#ffffff",
            "gold": "#ffb300",
            "border": "rgba(55,71,79,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "contrast(1.03) brightness(1.01)"
    },
    {
        "id": "proxima-nova",
        "label": {
            "ja": "プロキシマノヴァ",
            "en": "Proxima Nova",
            "zh": "近星新星",
            "ko": "프록시노바"
        },
        "desc": {
            "ja": "ウェブで人気の幾何学ゴシック、柔軟でモダン",
            "en": "Popular web geometric sans, flexible and modern",
            "zh": "流行网页几何学无衬线体，灵活且现代",
            "ko": "웹 인기 기하학적 고딕, 유연하고 현대적"
        },
        "cat": ["type", "basic"],
        "font": "\"Proxima Nova\",system-ui,sans-serif",
        "type": {
            "title": "\"Proxima Nova\",sans-serif",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "600",
            "titleSpace": "-.01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f5f5f5",
            "ink": "#263238",
            "don": "#c62828",
            "ka": "#1565c0",
            "text": "#263238",
            "muted": "#607d8b",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#eceff1",
            "accent": "#1565c0",
            "onAccent": "#ffffff",
            "gold": "#ff9800",
            "border": "rgba(38,50,56,.12)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.02) brightness(1.01)"
    },
    {
        "id": "lato",
        "label": {
            "ja": "ラト",
            "en": "Lato",
            "zh": "拉托",
            "ko": "라토"
        },
        "desc": {
            "ja": "夏の意味を持つ、温かみのあるサンセリフ",
            "en": "Warm sans-serif meaning summer",
            "zh": "意为夏天的温暖无衬线体",
            "ko": "여름을 의미하는 따뜻한 산세리프"
        },
        "cat": ["type", "light"],
        "font": "\"Lato\",system-ui,sans-serif",
        "type": {
            "title": "\"Lato\",sans-serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "700",
            "titleSpace": ".02em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#e8f5e9",
            "ink": "#1b5e20",
            "don": "#c62828",
            "ka": "#1e88e5",
            "text": "#1b5e20",
            "muted": "#4caf50",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.97)",
            "field": "#ffffff",
            "button": "#c8e6c9",
            "accent": "#1e88e5",
            "onAccent": "#ffffff",
            "gold": "#ffb300",
            "border": "rgba(27,94,32,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.05) brightness(1.02)"
    },
    {
        "id": "roboto",
        "label": {
            "ja": "ロボト",
            "en": "Roboto",
            "zh": "机器人",
            "ko": "로보토"
        },
        "desc": {
            "ja": "Material Design の定番、機械的で読みやすい書体",
            "en": "Material Design standard, mechanical and legible",
            "zh": "Material Design 标准，机械且易读",
            "ko": "머티리얼 디자인 표준, 기계적이고 읽기 쉬운 서체"
        },
        "cat": ["type", "basic"],
        "font": "\"Roboto\",system-ui,sans-serif",
        "type": {
            "title": "\"Roboto\",sans-serif",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "500",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#eceff1",
            "ink": "#212121",
            "don": "#f44336",
            "ka": "#2196f3",
            "text": "#212121",
            "muted": "#757575",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#cfd8dc",
            "accent": "#2196f3",
            "onAccent": "#ffffff",
            "gold": "#ffc107",
            "border": "rgba(33,33,33,.12)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.01) brightness(1.01)"
    },
    {
        "id": "source-sans-pro",
        "label": {
            "ja": "ソースサンスプロ",
            "en": "Source Sans Pro",
            "zh": "源泉无衬线",
            "ko": "소스 산스 프로"
        },
        "desc": {
            "ja": "Adobe 製のオープンソースゴシック、UI に最適",
            "en": "Adobe open source sans, ideal for UI",
            "zh": "Adobe 开源无衬线体，适合 UI",
            "ko": "Adobe 오픈 소스 고딕, UI 에 적합"
        },
        "cat": ["type", "basic"],
        "font": "\"Source Sans Pro\",system-ui,sans-serif",
        "type": {
            "title": "\"Source Sans Pro\",sans-serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f4f6f8",
            "ink": "#2c3e50",
            "don": "#e74c3c",
            "ka": "#3498db",
            "text": "#2c3e50",
            "muted": "#7f8c8d",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#dfe6e9",
            "accent": "#3498db",
            "onAccent": "#ffffff",
            "gold": "#f1c40f",
            "border": "rgba(44,62,80,.12)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.02) brightness(1.01)"
    },
    {
        "id": "ubuntu",
        "label": {
            "ja": "ウブントゥ",
            "en": "Ubuntu",
            "zh": "乌班图",
            "ko": "우분투"
        },
        "desc": {
            "ja": "Linux ディストリビューションの定番、丸みのある書体",
            "en": "Linux distribution standard, rounded typeface",
            "zh": "Linux 发行版标准，圆润字体",
            "ko": "리눅스 배포판 표준, 둥근 서체"
        },
        "cat": ["type", "fun", "light"],
        "font": "\"Ubuntu\",system-ui,sans-serif",
        "type": {
            "title": "\"Ubuntu\",sans-serif",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "700",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#e3f2fd",
            "ink": "#1a237e",
            "don": "#dd2c00",
            "ka": "#0288d1",
            "text": "#1a237e",
            "muted": "#5c6bc0",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.97)",
            "field": "#ffffff",
            "button": "#bbdefb",
            "accent": "#dd2c00",
            "onAccent": "#ffffff",
            "gold": "#ffd54f",
            "border": "rgba(26,35,126,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "brightness(1.03) saturate(1.05)"
    },
    {
        "id": "playfair-display",
        "label": {
            "ja": "プレイフェアディスプレイ",
            "en": "Playfair Display",
            "zh": "博尼塔展示体",
            "ko": "플레이페어 디스플레이"
        },
        "desc": {
            "ja": "エレガントな明朝、雑誌の見出しに最適",
            "en": "Elegant serif, ideal for magazine headlines",
            "zh": "优雅衬线体，适合杂志标题",
            "ko": "우아한 명조체, 잡지 제목에 적합"
        },
        "cat": ["type", "light", "fun"],
        "font": "\"Playfair Display\",\"Noto Serif JP\",serif",
        "type": {
            "title": "\"Playfair Display\",serif",
            "weight": "400",
            "lh": "1.7",
            "titleWeight": "700",
            "titleSpace": ".03em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#fdfcf0",
            "ink": "#2c241d",
            "don": "#a5522e",
            "ka": "#4a5d6a",
            "text": "#2c241d",
            "muted": "#8c8074",
            "bg": "#fffef5",
            "panel": "rgba(255,255,245,.97)",
            "field": "#ffffff",
            "button": "#eae4d9",
            "accent": "#a5522e",
            "onAccent": "#fdfcf0",
            "gold": "#b8860b",
            "border": "rgba(44,36,29,.15)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.15) brightness(1.01)"
    },
    {
        "id": "merriweather",
        "label": {
            "ja": "メリウェザー",
            "en": "Merriweather",
            "zh": "梅里韦瑟",
            "ko": "메리웨더"
        },
        "desc": {
            "ja": "画面読みやすさ重視の明朝、落ち着いた書体",
            "en": "Screen-optimized serif, calm and readable",
            "zh": "屏幕优化衬线体，平静且易读",
            "ko": "화면 읽기 쉬운 명조체, 차분하고 읽기 쉬움"
        },
        "cat": ["type", "light"],
        "font": "\"Merriweather\",\"Noto Serif JP\",serif",
        "type": {
            "title": "\"Merriweather\",serif",
            "weight": "400",
            "lh": "1.75",
            "titleWeight": "700",
            "titleSpace": ".02em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f5f5f0",
            "ink": "#1a202c",
            "don": "#c53030",
            "ka": "#2b6cb0",
            "text": "#1a202c",
            "muted": "#718096",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#edf2f7",
            "accent": "#2b6cb0",
            "onAccent": "#ffffff",
            "gold": "#d69e2e",
            "border": "rgba(26,32,44,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "contrast(1.04) brightness(1.01)"
    },
    {
        "id": "oswald",
        "label": {
            "ja": "オズワルド",
            "en": "Oswald",
            "zh": "奥斯瓦尔德",
            "ko": "오스왈드"
        },
        "desc": {
            "ja": "圧縮されたゴシック、見出しに強い書体",
            "en": "Condensed sans, strong for headlines",
            "zh": "压缩无衬线体，标题有力",
            "ko": "압축된 고딕, 제목에 강한 서체"
        },
        "cat": ["type", "dark", "fun"],
        "font": "\"Oswald\",\"Impact\",sans-serif",
        "type": {
            "title": "\"Oswald\",sans-serif",
            "weight": "400",
            "lh": "1.3",
            "titleWeight": "700",
            "titleSpace": "-.03em",
            "titleTransform": "uppercase",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#1a202c",
            "ink": "#fafafa",
            "don": "#fc8181",
            "ka": "#4299e1",
            "text": "#fafafa",
            "muted": "#a0aec0",
            "bg": "#2d3748",
            "panel": "rgba(45,55,72,.96)",
            "field": "#1a202c",
            "button": "#2d3748",
            "accent": "#4299e1",
            "onAccent": "#ffffff",
            "gold": "#f6e05e",
            "border": "rgba(255,255,255,.18)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.15) brightness(.9)"
    },
    {
        "id": "raleway",
        "label": {
            "ja": "ラレーウェイ",
            "en": "Raleway",
            "zh": "拉雷维",
            "ko": "랄레웨이"
        },
        "desc": {
            "ja": "エレガントなゴシック、細身で洗練された書体",
            "en": "Elegant sans, slim and refined",
            "zh": "优雅无衬线体，纤细精致",
            "ko": "우아한 고딕, 날렵하고 정교한 서체"
        },
        "cat": ["type", "light"],
        "font": "\"Raleway\",system-ui,sans-serif",
        "type": {
            "title": "\"Raleway\",sans-serif",
            "weight": "400",
            "lh": "1.6",
            "titleWeight": "600",
            "titleSpace": ".02em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#fafafa",
            "ink": "#2d3436",
            "don": "#d63031",
            "ka": "#0984e3",
            "text": "#2d3436",
            "muted": "#636e72",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#dfe6e9",
            "accent": "#0984e3",
            "onAccent": "#ffffff",
            "gold": "#fdcb6e",
            "border": "rgba(45,52,54,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "contrast(1.03) brightness(1.01)"
    },
    {
        "id": "poppins",
        "label": {
            "ja": "ポピンズ",
            "en": "Poppins",
            "zh": "波平斯",
            "ko": "포핀스"
        },
        "desc": {
            "ja": "インド発の幾何学ゴシック、丸みがかわいい書体",
            "en": "Indian geometric sans, round and cute",
            "zh": "印度几何学无衬线体，圆润可爱",
            "ko": "인도 기하학적 고딕, 둥글고 귀여운 서체"
        },
        "cat": ["type", "fun", "light"],
        "font": "\"Poppins\",system-ui,sans-serif",
        "type": {
            "title": "\"Poppins\",sans-serif",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#fff0f5",
            "ink": "#2d3436",
            "don": "#e84393",
            "ka": "#00cec9",
            "text": "#2d3436",
            "muted": "#b2bec3",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.97)",
            "field": "#ffffff",
            "button": "#ffe5f0",
            "accent": "#e84393",
            "onAccent": "#ffffff",
            "gold": "#fd79a8",
            "border": "rgba(45,52,54,.12)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "brightness(1.04) saturate(1.05)"
    },
    {
        "id": "inter",
        "label": {
            "ja": "インタ",
            "en": "Inter",
            "zh": "间体",
            "ko": "인터"
        },
        "desc": {
            "ja": "UI/UX デザインの定番、画面に最適化された書体",
            "en": "UI/UX design standard, screen-optimized",
            "zh": "UI/UX 设计标准，屏幕优化",
            "ko": "UI/UX 디자인 표준, 화면 최적화된 서체"
        },
        "cat": ["type", "basic"],
        "font": "\"Inter\",system-ui,sans-serif",
        "type": {
            "title": "\"Inter\",sans-serif",
            "weight": "400",
            "lh": "1.5",
            "titleWeight": "600",
            "titleSpace": ".01em",
            "titleTransform": "",
            "mark": "あア漢 Aa 12"
        },
        "colors": {
            "stage": "#f8f9fa",
            "ink": "#1a202c",
            "don": "#e53e3e",
            "ka": "#3182ce",
            "text": "#1a202c",
            "muted": "#718096",
            "bg": "#ffffff",
            "panel": "rgba(255,255,255,.98)",
            "field": "#ffffff",
            "button": "#edf2f7",
            "accent": "#3182ce",
            "onAccent": "#ffffff",
            "gold": "#f6e05e",
            "border": "rgba(26,32,44,.12)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "contrast(1.01) brightness(1.01)"
    },
]

VOL5_SKINS = [
    {
        "id": "matcha",
        "label": {
            "ja": "抹茶",
            "en": "Matcha",
            "zh": "抹茶",
            "ko": "말차"
        },
        "desc": {
            "ja": "和スイーツの定番、落ち着いた緑色",
            "en": "Japanese sweet standard, calm green",
            "zh": "日式甜点标准，平静的绿色",
            "ko": "일본 디저트 표준, 차분한 초록색"
        },
        "cat": ["light", "grad", "life"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#81c784,#2e7d32)",
            "ink": "#1b5e20",
            "don": "#ffab91",
            "ka": "#a5d6a7",
            "text": "#1b5e20",
            "muted": "#81c784",
            "bg": "linear-gradient(180deg,#c8e6c9,#a5d6a7)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#c8e6c9",
            "accent": "#4caf50",
            "onAccent": "#ffffff",
            "gold": "#d4e157",
            "border": "rgba(46,125,50,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.1) brightness(1.02)"
    },
    {
        "id": "chocolate",
        "label": {
            "ja": "ショコラ",
            "en": "Chocolate",
            "zh": "巧克力",
            "ko": "초콜릿"
        },
        "desc": {
            "ja": "濃厚なチョコレート、大人っぽい茶色",
            "en": "Rich chocolate, adult brown",
            "zh": "浓郁巧克力，成人色调的棕色",
            "ko": "진한 초콜릿, 어른스러운 갈색"
        },
        "cat": ["light", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#8d6e63,#4e342e)",
            "ink": "#efebe9",
            "don": "#ffab91",
            "ka": "#bcaaa4",
            "text": "#efebe9",
            "muted": "#a1887f",
            "bg": "linear-gradient(180deg,#d7ccc8,#bcaaa4)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#bcaaa4",
            "accent": "#8d6e63",
            "onAccent": "#efebe9",
            "gold": "#ffe0b2",
            "border": "rgba(141,110,99,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.3) saturate(1.05) brightness(.95)"
    },
    {
        "id": "strawberry-cake",
        "label": {
            "ja": "ストロベリーケーキ",
            "en": "Strawberry Cake",
            "zh": "草莓蛋糕",
            "ko": "딸기 케이크"
        },
        "desc": {
            "ja": "苺のショートケーキ、甘くて華やかなピンク",
            "en": "Strawberry shortcake, sweet and gorgeous pink",
            "zh": "草莓蛋糕，甜美华丽的粉色",
            "ko": "딸기 쇼트케이크, 달콤하고 화려한 핑크"
        },
        "cat": ["light", "fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#fce4ec,#f8bbd0)",
            "ink": "#880e4f",
            "don": "#ec407a",
            "ka": "#f48fb1",
            "text": "#880e4f",
            "muted": "#ad1457",
            "bg": "linear-gradient(180deg,#f8bbd0,#f48fb1)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#f8bbd0",
            "accent": "#ec407a",
            "onAccent": "#ffffff",
            "gold": "#ffcdd2",
            "border": "rgba(236,64,122,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.1) saturate(1.15) brightness(1.03)"
    },
    {
        "id": "macaron",
        "label": {
            "ja": "マカロン",
            "en": "Macaron",
            "zh": "马卡龙",
            "ko": "마카롱"
        },
        "desc": {
            "ja": "パステルカラーのフランス菓子、かわいらしい色合い",
            "en": "Pastel French confectionery, cute colors",
            "zh": "淡色法国点心，可爱色调",
            "ko": "파스텔 컬러 프랑스 과자, 귀여운 색감"
        },
        "cat": ["light", "fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#f3e5f5,#e1bee7)",
            "ink": "#4a148c",
            "don": "#ce93d8",
            "ka": "#b39ddb",
            "text": "#4a148c",
            "muted": "#9c27b0",
            "bg": "linear-gradient(180deg,#e1bee7,#ce93d8)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#e1bee7",
            "accent": "#ab47bc",
            "onAccent": "#ffffff",
            "gold": "#f3e5f5",
            "border": "rgba(171,71,188,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.1) brightness(1.05)"
    },
    {
        "id": "croissant",
        "label": {
            "ja": "クロワッサン",
            "en": "Croissant",
            "zh": "可颂",
            "ko": "크루아상"
        },
        "desc": {
            "ja": "朝のカフェ、バターの香るゴールド",
            "en": "Morning cafe, buttery gold",
            "zh": "早 morning 咖啡厅，黄油香的金色",
            "ko": "아침 카페, 버터 향의 골드"
        },
        "cat": ["light", "grad", "life"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#ffe082,#ffcc80)",
            "ink": "#bf360c",
            "don": "#ffcc80",
            "ka": "#ffe0b2",
            "text": "#bf360c",
            "muted": "#ef6c00",
            "bg": "linear-gradient(180deg,#ffecb3,#ffe0b2)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#ffecb3",
            "accent": "#fb8c00",
            "onAccent": "#ffffff",
            "gold": "#ffe082",
            "border": "rgba(251,140,0,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.15) saturate(1.1) brightness(1.04)"
    },
    {
        "id": "espresso",
        "label": {
            "ja": "エスプレッソ",
            "en": "Espresso",
            "zh": "浓缩咖啡",
            "ko": "에스프레소"
        },
        "desc": {
            "ja": "濃いコーヒー、ダークでシックな夜",
            "en": "Strong coffee, dark and chic night",
            "zh": "浓缩咖啡，深色时尚之夜",
            "ko": "진한 커피, 다크하고 시크한 밤"
        },
        "cat": ["dark", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#3e2723,#212121)",
            "ink": "#ffebee",
            "don": "#ffccbc",
            "ka": "#8d6e63",
            "text": "#ffebee",
            "muted": "#795548",
            "bg": "linear-gradient(180deg,#212121,#121212)",
            "panel": "rgba(33,33,33,.96)",
            "field": "#3e2723",
            "button": "#4e342e",
            "accent": "#8d6e63",
            "onAccent": "#212121",
            "gold": "#d7ccc8",
            "border": "rgba(121,85,72,.24)"
        },
        "shapes": ["circle", "square"],
        "locked": False,
        "video": "sepia(.5) contrast(1.15) brightness(.85)"
    },
    {
        "id": "crepe",
        "label": {
            "ja": "クレープ",
            "en": "Crepe",
            "zh": "薄煎饼",
            "ko": "크레페"
        },
        "desc": {
            "ja": "フランスの屋台、やわらかな肌色",
            "en": "French street crepe, soft skin tone",
            "zh": "法式路边煎饼，柔和肤色",
            "ko": "프랑스 노점, 부드러운 살색"
        },
        "cat": ["light", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#ffe0b2",
            "ink": "#4e342e",
            "don": "#ff7043",
            "ka": "#ffccbc",
            "text": "#4e342e",
            "muted": "#a1887f",
            "bg": "#ffe0b2",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#ffccbc",
            "accent": "#ff7043",
            "onAccent": "#4e342e",
            "gold": "#ffd54f",
            "border": "rgba(78,52,46,.20)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.2) brightness(1.03)"
    },
    {
        "id": "donut",
        "label": {
            "ja": "ドーナツ",
            "en": "Donut",
            "zh": "甜甜圈",
            "ko": "도넛"
        },
        "desc": {
            "ja": "カラフルな glazed ドーナツ、遊び心たっぷり",
            "en": "Colorful glazed donut, full of playfulness",
            "zh": "彩色糖霜甜甜圈，充满童心",
            "ko": "컬러풀한 글레이즈 도넛, 재미가득"
        },
        "cat": ["fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#ff9ce0,#ff6b9d)",
            "ink": "#2d3436",
            "don": "#fd79a8",
            "ka": "#a29bfe",
            "text": "#2d3436",
            "muted": "#b2bec3",
            "bg": "linear-gradient(180deg,#ff79a8,#fd79a8)",
            "panel": "rgba(255,255,255,.95)",
            "field": "#ffffff",
            "button": "#ffc8dd",
            "accent": "#fd79a8",
            "onAccent": "#2d3436",
            "gold": "#ffeaa7",
            "border": "rgba(253,121,168,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.2) brightness(1.05)"
    },
    {
        "id": "parfait",
        "label": {
            "ja": "パフェ",
            "en": "Parfait",
            "zh": "圣代",
            "ko": "파르페"
        },
        "desc": {
            "ja": "層になったアイスパフェ、色とりどり",
            "en": "Layered ice parfait, colorful",
            "zh": "分层冰淇淋圣代，色彩缤纷",
            "ko": "층을 이룬 아이스 파르페, 색색깔"
        },
        "cat": ["fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#ff9a9e,#fecfef,#ff9a9e)",
            "ink": "#2d3436",
            "don": "#fd79a8",
            "ka": "#a29bfe",
            "text": "#2d3436",
            "muted": "#b2bec3",
            "bg": "linear-gradient(180deg,#ffc3a1,#afd9fe)",
            "panel": "rgba(255,255,255,.95)",
            "field": "#ffffff",
            "button": "#ffc8dd",
            "accent": "#e17055",
            "onAccent": "#2d3436",
            "gold": "#ffeaa7",
            "border": "rgba(225,112,85,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.15) brightness(1.04)"
    },
    {
        "id": "mochi",
        "label": {
            "ja": "餅",
            "en": "Mochi",
            "zh": "糯米饼",
            "ko": "떡"
        },
        "desc": {
            "ja": "和菓子の餅、柔らかく白い食感",
            "en": "Japanese mochi, soft and white texture",
            "zh": "日式年糕，柔软白色",
            "ko": "일본 떡, 부드럽고 하얀 식감"
        },
        "cat": ["light", "life"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#fdfdfd",
            "ink": "#4a4a4a",
            "don": "#d1c4e9",
            "ka": "#ffccbc",
            "text": "#4a4a4a",
            "muted": "#9e9e9e",
            "bg": "#f5f5f5",
            "panel": "rgba(255,255,255,.97)",
            "field": "#ffffff",
            "button": "#eeeeee",
            "accent": "#d1c4e9",
            "onAccent": "#4a4a4a",
            "gold": "#fff59d",
            "border": "rgba(74,74,74,.18)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.05) brightness(1.06) contrast(.95)"
    },
    {
        "id": "dango",
        "label": {
            "ja": "だんご",
            "en": "Dango",
            "zh": "团子",
            "ko": "단고"
        },
        "desc": {
            "ja": "三色団子、祭りの屋台をイメージ",
            "en": "Three-color dango, festival street food",
            "zh": "三色团子，节日摊位风格",
            "ko": "삼색 단고, 축제 노점 이미지"
        },
        "cat": ["fun", "grad", "life"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#dce775",
            "ink": "#33691e",
            "don": "#f48fb1",
            "ka": "#4db6ac",
            "text": "#33691e",
            "muted": "#827717",
            "bg": "#fff176",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#fff59d",
            "accent": "#f48fb1",
            "onAccent": "#33691e",
            "gold": "#fff176",
            "border": "rgba(51,105,30,.20)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.2) brightness(1.03)"
    },
    {
        "id": "melon-pan",
        "label": {
            "ja": "メロンパン",
            "en": "Melon Pan",
            "zh": "瓜面包",
            "ko": "멜론빵"
        },
        "zh": "瓜面包",
        "ko": "멜론빵",
        "label": {
            "ja": "メロンパン",
            "en": "Melon Pan",
            "zh": "瓜面包",
            "ko": "멜론빵"
        },
        "desc": {
            "ja": "日本の菓子パン、クッキー生地のグリッド",
            "en": "Japanese sweet bread, cookie dough grid",
            "zh": "日本甜面包，饼干面团网格",
            "ko": "일본 과자빵, 쿠키 반죽 그리드"
        },
        "cat": ["life", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#fff9c4",
            "ink": "#f57f17",
            "don": "#ffcc80",
            "ka": "#ffe0b2",
            "text": "#f57f17",
            "muted": "#ff6f00",
            "bg": "#ffe082",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#ffecb3",
            "accent": "#ffa000",
            "onAccent": "#fff9c4",
            "gold": "#ffd54f",
            "border": "rgba(245,127,23,.22)"
        },
        "shapes": ["square", "square"],
        "locked": False,
        "video": "sepia(.1) saturate(1.1) brightness(1.02)"
    },
    {
        "id": "taiyaki",
        "label": {
            "ja": "たい焼き",
            "en": "Taiyaki",
            "zh": "鱼形烤饼",
            "ko": "타이야키"
        },
        "desc": {
            "ja": "和菓子のたい焼き、焦げ茶色の温かさ",
            "en": "Japanese taiyaki, warm burnt brown",
            "zh": "日式太阳烧，温暖焦茶色",
            "ko": "일본 붕어빵, 따뜻한 구운 갈색"
        },
        "cat": ["life", "fun"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#bf360c",
            "ink": "#ffebee",
            "don": "#ffab91",
            "ka": "#d7ccc8",
            "text": "#ffebee",
            "muted": "#e65100",
            "bg": "#d84315",
            "panel": "rgba(216,67,21,.96)",
            "field": "#bf360c",
            "button": "#e64a19",
            "accent": "#ffab91",
            "onAccent": "#3e2723",
            "gold": "#ffccbc",
            "border": "rgba(230,81,0,.22)"
        },
        "shapes": ["circle", "square"],
        "locked": False,
        "video": "sepia(.4) contrast(1.1) brightness(.9)"
    },
    {
        "id": "creme-brulee",
        "label": {
            "ja": "クレームブリュレ",
            "en": "Creme Brulee",
            "zh": "焦糖布丁",
            "ko": "크렘 브륄레"
        },
        "desc": {
            "ja": "カラメルの表面、ゴールドの輝き",
            "en": "Caramel surface, golden shine",
            "zh": "焦糖表面，金色光泽",
            "ko": "캐러멜 표면, 골드 빛깔"
        },
        "cat": ["light", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "linear-gradient(180deg,#ffe082,#ffb74d)",
            "ink": "#e65100",
            "don": "#ffd54f",
            "ka": "#ffe082",
            "text": "#e65100",
            "muted": "#ff6f00",
            "bg": "linear-gradient(180deg,#ffecb3,#ffe082)",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#ffecb3",
            "accent": "#ffa000",
            "onAccent": "#fff9c4",
            "gold": "#ffd54f",
            "border": "rgba(230,81,0,.24)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "sepia(.15) saturate(1.1) brightness(1.02)"
    },
    {
        "id": "tart",
        "label": {
            "ja": "タルト",
            "en": "Tart",
            "zh": "塔",
            "ko": "타르트"
        },
        "desc": {
            "ja": "フルーツタルト、色とりどりのフルーツ",
            "en": "Fruit tart, colorful fruits",
            "zh": "水果塔，色彩缤纷水果",
            "ko": "과일 타르트, 색색깔 과일"
        },
        "cat": ["fun", "grad"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#ff8a80",
            "ink": "#bf360c",
            "don": "#ff5252",
            "ka": "#aed581",
            "text": "#bf360c",
            "muted": "#d32f2f",
            "bg": "#ffab91",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#ff8a80",
            "accent": "#ff5252",
            "onAccent": "#ffffff",
            "gold": "#ffd54f",
            "border": "rgba(191,54,12,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "saturate(1.25) brightness(1.03)"
    },
    {
        "id": "pancake",
        "label": {
            "ja": "パンケーキ",
            "en": "Pancake",
            "zh": "松饼",
            "ko": "팬케이크"
        },
        "desc": {
            "ja": "朝食のパンケーキ、バターのイエロー",
            "en": "Breakfast pancake, buttery yellow",
            "zh": "早餐松饼，黄油黄色",
            "ko": "아침 팬케이크, 버터 노란색"
        },
        "cat": ["light", "life"],
        "font": "",
        "type": None,
        "colors": {
            "stage": "#fff176",
            "ink": "#f57f17",
            "don": "#ffd54f",
            "ka": "#ffe082",
            "text": "#f57f17",
            "muted": "#ff6f00",
            "bg": "#fff59d",
            "panel": "rgba(255,255,255,.96)",
            "field": "#ffffff",
            "button": "#ffe082",
            "accent": "#ffa000",
            "onAccent": "#fff9c4",
            "gold": "#ffeb3b",
            "border": "rgba(245,127,23,.22)"
        },
        "shapes": ["circle", "circle"],
        "locked": False,
        "video": "brightness(1.05) saturate(1.05)"
    },
]

def main():
    path = "catalog/skins.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data["skins"]}

    all_new = []
    for label, skins in [("vol.4", VOL4_SKINS), ("vol.5", VOL5_SKINS)]:
        for skin in skins:
            if skin["id"] in existing_ids:
                print(f"スキップ（重複）: {skin['id']}")
                continue
            data["skins"].append(skin)
            existing_ids.add(skin["id"])
            all_new.append(skin["id"])

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

    print(f"追加 vol.4: {[s['id'] for s in VOL4_SKINS]}")
    print(f"追加 vol.5: {[s['id'] for s in VOL5_SKINS]}")
    print(f"総スキン数: {data['count']}")
    print(f"カテゴリ: {data['categories']}")
    print(f"タイプスキン: {data['typeSkins']}")

    return all_new

if __name__ == "__main__":
    main()
