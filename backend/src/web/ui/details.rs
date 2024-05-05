use axum::extract::Query;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::web::map_db_error;
use crate::web::DatabaseConnection;

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReqQueryDetails {
    pub id: Option<usize>,
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

pub async fn get_details(
    query: Query<ReqQueryDetails>,
    DatabaseConnection(mut conn): DatabaseConnection,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let id = query.id.unwrap();
    tracing::debug!("query: {:?}", query.0);

    let query_details =
        sqlx::query_file_as!(RespQueryDetails, "queries/event_details.sql", id as i64)
            .fetch_one(&mut *conn)
            .await
            .map_err(map_db_error())?;

    Ok(Json(query_details))
}
