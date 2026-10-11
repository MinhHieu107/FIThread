CREATE TABLE review_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempts INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP NULL,
    sentiment VARCHAR(20) NULL,
    score DOUBLE NULL,
    summary VARCHAR(500) NULL,
    flagged BOOLEAN NOT NULL DEFAULT FALSE,
    error_message VARCHAR(500) NULL,
    analyzed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_analysis_status_next ON review_analysis(status, next_attempt_at);

CREATE TABLE review_analysis_themes (
    analysis_id BIGINT NOT NULL,
    theme VARCHAR(30) NOT NULL,
    CONSTRAINT fk_themes_analysis FOREIGN KEY (analysis_id) REFERENCES review_analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_themes_analysis ON review_analysis_themes(analysis_id);