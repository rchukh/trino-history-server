#!make
include .env
export $(shell sed 's/=.*//' .env)

.PHONY: run_dev
run_dev:
	bun run dev

.PHONY: update
update:
	bun run update-deps
