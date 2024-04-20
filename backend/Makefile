#!make
include .env
export $(shell sed 's/=.*//' .env)

.PHONY: migrate
migrate:
	cargo sqlx database create && \
	cargo sqlx migrate run

.PHONY: run
run:
	cargo run
