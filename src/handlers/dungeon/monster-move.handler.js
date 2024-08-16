import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const monsterMoveHandler = async ({ socket, accountId, packet }) => {
  // C_MONSTER_MOVE
  const { monsterIdx, transform } = packet;
  const dungeonSession = getDungeonSessionByUserId(accountId);

  if (!dungeonSession) {
    throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '던전 세션을 찾을 수 없습니다.');
  }

  dungeonSession.moveMonster(accountId, monsterIdx, transform);
};

export default monsterMoveHandler;
