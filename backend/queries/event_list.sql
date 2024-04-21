SELECT
    id,
    data->'metadata'->>'queryId' as "query_id",
    data->'context'->>'serverVersion' as server_version,
    data->'context'->>'user' as "user",
    data->'context'->>'source' as source
-- ,
--     data->'metadata'->>'query' as query, -- TODO: Truncate query for table
--     (data->>'createTime')::timestamp as create_time,
--     (data->>'executionStartTime')::timestamp as execution_start_time,
--     (data->>'endTime')::timestamp as end_time,
--     extract(epoch from (data->>'endTime')::timestamp - (data->>'executionStartTime')::timestamp) * 1000 as execution_time_ms
FROM events
WHERE data->'metadata'->>'queryState' = 'FINISHED'
ORDER BY (data->>'createTime')::timestamp DESC
LIMIT $1 OFFSET $2
