SELECT COUNT(*)
FROM events
WHERE data->'metadata'->>'queryState' = 'FINISHED'
