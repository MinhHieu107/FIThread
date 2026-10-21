CREATE TABLE alumni_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    graduation_year INT NOT NULL,
    company VARCHAR(255) NULL,
    position_title VARCHAR(255) NULL,
    industry VARCHAR(100) NULL,
    bio VARCHAR(1000) NULL,
    linkedin_url VARCHAR(255) NULL,
    contact_visible BOOLEAN NOT NULL DEFAULT FALSE,
    card_photo_path VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_alumni_year ON alumni_profiles(graduation_year);