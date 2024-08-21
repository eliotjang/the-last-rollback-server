import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { Fort } from '../../classes/models/structure.class.js';
import { sessionTypes } from '../../constants/game.constants.js';

const structureHandler = ({ socket, accountId, packet }) => {
  try {
    // uint32 structureModel = 1;
    // uint32 structureIdx = 2;
    // int32 structureHp = 3;
    // TransformInfo transform = 2;
    // int32 gold = 3;

    const { structureModel, transform, playerId } = packet;

    const dungeonSession = getDungeonSessionByUserId(accountId);
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    const fort = new Fort(structureModel);
    dungeonSession.addStructure(fort, transform, playerId);
  } catch (error) {
    handleError(error);
  }
};

export default structureHandler;
