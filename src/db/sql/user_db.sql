CREATE TABLE IF NOT EXISTS user (
    account_id VARCHAR(255) UNIQUE NOT NULL,
    account_pwd VARCHAR(255) NOT NULL,
    account_nickname VARCHAR(255) DEFAULT 'nickname',
    account_class INT DEFAULT 1001,
    account_level INT DEFAULT 1,
    account_experience INT DEFAULT 0,
    last_position_x FLOAT DEFAULT 0,
    last_position_y FLOAT DEFAULT 0,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);