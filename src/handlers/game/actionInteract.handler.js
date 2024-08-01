import { payloadTypes } from '../../constants/packet.constants.js';
import { getTownSessionByUserSocket } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const actionInteractHandler = ({ socket, accountId, packet }) => {
  try {
    const { animCode } = packet;

    const user = getUserById(accountId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const townSession = user.getSession();
    if (!townSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '타운 세션을 찾을 수 없습니다.');
    }

    townSession.movePlayer(accountId, animCode);
  } catch (error) {
    handleError(socket, error);
  }
};

export default actionInteractHandler;
