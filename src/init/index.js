import pools from '../db/database.js';
import TransformInfo from '../protobuf/classes/info/transform-info.proto.js';
import { testGameCharDBQueries, testUserDBQueries } from '../utils/db/testConnection.js';
import { gameCharRedis } from '../utils/redis/game.char.redis.js';
// import { testAllDBConnections } from '../utils/db/testConnection.js';
import { testAllRedisConnections } from '../utils/redis/testConnection.js';
import { loadGameAssets } from './assets.js';
import { loadProtoFiles } from './proto.init.js';

const initServer = async () => {
  try {
    await loadGameAssets();
    await loadProtoFiles();
    // await testAllDBConnections(pools);
    await testUserDBQueries();
    await testGameCharDBQueries();
    await testAllRedisConnections();
  } catch (e) {
    console.error(e);
    process.exit(1); // 오류 발생 시 프로세스 종료
  }
};

export default initServer;
