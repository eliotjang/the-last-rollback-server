import { v4 as uuidv4 } from 'uuid';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import { userDB } from '../../db/user/user.db.js';

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
    const exp = 10000;

    await userDB.addUser(accountId, accountPwd, true);
    await userDB.updateLogin(accountId);
    await userDB.updateExp(accountId, exp);
    await userDB.updateLevel(accountId);
    await userDB.getUser(accountId);
    await userDB.updateStageUnlock(accountId, true);
    await userDB.removeUser(accountId, true);
    console.log(`USER DB 테스트 쿼리 성공`);
  } catch (error) {
    console.error(`USER DB 테스트 쿼리 실행 중 오류 발생:`, error);
  }
};

const testGameCharDBQueries = async () => {
  try {
    const accountId = uuidv4();
    const nickname = uuidv4();
    const charClass = 1003;
    const transform = {
      posX: 3.21,
      posY: 3.14,
      posZ: 0,
      rot: 0,
    };
    const transform2 = {
      posX: 123,
      posY: 321,
      posZ: 1,
      rot: 1,
    };

    await gameCharDB.addPlayer(accountId, nickname, charClass, transform, true);
    await gameCharDB.updateTransform(accountId, transform2, true);
    await gameCharDB.getGameChar(accountId);
    await gameCharDB.removeGameChar(accountId, true);
    console.log(`GAME CHAR DB 테스트 쿼리 성공`);
  } catch (error) {
    console.error(`GAME CHAR DB 테스트 쿼리 실행 중 오류 발생:`, error);
  }
};

export { testDbConnection, testAllDBConnections, testUserDBQueries, testGameCharDBQueries };
