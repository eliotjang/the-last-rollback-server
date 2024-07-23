export const SQL_QUERIES = {
  FIND_USER_BY_ACCOUNT_ID: 'SELECT * FROM user WHERE account_id = ?',
  CREATE_USER: 'INSERT INTO user (id, account_id, account_pwd) VALUES (?, ?, ?)',
  UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
  UPDATE_LAST_POSITION: `UPDATE user SET last_position_x = ?, last_position_y = ? WHERE device_id = ?`,
};
