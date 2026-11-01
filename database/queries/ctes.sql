USE organsync_v2;

-- CTE: Active Organ Demand
WITH organ_demand AS (
    SELECT
        organ_type_id,
        COUNT(*) AS waiting_count
    FROM waiting_list
    WHERE status = 'ACTIVE'
    GROUP BY organ_type_id
)
SELECT
    ot.organ_name,
    od.waiting_count
FROM organ_demand od
JOIN organ_type ot
    ON od.organ_type_id = ot.organ_type_id;

-- CTE: Organ Availability
WITH availability AS (
    SELECT
        organ_type_id,
        COUNT(*) AS available_count
    FROM organ
    WHERE organ_status = 'AVAILABLE'
    GROUP BY organ_type_id
)
SELECT
    ot.organ_name,
    COALESCE(a.available_count, 0) AS available_count
FROM organ_type ot
LEFT JOIN availability a
    ON ot.organ_type_id = a.organ_type_id;