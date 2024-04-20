#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER history_server WITH PASSWORD 'history_server';
  ALTER USER history_server WITH SUPERUSER;
  CREATE DATABASE history_server
      WITH OWNER = history_server
      ENCODING = 'UTF8'
      CONNECTION LIMIT = -1;
	GRANT ALL PRIVILEGES ON DATABASE history_server TO history_server;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "history_server" <<-EOSQL
  GRANT ALL ON SCHEMA public TO history_server;
EOSQL
