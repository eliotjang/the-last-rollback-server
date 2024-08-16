export const USER_QUERIES = {
  ADD_USER: 'INSERT INTO user (account_id, account_pwd) VALUES (?, ?)',
  GET_USER: 'SELECT * FROM user WHERE account_id = ?',
  UPDATE_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE account_id = ?',
  UPDATE_LEVEL: `UPDATE user SET user_level = ? WHERE account_id = ?`,
  UPDATE_EXP: `UPDATE user SET user_experience = ? WHERE account_id = ?`,
  UPDATE_STAGE_UNLOCK: `UPDATE user SET stage_unlock = stage_unlock + 1 WHERE account_id = ?`,
  REMOVE_USER: `DELETE FROM user WHERE account_id = ?`,
};
