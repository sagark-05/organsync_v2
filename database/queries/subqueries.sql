USE organsync_v2;

-- Patients With Active Waiting-List Entries
SELECT patient_id, full_name
FROM patient
WHERE patient_id IN (
    SELECT patient_id
    FROM waiting_list
    WHERE status = 'ACTIVE'
);

-- Organs Without Candidate Matches
SELECT organ_id, organ_status
FROM organ o
WHERE NOT EXISTS (
    SELECT 1
    FROM organ_match m
    WHERE m.organ_id = o.organ_id
);

-- Patients With More Than One Waiting-List Entry
SELECT patient_id, full_name
FROM patient
WHERE patient_id IN (
    SELECT patient_id
    FROM waiting_list
    GROUP BY patient_id
    HAVING COUNT(*) > 1
);