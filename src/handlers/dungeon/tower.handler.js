import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';

const towerHpUpdateHandler = async ({ _, accountId, _ }) => {
  try {
    const dungeonSession = getDungeonSessionByUserId(accountId);
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    dungeonSession.updateTowerHp(10); // 몬스터 공격력 임의로 설정

    if (dungeonSession.updateTowerHp(10) === 0) {
      await dungeonSession.updateGameOver(townSession);
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default towerHpUpdateHandler;
