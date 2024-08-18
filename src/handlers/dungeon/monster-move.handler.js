import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const monsterMoveHandler = async ({ socket, accountId, packet }) => {
  // C_MONSTER_MOVE
  const { monsterIdx, transform } = packet;
  const dungeonSession = getDungeonSessionByUserId(accountId);

  if (dungeonSession) {
    dungeonSession.moveMonster(accountId, monsterIdx, transform);
  }
};

export default monsterMoveHandler;
