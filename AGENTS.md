# 年収打

IT エンジニアのチャット返信をローマ字で打つタイピングゲーム。  
仕様は [docs/specs/mvp.md](docs/specs/mvp.md)。完成条件は [docs/tasks/mvp_acceptance_checklist.md](docs/tasks/mvp_acceptance_checklist.md)。

## コマンド

JavaScript ツールは Vite+（`vp`）に任せる。日常操作は `just`。

- `just dev` — ローカル開発
- `just check` — lint / typecheck / test / build
- `just deploy` — Cloudflare Workers へデプロイ
- `just db-migrate` — ローカル D1 に migration を適用
- `just db-seed` — ローカル D1 に問題データを投入

## 約束

- React と Hono は 1 つの Worker。キー入力はブラウザ内で集計し、終了時だけ結果を保存する。
- 個人情報とログインは扱わない。匿名 ID のみ。
- D1 の変更は `migrations/` 経由。ローカルと本番を分ける。
- コミットメッセージ: `[type]: [日本語] [gitmoji]`

## Skills

公式配布のみを置く。Cloudflare 作業時は `.cursor/skills/cloudflare` と `.cursor/skills/wrangler` を読む。
