import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const locationUpdateHandler = async ({ socket, accountId, packet }) => {
  // C_MOVE
  try {
    const { transform } = packet;
    const user = getUserById(accountId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const gameSession = user.getSession();
    if (gameSession) {
      gameSession.movePlayer(accountId, transform);
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default locationUpdateHandler;
