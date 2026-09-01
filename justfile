set dotenv-load := false

vp := "vp"
wrangler := "vp exec -- wrangler"
db := "typing-app"

default:
    @just --list

dev:
    {{vp}} dev

check:
    {{vp}} check
    {{vp}} test
    {{vp}} build

deploy: check
    {{wrangler}} deploy

db-migrate:
    {{wrangler}} d1 migrations apply {{db}} --local

db-migrate-remote:
    {{wrangler}} d1 migrations apply {{db}} --remote

db-seed:
    {{wrangler}} d1 execute {{db}} --local --file=./seeds/problems.sql --yes

db-seed-remote:
    {{wrangler}} d1 execute {{db}} --remote --file=./seeds/problems.sql --yes

db-create-remote:
    {{wrangler}} d1 create {{db}}

types:
    {{wrangler}} types
