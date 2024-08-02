import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const animationPlayerHandler = ({ socket, accountId, packet }) => {
  try {
    const { animCode, monsterIdx } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    const data = { animCode, playerId: accountId };

    if (monsterIdx) {
      data.monsterIdx = monsterIdx;
    } else {
      data.monsterIdx = -1;
    }

    dungeonSession.animationPlayer(data);
  } catch (e) {
    handleError(e);
  }
};

export default animationPlayerHandler;
