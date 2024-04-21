use std::fmt;

use serde::{de, Deserialize, Serialize};

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReqTableOptions {
    pub offset: Option<usize>,
    pub limit: Option<usize>,
    pub global_filter: Option<String>,
    // Add default to handle Option.
    // https://github.com/serde-rs/json/issues/893
    #[serde(deserialize_with = "deserialize_json_string", default)]
    pub filters: Option<Vec<ReqTableFilter>>,
    #[serde(deserialize_with = "deserialize_json_string", default)]
    pub sorting: Option<Vec<ReqTableSorting>>,
}

// Example: [{"id":"source","desc":false},{"id":"user","desc":false}]
#[derive(Deserialize, Debug, Default)]
pub struct ReqTableSorting {
    pub id: String,
    pub desc: bool,
}

impl fmt::Display for ReqTableSorting {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "id: {}; desc: {}", self.id, self.desc)
    }
}

// Example: [{"id":"serverVersion","value":"444"},{"id":"user","value":"test"},{"id":"source","value":"DBeaver"}]
#[derive(Deserialize, Debug, Default)]
pub struct ReqTableFilter {
    pub id: String,
    pub value: String,
}
impl fmt::Display for ReqTableFilter {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "id: {}; value: {}", self.id, self.value)
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RespTableMetadata {
    pub total_row_count: i32,
}

// https://github.com/actix/actix-web/issues/1301#issuecomment-747403932
fn deserialize_json_string<'de, D, I>(deserializer: D) -> Result<I, D::Error>
where
    D: de::Deserializer<'de>,
    I: de::DeserializeOwned,
{
    struct JsonStringVisitor<I>(std::marker::PhantomData<I>);

    impl<'de, I> de::Visitor<'de> for JsonStringVisitor<I>
    where
        I: de::DeserializeOwned,
    {
        type Value = I;

        fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
            formatter.write_str("a string containing json data")
        }

        fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            serde_json::from_str(v).map_err(E::custom)
        }
    }
    deserializer.deserialize_any(JsonStringVisitor(std::marker::PhantomData::<I>))
}
