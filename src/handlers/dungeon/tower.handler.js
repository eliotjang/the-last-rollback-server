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

    dungeonSession.updateTowerHp(amount);
  } catch (error) {
    handleError(socket, error);
  }
};

export default towerHpUpdateHandler;
