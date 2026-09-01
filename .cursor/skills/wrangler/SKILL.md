---
name: wrangler
description: Cloudflare Workers CLI for deploying, developing, and managing Workers and D1. Load before running wrangler commands. Official source: https://github.com/cloudflare/skills/tree/main/skills/wrangler
---

# Wrangler CLI

公式: https://github.com/cloudflare/skills/tree/main/skills/wrangler  
Prefer `https://developers.cloudflare.com/workers/wrangler/` over memory.

## Install

```bash
vp add -D wrangler
vp exec wrangler --version
```

Use `wrangler.jsonc`. Set a recent `compatibility_date`. After config changes run `wrangler types`.

## This project

Commands go through `just` when possible.

| Task | just / wrangler |
| --- | --- |
| Local dev | `just dev`（Vite + Cloudflare plugin） |
| Deploy | `just deploy` |
| Local migrate | `just db-migrate` = `wrangler d1 migrations apply typing-app --local` |
| Remote migrate | `just db-migrate-remote` |
| Seed local | `just db-seed` |
| Types | `vp exec wrangler types` |
| Auth | `vp exec wrangler login` / `whoami` |

## D1

```bash
wrangler d1 create typing-app
wrangler d1 migrations apply typing-app --local
wrangler d1 migrations apply typing-app --remote
wrangler d1 execute typing-app --local --file ./seeds/problems.sql
```

Local D1 and remote D1 stay separate. Never apply seed/migration to the wrong one by omitting `--local` / `--remote`.

## Deploy

```bash
vp build
vp exec wrangler deploy
```

No GitHub Actions. If login or D1 creation needs a browser, stop and give the user the exact command.
