export const SQL_GAME_QUERIES = {
  FIND_GAME_CHAR_BY_ACCOUNT_ID: 'SELECT * FROM game_char WHERE account_id = ?',
  CREATE_GAME_CHAR:
    'INSERT INTO game_char (char_nickname, char_class, account_id) VALUES (?, ?, ?)',
  UPDATE_LAST_POSITION: `UPDATE game_char SET last_position_x = ?, last_position_y = ? WHERE account_id = ?`,
  UPDATE_STAGE_UNLOCK: `UPDATE game_char SET char_stage_unlock = char_stage_unlock + 1 WHERE account_id = ?`,
};
