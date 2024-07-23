export const SQL_QUERIES = {
  FIND_USER_BY_ID: 'SELECT * FROM user_info WHERE id = ?',
  CREATE_USER:
    'UPDATE user_info SET nickname = ?, character_class = ?, x_coord = ?, y_coord = ? WHERE id = ?',
  UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE device_id = ?',
  UPDATE_LAST_POSITION: `UPDATE user SET x_coord = ?, y_coord = ? WHERE device_id = ?`,
};
