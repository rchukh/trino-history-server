use std::time::Duration;
use axum::http::{HeaderValue, Method};

use axum::Router;
use axum::routing::{get, post};
use sqlx::{Pool, Postgres};
use sqlx::postgres::{PgPoolOptions};
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tower_http::cors::CorsLayer;

use crate::web::route::event;

mod db;
mod web;

#[tokio::main]
async fn main() {
    setup_tracing();
    tracing::warn!("Starting...");

    let pool = prepare_db().await;
    let app = routes(pool);

    let bind_host = std::env::var("BIND_IP").unwrap();
    let bind_port = std::env::var("BIND_PORT").unwrap();
    let listener = TcpListener::bind(format!("{bind_host}:{bind_port}"))
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

fn setup_tracing() {
    tracing_subscriber::registry()
        // .with(
        //     tracing_subscriber::EnvFilter::try_from_default_env()
        //         .unwrap_or_else(|_| "example_tokio_postgres=debug".into()),
        // )
        .with(tracing_subscriber::fmt::layer())
        .init();
}

async fn prepare_db() -> Pool<Postgres> {
    let db_connection_str = std::env::var("DATABASE_URL").unwrap();
    return PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&db_connection_str)
        .await
        .expect("cannot connect to database");
}

fn routes(pool: Pool<Postgres>) -> Router {
    let origin = std::env::var("ALLOW_ORIGIN").unwrap().parse::<HeaderValue>().unwrap();
    return Router::new()
        // Trino event listener
        // https://trino.io/docs/current/admin/event-listeners-http.html
        .route("/events", post(event::save))
        .route("/api/queries", get(event::list))
        .layer(
            // see https://docs.rs/tower-http/latest/tower_http/cors/index.html
            // for more details
            //
            // pay attention that for some request types like posting content-type: application/json
            // it is required to add ".allow_headers([http::header::CONTENT_TYPE])"
            // or see this issue https://github.com/tokio-rs/axum/issues/849
            CorsLayer::new()
                .allow_origin(origin)
                .allow_methods([Method::GET]),
        )
        .with_state(pool);
}
