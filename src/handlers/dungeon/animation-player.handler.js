import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const animationPlayerHandler = ({ socket, accountId, packet }) => {
  try {
    const { animCode, monsterIdx } = packet;
    // console.log('animCode', animCode);
    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    dungeonSession.animationPlayer(animCode, accountId, monsterIdx);
  } catch (e) {
    handleError(e);
  }
};

export default animationPlayerHandler;
