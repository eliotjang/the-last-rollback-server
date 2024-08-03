import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const animationMonsterHandler = ({ socket, accountId, packet }) => {
  try {
    const { animCode, monsterIdx, playerId } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    const data = {
      animCode,
      monsterIdx,
    };

    if (playerId) {
      data.playerId = playerId;
    } else {
      data.playerId = '-1';
    }

    dungeonSession.animationMonster(data);
  } catch (e) {
    handleError(e);
  }
};

export default animationMonsterHandler;
