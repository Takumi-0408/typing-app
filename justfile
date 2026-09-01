set dotenv-load := false

vp := "vp"
wrangler := "wrangler"
db := "typing-app"

default:
    @just --list

dev:
    {{vp}} build
    {{wrangler}} dev --local --port 8787

check:
    {{vp}} check
    {{vp}} exec -- tsc --noEmit
    {{vp}} test
    {{vp}} build

deploy:
    {{vp}} check
    {{vp}} test
    {{vp}} build
    {{wrangler}} deploy

db-migrate:
    CI=1 {{wrangler}} d1 migrations apply {{db}} --local

db-migrate-remote:
    {{wrangler}} d1 migrations apply {{db}} --remote

db-seed:
    {{vp}} node scripts/build-seed.ts
    {{wrangler}} d1 execute {{db}} --local --file=./seeds/problems.sql --yes

db-seed-remote:
    {{vp}} node scripts/build-seed.ts
    {{wrangler}} d1 execute {{db}} --remote --file=./seeds/problems.sql --yes

db-create-remote:
    {{wrangler}} d1 create {{db}}

types:
    {{wrangler}} types
