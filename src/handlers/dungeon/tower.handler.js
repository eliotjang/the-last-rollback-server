import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getGameAssets } from '../../init/assets.js';

const towerHpUpdateHandler = async ({ socket, accountId, packet }) => {
  try {
    const { monsterInfo } = getGameAssets();
    const { monsterIdx } = packet;

    const amount = monsterInfo.data[monsterIdx].atk;

    const dungeonSession = getDungeonSessionByUserId(accountId);
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    dungeonSession.updateTowerHp(amount); // 몬스터 공격력 임의로 설정
  } catch (error) {
    handleError(socket, error);
  }
};

export default towerHpUpdateHandler;