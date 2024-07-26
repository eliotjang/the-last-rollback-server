import {
  createGameChar,
  findGameCharByAccountID,
  updateLastPosition,
  updateStageUnlock,
} from '../../db/game-char/game-char.db.js';
import {
  createUser,
  findUserByAccountID,
  updateUserExp,
  updateUserLevel,
  updateUserLogin,
} from '../../db/user/user.db.js';
import { v4 as uuidv4 } from 'uuid';

const testDbConnection = async (pool, dbName) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log(`${dbName} 테스트 쿼리 결과:`, rows[0].solution);
  } catch (error) {
    console.error(`${dbName} 테스트 쿼리 실행 중 오류 발생:`, error);
  }
};

const testAllDBConnections = async (pools) => {
  await testDbConnection(pools.GAME_CHAR_DB, 'GAME_CHAR_DB');
  await testDbConnection(pools.USER_DB, 'USER_DB');
};

const testUserDBQueries = async () => {
  try {
    const accountId = uuidv4();
    const accountPwd = 'waldo';
    const userLevel = '3';
    const userExperience = 83;

    await createUser(accountId, accountPwd);
    await updateUserLogin(accountId);
    await updateUserLevel(userLevel);
    await updateUserExp(userExperience, accountId);
    await findUserByAccountID(accountId);
    console.log(`USER DB 테스트 쿼리 성공`);
  } catch (error) {
    console.error(`USER DB 테스트 쿼리 실행 중 오류 발생:`, error);
  }
};

const testGameCharDBQueries = async () => {
  try {
    const accountId = uuidv4();
    const charNickname = uuidv4();
    const charClass = 1003;
    const lastPositionX = 3.21;
    const lastPositionY = 3.14;
    await createGameChar(charNickname, charClass, accountId);
    await updateLastPosition(lastPositionX, lastPositionY, accountId);
    await updateStageUnlock(accountId);
    console.log(`GAME CHAR DB 테스트 쿼리 성공`);
  } catch (error) {
    console.error(`GAME CHAR DB 테스트 쿼리 실행 중 오류 발생:`, error);
  }
};

export { testDbConnection, testAllDBConnections, testUserDBQueries, testGameCharDBQueries };
