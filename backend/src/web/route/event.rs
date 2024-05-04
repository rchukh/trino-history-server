use std::cmp;

use axum::extract::Query;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::FromRow;

use crate::db::pool::DatabaseConnection;
use crate::web::route::table::{ReqTableOptions, RespTableMetadata};

pub async fn save(
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
    .await;
    return match query_result {
        Ok(data) => Ok(Json(data.id)),
        Err(error) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"status": "error","message": format!("{:?}", error)})),
        )),
    };
}

#[derive(Serialize)]
pub struct QueryEventList {
    data: Vec<QueryEvent>,
    metadata: RespTableMetadata,
}

#[derive(FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryEvent {
    pub id: i64,
    pub query_id: Option<String>,
    pub server_version: Option<String>,
    pub user: Option<String>,
    pub source: Option<String>,
}

const RESP_SIZE_DEFAULT: usize = 10;
const RESP_SIZE_MAX: usize = 100;
const RESP_OFFSET_DEFAULT: usize = 0;

pub async fn list(
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
    tracing::debug!("total_results {}", total_results);

    let query_result = sqlx::query_file_as!(
        QueryEvent,
        "queries/event_list.sql",
        limit as i32,
        offset as i32
    )
    .fetch_all(&mut *conn)
    .await
    .map_err(map_db_error())?;

    return Ok(Json(QueryEventList {
        metadata: RespTableMetadata {
            total_row_count: total_results as i32,
        },
        data: query_result,
    }));
}

fn map_db_error() -> fn(sqlx::Error) -> (StatusCode, Json<Value>) {
    |e| {
        let error_response = serde_json::json!({
            "status": "error",
            "message": format!("Database error: { }", e),
        });
        (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
    }
}


#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReqQueryDetails {
    pub id: Option<usize>
}

#[derive(FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RespQueryDetails {
    pub id: Option<i64>,
    pub query_id: Option<String>,
    pub server_version: Option<String>,
    pub user: Option<String>,
    pub source: Option<String>,
    pub query: Option<String>,
    pub create_time: Option<chrono::NaiveDateTime>,
    pub execution_start_time: Option<chrono::NaiveDateTime>,
    pub end_time: Option<chrono::NaiveDateTime>,
    pub execution_time_ms: Option<i32>,
    pub json_plan: Option<String>,
    // pub payload: Option<String>,
    // pub operator_summaries: Option<String>,
}

pub async fn details(
    query: Query<ReqQueryDetails>,
    DatabaseConnection(mut conn): DatabaseConnection,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let id = query.id.unwrap();
    tracing::debug!("query: {:?}", query.0);

    let query_details = sqlx::query_file_as!(
        RespQueryDetails,
        "queries/event_details.sql",
        id as i64
    )
    .fetch_one(&mut *conn)
    .await
    .map_err(map_db_error())?;

    return Ok(Json(query_details));
}
