use axum::http::{HeaderValue, Method};
use axum::Router;
use sqlx::{Pool, Postgres};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use trino_history_server::db;
use trino_history_server::web::listener;
use trino_history_server::web::ui;

#[tokio::main]
async fn main() {
    setup_tracing();
    tracing::warn!("Starting...");

    let pool = db::prepare_db().await;
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

fn routes(pool: Pool<Postgres>) -> Router {
    let origin = std::env::var("ALLOW_ORIGIN")
        .unwrap()
        .parse::<HeaderValue>()
        .unwrap();

    Router::new()
        .merge(ui::router())
        .merge(listener::router())
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
        .with_state(pool)
}
