import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { handleError } from '../../utils/error/errorHandler.js';

const towerHpUpdateHandler = async ({ socket, accountId, packet }) => {
  // C_TOWER_ATTACKED
  try {
    const { monsterIdx } = packet;
    const dungeonSession = getDungeonSessionByUserId(accountId);

    dungeonSession.updateStructureHp(0, monsterIdx);
  } catch (error) {
    handleError(socket, error);
  }
};

export default towerHpUpdateHandler;
