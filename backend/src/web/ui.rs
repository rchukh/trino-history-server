use axum::{routing::get, Router};
use sqlx::{Pool, Postgres};

mod details;
mod list;
mod table;

pub fn router() -> Router<Pool<Postgres>> {
    Router::new()
        // Trino event listener
        // https://trino.io/docs/current/admin/event-listeners-http.html
        .route("/api/queries", get(list::list_events))
        .route("/api/query/details", get(details::get_details))
}
