export const SQL_USER_QUERIES = {
  FIND_USER_BY_ACCOUNT_ID: 'SELECT * FROM user WHERE account_id = ?',
  CREATE_USER: 'INSERT INTO user (account_id, account_pwd) VALUES (?, ?)',
  UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE account_id = ?',
  UPDATE_USER_LEVEL: `UPDATE user SET user_level = ?, user_experience = 0 WHERE account_id = ?`,
  UPDATE_USER_EXPERIENCE: `UPDATE user SET user_experience = ? WHERE account_id = ?`,
};
