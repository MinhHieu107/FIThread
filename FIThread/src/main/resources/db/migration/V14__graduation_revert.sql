CREATE TABLE graduation_batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort VARCHAR(20) NOT NULL,
    graduation_year INT NOT NULL,
    student_count INT NOT NULL,
    created_by BIGINT NOT NULL,
    reverted_at TIMESTAMP NULL,
    reverted_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_batch_reverted_by FOREIGN KEY (reverted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE account_audit_logs ADD COLUMN batch_id BIGINT NULL;
CREATE INDEX idx_audit_batch ON account_audit_logs(batch_id);

ALTER TABLE alumni_profiles ADD COLUMN graduation_batch_id BIGINT NULL;
CREATE INDEX idx_alumni_batch ON alumni_profiles(graduation_batch_id);