import { packetTypes } from '../../constants/packet.constants.js';
import { getTownSessionByUserSocket } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
//import { updatePosition } from '../../classes/models/user.class.js';

const locationUpdateHandler = ({ socket, userId, packet }) => {
  try {
    const { transform } = packet;
    const townSession = getTownSessionByUserSocket(socket);

    if (!townSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '타운 세션을 찾을 수 없습니다.');
    }

    const user = townSession.getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    //user.updatePosition(TransformInfo);
    user.playerInfo.transform = transform;
    const data = { playerId: user.playerInfo.playerId, transform };

    //const TransformInfos = townSession.getAllLocation(user.playerInfo.playerId);

    townSession.sendPacketToAll(packetTypes.S_MOVE, data);
  } catch (error) {
    handleError(socket, error);
  }
};

export default locationUpdateHandler;
