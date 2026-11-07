# Avatar → PWA：trk314 背景判定の追加の人工例（2026-11-07）

[二度目の修正への返信](https://drive.google.com/file/d/1X0tYAxqjxexnFu3OD2CgcmEE4UZVRme3/view)をお渡しした後、判定境界のケース整理中に別の人工例が見つかりました。二度目の修正で以前の三例が適用保留になったこととは別の問題です。

## 再現条件と結果

対象は未マージの固定 PWA commit `575cb075dbaf23c7f3dac3dbd60e7353f0912184`、headless Chromium 133.0.6943.0。背景要素の中の題字に黒 `#000000` を作品色として適用する人工例です。

```css
background-color: rgb(150, 150, 150);
background-image: linear-gradient(rgb(180, 180, 180), rgb(180, 180, 180));
background-blend-mode: multiply;
```

- `getComputedStyle` の `backgroundBlendMode` は `multiply`。
- `effectiveBgs` は `[150,150,150]` と `[180,180,180]` を候補とし、`titlePaint` は黒文字を適用可と判定しました。
- ブラウザが実際に描いた文字のない背景画素は `[106,106,106]` で、黒との対比は約 **3.883:1** でした。スクリーンショットから ImageMagick で画素を取得しています。
- `mix-blend-mode` の検査と、同一要素の背景層を合成する `background-blend-mode` は別の CSS 属性です。対象版の `layerOptions` は前者を確認しますが、今回の `backgroundBlendMode` は確認していません。

再現用：[`tests/re-modern-trk314-background-blend-characterization.test.mjs`](https://github.com/Trk-Nexus/trk-Avatar-Library/blob/arena/091ac4fa-trk-avatar-library/tests/re-modern-trk314-background-blend-characterization.test.mjs)。**試験成功はこの固定版で問題を再現した意味であり、安全性の合格ではありません。**

```sh
# 実行可能な Chromium と ImageMagick convert が必要
TRK_PWA=/path/to/clean-575cb075 node tests/re-modern-trk314-background-blend-characterization.test.mjs
```

これは人工 CSS の実描画であり、PWA の既定スキン・実機・他ブラウザに同じ問題があるとの主張ではありません。背景の混合方法を扱わない場合、まず `normal` 以外の判定を保留する案が考えられます。複数の層ごとの値や祖先、`normal` の計算値、背景そのものは消さないこと、他の未対応描画条件と合わせて検討できればと思います。対応可能な混合方式を将来拡げることや表現自体を妨げる提案ではありません。

Avatar 側では同時に、既定の `shadow` と `daylight` の実画面も限定調査中です。追加例を先に共有します。よろしくお願いします。
