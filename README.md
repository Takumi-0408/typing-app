# 年収打

ピンチワークスのチャットにローマ字で返信し、ゲーム内年収を稼ぐタイピングゲームです。

## 必要環境

- WSL2 上の Linux ファイルシステム（`/mnt/c` 配下は使わない）
- [Nix](https://nixos.org/) と [direnv](https://direnv.net/)
- [Vite+](https://viteplus.dev/)（`vp`）
- Cloudflare アカウント（デプロイ時）

初回:

```bash
direnv allow
# vp が無ければ: curl -fsSL https://vite.plus | bash
vp install
just db-migrate
just db-seed
just dev
```

## コマンド

| コマンド | 内容 |
| --- | --- |
| `just dev` | 開発サーバ |
| `just check` | lint / typecheck / test / build |
| `just deploy` | Cloudflare Workers へデプロイ |
| `just db-migrate` | ローカル D1 に migration |
| `just db-seed` | ローカル D1 に問題データ |

仕様: [docs/specs/mvp.md](docs/specs/mvp.md)
