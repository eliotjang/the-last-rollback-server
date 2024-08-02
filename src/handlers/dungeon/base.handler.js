import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';

const baseHpUpdateHandler = async ({ _, accountId, _ }) => {
  try {
    const dungeonSession = getDungeonSessionByUserId(accountId);
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    dungeonSession.updateBaseHp(10);

    if (dungeon.baseHp <= 0) {
      const lastHp = 0;
      dungeonSession.updateBaseHp(lastHp);

      await dungeonSession.updateGameOver(townSession);
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default baseHpUpdateHandler;
