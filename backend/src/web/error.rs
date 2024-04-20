use axum::http::StatusCode;
// use axum::Json;
// use serde_json::json;

/// Utility function for mapping any error into a `500 Internal Server Error`
/// response.
pub fn internal_error<E>(err: E) -> (StatusCode, String)
    where E: std::error::Error,
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
