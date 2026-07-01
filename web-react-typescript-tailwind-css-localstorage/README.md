# 献立スコアリング Web アプリ

筋トレ、健康管理、食費管理、継続しやすい食事選びのための React + TypeScript + Tailwind CSS アプリです。データはブラウザの localStorage に保存され、バックエンドや外部 API は使いません。

## 起動

```bash
npm install
npm run dev
```

## GitHub Pages で公開

1. このフォルダを GitHub リポジトリに push します。
2. GitHub の `Settings > Pages` で `Source` を `GitHub Actions` にします。
3. `main` ブランチに push すると `.github/workflows/pages.yml` が自動でビルドして公開します。

公開後のURLは GitHub Actions の `Deploy to GitHub Pages` 実行結果、または `Settings > Pages` に表示されます。

## 主な機能

- 食品登録とタグ管理
- 複数食品、同一食品の複数個指定に対応した献立作成
- 目標栄養価、価格、継続性によるスコアリング
- 総合スコア順ランキング、カード表示と表表示の切り替え
- タグ、価格、タンパク質、カロリー、塩分などの絞り込み
- 登録食品からの自動献立生成
- 目標値、栄養重み、総合重みの設定

## スコア設計

低カロリーを高評価にするのではなく、目標栄養価に近い献立を高評価にします。タンパク質不足、脂質超過、塩分超過は強めに減点し、糖質は初期状態では参考表示のみです。
