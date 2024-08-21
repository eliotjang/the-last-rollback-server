import { getUserBySocket } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { handleError } from '../utils/error/errorHandler.js';

const locationUpdateTestHandler = async ({ socket, accountId, packet }) => {
  // C_STRESS_TEST_MOVE
  try {
    const { playerId, transform } = packet;
    const user = getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }
    const gameSession = user.getSession();
    if (gameSession) {
      gameSession.moveStressTestPlayer(playerId, transform);
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default locationUpdateTestHandler;
