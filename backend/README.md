# Trino History Server

## "Quick" start

1. Update .env
2. Start dependencies (if using local database):
   ```console
   docker compose up -d 
   ```
3. Run database migrations:
    ```console
    make migrate
    ```
4. Run debug build:
    ```console
    make run
    ```

## API

External API:

* `/events` - Trino [Http Event Listener](https://trino.io/docs/current/admin/event-listeners-http.html) endpoint

Frontend API:

* `/api/queries?limit=<limit>&offset=<offset>` - list recorded query events
* `/api/query/details?id=<id>` - query event details

## Release build

```console
cargo build --release
set -o allexport && source .env && set +o allexport
./target/release/trino-history-server
```

## Notes

Q: Why Rust?

A: I want to learn Rust.
