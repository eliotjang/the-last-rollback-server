import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { sessionTypes } from '../../constants/session.constants.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const structureAttackedMonsterHandler = ({ socket, accountId, packet }) => {
  try {
    // int32 monsterIdx = 1;
    // int32 structureIdx = 2;
    // int32 structureHp = 3;
    // optional int32 attackType = 4;

    const { monsterIdx, structureIdx } = packet;

    const dungeonSession = getDungeonSessionByUserId(accountId);
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    dungeonSession.monsterAttacksStructure(accountId, monsterIdx, structureIdx);
  } catch (error) {
    handleError(error);
  }
};

export default structureAttackedMonsterHandler;
