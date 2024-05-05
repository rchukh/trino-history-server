use std::cmp;

use axum::extract::Query;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use serde::Serialize;
use sqlx::FromRow;

use crate::web::map_db_error;
use crate::web::ui::table::{ReqTableOptions, RespTableMetadata};
use crate::web::DatabaseConnection;

const RESP_SIZE_DEFAULT: usize = 10;
const RESP_SIZE_MAX: usize = 100;
const RESP_OFFSET_DEFAULT: usize = 0;

#[derive(Serialize)]
struct QueryEventList {
    data: Vec<QueryEvent>,
    metadata: RespTableMetadata,
}

#[derive(FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
struct QueryEvent {
    pub id: i64,
    pub query_id: Option<String>,
    pub server_version: Option<String>,
    pub user: Option<String>,
    pub source: Option<String>,
}

pub async fn list_events(
    query: Query<ReqTableOptions>,
    DatabaseConnection(mut conn): DatabaseConnection,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    // TODO: Add some validation instead of silently changing to defaults
    // TODO: Support filters/sorting. Use https://github.com/SeaQL/sea-query ?
    let limit = cmp::min(query.limit.unwrap_or(RESP_SIZE_DEFAULT), RESP_SIZE_MAX);
    let offset = query.offset.unwrap_or(RESP_OFFSET_DEFAULT);
    tracing::debug!("query: {:?}", query.0);

    let total_results = sqlx::query_file_scalar!("queries/event_list_count.sql")
        .fetch_one(&mut *conn)
        .await
        .map_err(map_db_error())?
        .unwrap();
    tracing::debug!("Total events: {}", total_results);

    let query_result = sqlx::query_file_as!(
        QueryEvent,
        "queries/event_list.sql",
        limit as i32,
        offset as i32
    )
    .fetch_all(&mut *conn)
    .await
    .map_err(map_db_error())?;

    Ok(Json(QueryEventList {
        metadata: RespTableMetadata {
            total_row_count: total_results as i32,
        },
        data: query_result,
    }))
}
