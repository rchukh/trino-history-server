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
4. Run service:
    ```console
    make run
    ```

## API

External API:

* `/events` - Trino [Http Event Listener](https://trino.io/docs/current/admin/event-listeners-http.html) endpoint

Frontend API:

* `/api/queries` - list recorded events of Finished queries 


## Notes

. Why Rust?

I want to learn Rust.
