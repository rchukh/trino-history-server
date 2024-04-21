#!make
include .env
export $(shell sed 's/=.*//' .env)

.PHONY: format
format:
	cargo fmt

.PHONY: migrate
migrate:
	cargo sqlx database create && \
	cargo sqlx migrate run

.PHONY: sqlx
sqlx:
	cargo sqlx prepare

.PHONY: run
run:
	cargo run
