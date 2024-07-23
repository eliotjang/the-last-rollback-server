import { packetTypes } from '../../constants/packet.constants.js';
import { getTownSessionByUserSocket } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const locationUpdateHandler = ({ socket, userId, payload }) => {
  try {
    const { TransformInfo } = payload;

    const townSession = getTownSessionByUserSocket(socket);

    if (!townSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '타운 세션을 찾을 수 없습니다.');
    }

    const user = townSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    user.updatePosition(TransformInfo);
    const TransformInfos = townSession.getAllLocation(userId);
    sendPacketToOthers(userId, packetTypes.S_MOVE, TransformInfos);
  } catch (error) {
    handlerError(socket, error);
  }
};

export default locationUpdateHandler;
