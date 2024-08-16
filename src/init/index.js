import { testGameCharDBQueries, testUserDBQueries } from '../utils/db/testConnection.js';
import { initDungeonUtil } from '../utils/dungeon/dungeon.utils.js';
import { loadGameAssets } from './assets.js';
import { loadProtoFiles } from './proto.init.js';

const initServer = async () => {
  try {
    await loadGameAssets();
    await initDungeonUtil();
    await loadProtoFiles();
    await testUserDBQueries();
    await testGameCharDBQueries();
  } catch (e) {
    console.error(e);
    process.exit(1); // 오류 발생 시 프로세스 종료
  }
};

export default initServer;
