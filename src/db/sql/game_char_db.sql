CREATE TABLE IF NOT EXISTS game_char (
  player_id VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(255) UNIQUE NOT NULL,
  char_class INT NOT NULL,
  transform JSON
);