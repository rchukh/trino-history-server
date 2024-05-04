SELECT
    id,
    data->'metadata'->>'queryId' as "query_id",
    data->'context'->>'serverVersion' as server_version,
    data->'context'->>'user' as "user",
    data->'context'->>'source' as source,
    data->'metadata'->>'query' as query,
    (data->>'createTime')::timestamp as create_time,
    (data->>'executionStartTime')::timestamp as execution_start_time,
    (data->>'endTime')::timestamp as end_time,
    CAST(extract(
      epoch from (data->>'endTime')::timestamp - (data->>'executionStartTime')::timestamp
    ) * 1000 as int) as execution_time_ms,
    -- -- Simple Plan
    data->'metadata'->>'jsonPlan' as json_plan
    -- Detailed Plan (100+ KB)
    -- TODO: Convert subfields from string json with escapes to proper json
    -- , data->'metadata'->>'payload' as payload
    -- Operator details (50+ KB)
    -- TODO: Convert subfields from string json with escapes to proper json
    -- , data->'statistics'->>'operatorSummaries' as operator_summaries
FROM events
WHERE data->'metadata'->>'queryState' = 'FINISHED'
  AND id = $1
