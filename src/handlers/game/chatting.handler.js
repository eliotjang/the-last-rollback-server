import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const chattingHandler = async ({ socket, accountId, packet }) => {
  try {
    const { chatMsg } = packet;

    const user = getUserById(accountId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const curSession = user.getSession();
    if (!curSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '타운 세션을 찾을 수 없습니다.');
    }

    curSession.chatPlayer(accountId, chatMsg);
  } catch (error) {
    handleError(socket, error);
  }
};

export default chattingHandler;
