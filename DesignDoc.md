# "Jet" Design Doc

## 名称

Jet(仮名)

いい名前募集中。

## 目的

大サイズの JSON データに対する「非定型なタスク」を補助すること。

「非定型なタスク」とは、スクリプトなどを使って定型的な形に押し込めることが難しい or そうする価値が低いタスク。

## 開発の背景

作者は日常業務において, そこそこ大きなサイズ(~数 MB)の JSON データを扱うことが多い。\
JSON データの閲覧には Firefox を利用することが常であった。\
Firefox はデフォルトで JSON を良い感じに表示してくれるのだが、いくつか難点がある:

- 表示パフォーマンスが悪化しやすい
- 検索機能が微妙に不親切
- URL を持たない JSON データが開きにくい

そこで, これらの難点を解決したものを Web アプリとして実現しようとしている。

## 実現目標

Firefox の JSON 表示機能に対する不満を解決すること。つまりこんな感じ:

- 巨大な JSON に対しても、**表示スピード・操作感を軽快に保つこと**
- **詳細な検索**, たとえば JSON の構造に対する検索や値に対する検索ができるようにすること
- **野良の JSON データ**を簡単にビジュアライズできること

現在これらは*おおむね*クリアされている。が、これから先どうなるかはわからない。

## 目標としないもの

- リッチなグラフィカル UI / UX
  - パフォーマンスを妨げない範囲で(主にテンションを上げる目的で)ならやって良いが、パフォーマンスとの二択になる場合は常にパフォーマンスを優先する。
- JSON lint / prettier
  - おまけとして付いているが, 必要なら切っていい
- 超巨大(100MB~)な JSON の取り扱い
  - そんなもの直接見ようとしないでください・・・

## 実現形態

- NextJS による SPA
- デプロイ先は Vercel

## おおまかな処理

ユーザが入力した or ストレージから取得した文字列 を JSON に変換し(Parse),\
さらにそれを HTML 要素に変換して、リスト表示する(Visualize)。

この流れは今のところは逆転しない。つまり Visualize ステージから元の JSON 文字列を編集する手段は提供していない。

すべての処理はクライアントサイドで完結している。ただしこれも今のところ。

## 内部構造

上述の通り、データの流れは

文字列 -> JSON データ -> HTML 要素

となっている。

記述を簡潔にするため、文字列と JSON データ はグローバルステート([`Jotai`](https://jotai.org/))として管理されている。\
HTML 要素も, JSON データ に依存する計算的(computed)グローバルステートとなっている。

原理的には JSON データも文字列に依存する計算的グローバルステートにできるが、UI の都合上あえてそうしていない。
