import pools from '../db/database.js';
import { testAllDBConnections } from '../utils/db/testConnection.js';
import { testAllRedisConnections } from '../utils/redis/testConnection.js';
import { loadGameAssets } from './assets.js';
import { loadProtoFiles } from './proto.init.js';

const initServer = async () => {
  try {
    await loadGameAssets();
    await loadProtoFiles();
    await testAllDBConnections(pools);
    await testAllRedisConnections();
  } catch (e) {
    console.error(e);
    process.exit(1); // 오류 발생 시 프로세스 종료
  }
};

export default initServer;
