use axum::async_trait;
use axum::extract::{FromRef, FromRequestParts};
use axum::http::request::Parts;
use axum::http::StatusCode;
use axum::Json;
use serde_json::Value;
use sqlx::PgPool;

pub mod ui;
pub mod listener;

// Utility function for mapping any error into a `500 Internal Server Error` response.
pub fn internal_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

// pub fn internal_error2<E>(err: E) -> (StatusCode, Json<serde_json::Value>)
// where E: std::error::Error,
// {
//     (
//         StatusCode::INTERNAL_SERVER_ERROR,
//         Json(json!({"status": "error","message": format!("{:?}", err)})),
//     )
// }

pub fn map_db_error() -> fn(sqlx::Error) -> (StatusCode, Json<Value>) {
    |e| {
        let error_response = serde_json::json!({
            "status": "error",
            "message": format!("Database error: { }", e),
        });
        (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
    }
}

// Support easy extraction of database connection pool from Axum state
pub struct DatabaseConnection(pub sqlx::pool::PoolConnection<sqlx::Postgres>);

#[async_trait]
impl<S> FromRequestParts<S> for DatabaseConnection
where
    PgPool: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let pool = PgPool::from_ref(state);

        let conn = pool.acquire().await.map_err(internal_error)?;

        Ok(Self(conn))
    }
}
