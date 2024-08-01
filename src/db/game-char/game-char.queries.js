export const GAME_CHAR_QUERIES = {
  GET_GAME_CHAR: `SELECT * FROM game_char WHERE player_id = ?`,
  GET_GAME_CHAR_BY_NICK_NAME: `SELECT * FROM game_char WHERE nickname = ?`,
  ADD_GAME_CHAR: `INSERT INTO game_char (player_id, nickname, char_class, transform) VALUES (?, ?, ?, ?)`,
  UPDATE_TRANSFORM: `UPDATE game_char SET transform = ? WHERE player_id = ?`,
  REMOVE_GAME_CHAR: `DELETE FROM game_char WHERE player_id = ?`,
};
