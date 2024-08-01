import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { getTownSessionByUserId } from '../../session/town.session.js';

// 기지가 공격당하면 클라에서 어떤 accountId를 보낼지  아무거나 보내도됨
const baseHpUpdateHandler = async ({ socket, accountId, packet }) => {
  const { hp } = packet;
  const updateHp = hp - 10;

  const dungeonSession = getDungeonSessionByUserId(accountId);
  const townSession = getTownSessionByUserId(accountId);
  dungeonSession.updateBaseHp(updateHp);

  if (updateHp <= 0) {
    const lastHp = 0;
    dungeonSession.updateBaseHp(lastHp);

    await dungeonSession.updateGameOver(townSession);
  }
};

export default baseHpUpdateHandler;
