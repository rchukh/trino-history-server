use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::post;
use axum::{Json, Router};
use sqlx::{Pool, Postgres};

use crate::web::map_db_error;
use crate::web::DatabaseConnection;

pub fn router() -> Router<Pool<Postgres>> {
    Router::new()
        // Trino event listener
        // https://trino.io/docs/current/admin/event-listeners-http.html
        .route("/events", post(save))
}

async fn save(
    DatabaseConnection(mut conn): DatabaseConnection,
    Json(body): Json<serde_json::Value>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let query_result = sqlx::query!(
        r#"
INSERT INTO events ( data )
VALUES ( $1 )
RETURNING id
        "#,
        body as _
    )
    .fetch_one(&mut *conn)
    .await
    .map_err(map_db_error())?;

    Ok(Json(query_result.id))
}
