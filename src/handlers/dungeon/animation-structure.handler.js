import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { sessionTypes } from '../../constants/session.constants.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const animationStructureHandler = ({ socket, accountId, packet }) => {
  try {
    // int32 animCode = 1;
    // int32 structureIdx = 2;
    // int32 monsterIdx = 3;

    const { animCode, structureIdx, monsterIdx } = packet;

    const dungeonSession = getDungeonSessionByUserId(accountId);
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    const data = { animCode, structureIdx, monsterIdx };

    dungeonSession.animationStructure(data);
  } catch (error) {
    handleError(error);
  }
};

export default animationStructureHandler;
