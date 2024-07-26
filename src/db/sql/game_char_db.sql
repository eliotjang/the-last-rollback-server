CREATE TABLE IF NOT EXISTS game_char (
  account_id VARCHAR(255) UNIQUE NOT NULL,
  char_nickname VARCHAR(255) UNIQUE NOT NULL,
  char_class INT NOT NULL,
  last_position_x FLOAT DEFAULT 0,
  last_position_y FLOAT DEFAULT 0
);