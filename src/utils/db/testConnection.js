const testDbConnection = async (pool, dbName) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log(`${dbName} 테스트 쿼리 결과:`, rows[0].solution);
  } catch (error) {
    console.error(`${dbName} 테스트 쿼리 실행 중 오류 발생:`, error);
  }
};

const testAllDBConnections = async (pools) => {
  await testDbConnection(pools.GAME_DB, 'GAME_DB');
  await testDbConnection(pools.USER_DB, 'USER_DB');
};

export { testDbConnection, testAllDBConnections };
