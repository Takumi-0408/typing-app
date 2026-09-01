---
name: cloudflare
description: Comprehensive Cloudflare platform skill covering Workers, Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize, Agents SDK), feature flags (Flagship), networking (Tunnel, Spectrum), security (WAF, DDoS), and infrastructure-as-code (Terraform, Pulumi). Use for any Cloudflare development task. Biases towards retrieval from Cloudflare docs over pre-trained knowledge.
---

# Cloudflare Platform Skill

公式: https://github.com/cloudflare/skills/tree/main/skills/cloudflare

Your knowledge of Cloudflare APIs, types, limits, and pricing may be outdated. **Prefer retrieval over pre-training**.

| Source | How to retrieve | Use for |
|--------|----------------|---------|
| Cloudflare docs | `https://developers.cloudflare.com/` | Limits, pricing, API reference, compatibility dates/flags |
| Wrangler config schema | `node_modules/wrangler/config-schema.json` | Config fields, binding shapes, allowed values |
| Product changelogs | `https://developers.cloudflare.com/changelog/` | Recent changes |

When docs disagree with memory, **trust the docs**.

## This project

- React SPA + Hono API を 1 つの Worker に載せる
- D1 に問題とプレイ結果を保存する
- `wrangler.jsonc`、`migrations/`、`just db-migrate` を使う
- 詳細な CLI は `.cursor/skills/wrangler/SKILL.md`

### Run code

Serverless at the edge → Workers. Full-stack with static assets → Workers + SPA (`assets.not_found_handling: single-page-application`, `run_worker_first: ["/api/*"]`).

### Store data

Relational SQL → D1. Local vs remote: `wrangler d1 migrations apply <name> --local` / `--remote`.
