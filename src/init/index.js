import pools from '../db/database.js';
import { testAllDBConnections } from '../utils/db/testConnection.js';
import { testAllRedisConnections } from '../utils/redis/testConnection.js';
import { loadGameAssets } from './assets.js';
import { loadProtos } from './loadProtos.js';

const initServer = async () => {
  try {
    await loadGameAssets();
    await loadProtos();
    await testAllDBConnections(pools);
    await testAllRedisConnections();
  } catch (e) {
    console.error(e);
    process.exit(1); // 오류 발생 시 프로세스 종료
  }
};

export default initServer;
