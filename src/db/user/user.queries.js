export const SQL_QUERIES = {
  FIND_USER_BY_ACCOUNT_ID: 'SELECT * FROM user WHERE account_id = ?',
  CREATE_USER: 'INSERT INTO user (account_id, account_pwd) VALUES (?, ?)',
  UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE account_id = ?',
  UPDATE_LAST_POSITION: `UPDATE user SET last_position_x = ?, last_position_y = ? WHERE account_id = ?`,
  UPDATE_CLASS: `UPDATE user SET account_class = ? WHERE account_id = ?`,
  UPDATE_NICKNAME: `UPDATE user SET account_nickname = ? WHERE account_id = ?`,
  UPDATE_LEVEL: `UPDATE user SET account_level = ? WHERE account_id = ?`,
  UPDATE_EXPERIENCE: `UPDATE user SET account_experience = ? WHERE account_id = ?`,
};
