-- OrganSync V2 | MySQL 8.x | Initial schema
-- Run against a new database. All timestamps use UTC at the application boundary.
CREATE DATABASE IF NOT EXISTS organsync_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE organsync_v2;

CREATE TABLE transplant_centre (
  centre_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  centre_name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  contact_email VARCHAR(254) UNIQUE,
  contact_phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE app_user (
  user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  centre_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','COORDINATOR','CLINICIAN') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_centre FOREIGN KEY (centre_id) REFERENCES transplant_centre(centre_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE donor (
  donor_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  centre_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_group VARCHAR(3) NOT NULL,
  donor_type ENUM('LIVING','DECEASED') NOT NULL,
  contact_phone VARCHAR(20),
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_donor_centre FOREIGN KEY (centre_id) REFERENCES transplant_centre(centre_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE patient (
  patient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  centre_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  date_of_birth DATE NOT NULL,
  sex ENUM('FEMALE','MALE','OTHER','UNDISCLOSED') NOT NULL,
  blood_group VARCHAR(3) NOT NULL,
  contact_phone VARCHAR(20),
  city VARCHAR(100),
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patient_centre FOREIGN KEY (centre_id) REFERENCES transplant_centre(centre_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE organ_type (
  organ_type_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organ_name VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE organ (
  organ_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_id BIGINT UNSIGNED NOT NULL,
  organ_type_id SMALLINT UNSIGNED NOT NULL,
  centre_id BIGINT UNSIGNED NOT NULL,
  organ_status ENUM('AVAILABLE','RESERVED','TRANSPLANTED','DISCARDED') NOT NULL DEFAULT 'AVAILABLE',
  retrieved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_organ_donor FOREIGN KEY (donor_id) REFERENCES donor(donor_id) ON DELETE RESTRICT,
  CONSTRAINT fk_organ_type FOREIGN KEY (organ_type_id) REFERENCES organ_type(organ_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_organ_centre FOREIGN KEY (centre_id) REFERENCES transplant_centre(centre_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE waiting_list (
  waiting_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  organ_type_id SMALLINT UNSIGNED NOT NULL,
  centre_id BIGINT UNSIGNED NOT NULL,
  priority_level TINYINT UNSIGNED NOT NULL,
  status ENUM('ACTIVE','MATCHED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_waiting_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE RESTRICT,
  CONSTRAINT fk_waiting_type FOREIGN KEY (organ_type_id) REFERENCES organ_type(organ_type_id) ON DELETE RESTRICT,
  CONSTRAINT fk_waiting_centre FOREIGN KEY (centre_id) REFERENCES transplant_centre(centre_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE medical_record (
  record_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  recorded_by BIGINT UNSIGNED NOT NULL,
  record_type VARCHAR(60) NOT NULL,
  assessment_notes TEXT,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_medical_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE RESTRICT,
  CONSTRAINT fk_medical_user FOREIGN KEY (recorded_by) REFERENCES app_user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE organ_match (
  match_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waiting_id BIGINT UNSIGNED NOT NULL,
  organ_id BIGINT UNSIGNED NOT NULL,
  match_status ENUM('PROPOSED','TESTING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PROPOSED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_waiting FOREIGN KEY (waiting_id) REFERENCES waiting_list(waiting_id) ON DELETE RESTRICT,
  CONSTRAINT fk_match_organ FOREIGN KEY (organ_id) REFERENCES organ(organ_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE compatibility_test (
  test_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id BIGINT UNSIGNED NOT NULL,
  performed_by BIGINT UNSIGNED NOT NULL,
  blood_group_result ENUM('COMPATIBLE','INCOMPATIBLE','UNKNOWN') NOT NULL,
  hla_result ENUM('COMPATIBLE','INCOMPATIBLE','UNKNOWN') NOT NULL,
  overall_result ENUM('COMPATIBLE','INCOMPATIBLE','INCONCLUSIVE') NOT NULL,
  test_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  CONSTRAINT fk_test_match FOREIGN KEY (match_id) REFERENCES organ_match(match_id) ON DELETE RESTRICT,
  CONSTRAINT fk_test_user FOREIGN KEY (performed_by) REFERENCES app_user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE organ_allocation (
  allocation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id BIGINT UNSIGNED NOT NULL,
  allocation_status ENUM('RESERVED','RELEASED','COMPLETED') NOT NULL DEFAULT 'RESERVED',
  allocated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  released_at DATETIME NULL,
  CONSTRAINT fk_allocation_match FOREIGN KEY (match_id) REFERENCES organ_match(match_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE transplant (
  transplant_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  allocation_id BIGINT UNSIGNED NOT NULL UNIQUE,
  centre_id BIGINT UNSIGNED NOT NULL,
  performed_at DATETIME NOT NULL,
  outcome ENUM('SUCCESSFUL','COMPLICATIONS','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
  notes TEXT,
  CONSTRAINT fk_transplant_allocation FOREIGN KEY (allocation_id) REFERENCES organ_allocation(allocation_id) ON DELETE RESTRICT,
  CONSTRAINT fk_transplant_centre FOREIGN KEY (centre_id) REFERENCES transplant_centre(centre_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE transplant_follow_up (
  follow_up_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transplant_id BIGINT UNSIGNED NOT NULL,
  recorded_by BIGINT UNSIGNED NOT NULL,
  follow_up_date DATE NOT NULL,
  patient_status VARCHAR(60) NOT NULL,
  notes TEXT,
  CONSTRAINT fk_followup_transplant FOREIGN KEY (transplant_id) REFERENCES transplant(transplant_id) ON DELETE RESTRICT,
  CONSTRAINT fk_followup_user FOREIGN KEY (recorded_by) REFERENCES app_user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE audit_log (
  audit_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  entity_name VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(30) NOT NULL,
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE app_session (
  session_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sync_outbox (
  event_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  aggregate_type VARCHAR(80) NOT NULL,
  aggregate_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(40) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('PENDING','PROCESSING','DELIVERED','FAILED') NOT NULL DEFAULT 'PENDING',
  attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE schema_migration (
  version VARCHAR(50) PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE active_organ_reservation (
  organ_id BIGINT UNSIGNED PRIMARY KEY,
  allocation_id BIGINT UNSIGNED NOT NULL UNIQUE,
  CONSTRAINT fk_reservation_organ FOREIGN KEY (organ_id) REFERENCES organ(organ_id) ON DELETE RESTRICT,
  CONSTRAINT fk_reservation_allocation FOREIGN KEY (allocation_id) REFERENCES organ_allocation(allocation_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE organ_transplant_record (
  organ_id BIGINT UNSIGNED PRIMARY KEY,
  transplant_id BIGINT UNSIGNED NOT NULL UNIQUE,
  CONSTRAINT fk_record_organ FOREIGN KEY (organ_id) REFERENCES organ(organ_id) ON DELETE RESTRICT,
  CONSTRAINT fk_record_transplant FOREIGN KEY (transplant_id) REFERENCES transplant(transplant_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO schema_migration (version, description)
VALUES ('001', 'Initial 19-table relational schema');
