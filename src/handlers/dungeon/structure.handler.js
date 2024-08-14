import { getGameAssets } from '../../init/assets.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { sessionTypes } from '../../constants/session.constants.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

let structureIdx = 0;

const structureHandler = ({ socket, accountId, packet }) => {
  try {
    // uint32 structureModel = 1;
    // uint32 structureIdx = 2;
    // int32 structureHp = 3;
    // TransformInfo transform = 2;
    // int32 gold = 3;

    const { structureModel, transform, playerId } = packet;
    const { structureInfo } = getGameAssets();

    const data = structureInfo.data.find((element) => element.structureModel === structureModel);
    if (!data) {
      throw new CustomError(
        ErrorCodes.STRUCTURE_NOT_FOUND,
        `구조물 (${structureModel})을/를 찾을 수 없습니다.`,
      );
    }
    const structureHp = data.maxHp;
    structureIdx++;

    const structureStatus = {
      structureModel,
      structureIdx: structureIdx,
      structureHp,
    };

    const dungeonSession = getDungeonSessionByUserId(accountId);
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    dungeonSession.buyStructure(accountId, data, structureStatus, transform, playerId);
  } catch (error) {
    handleError(error);
  }
};

export default structureHandler;
