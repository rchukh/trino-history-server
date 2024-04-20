use axum::http::StatusCode;
use axum::Json;
use axum::response::IntoResponse;
use serde::Serialize;
use serde_json::json;
use sqlx::{FromRow, query_file_as};

use crate::db::pool::DatabaseConnection;

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
#[serde(rename_all = "camelCase")]
pub struct ResponseMetadata {
    total_row_count: i32,
}

#[derive(Serialize)]
pub struct QueryEventList {
    data: Vec<QueryEvent>,
    metadata: ResponseMetadata,
}

#[derive(FromRow)]
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryEvent {
    pub id: i64,
    pub query_id: Option<String>,
    pub server_version: Option<String>,
    pub user: Option<String>,
    pub source: Option<String>,
}

// TODO: Support parameters
//       ?start=0&size=10&filters=[]&globalFilter=&sorting=[]
pub async fn list(
    DatabaseConnection(mut conn): DatabaseConnection
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
     let query_result = query_file_as!(QueryEvent, "queries/event_list.sql")
        .fetch_all(&mut *conn)
        .await;
    return match query_result {
        Ok(data) => {
            let metadata = ResponseMetadata { total_row_count: data.len() as i32 };
            Ok(Json(QueryEventList { metadata, data }))
        },
        Err(error) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"status": "error","message": format!("{:?}", error)})),
        )),
    };

}
