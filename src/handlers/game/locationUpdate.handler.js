<<<<<<< HEAD
import { payloadTypes } from '../../constants/packet.constants.js';
import { getTownSessionByUserSocket } from '../../session/town.session.js';
=======
import { getUserById } from '../../session/user.session.js';
>>>>>>> 2f4f17a2523da33585f0303487e49e174ea5a55e
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { townRedis } from '../../utils/redis/town.redis.js';

const locationUpdateHandler = async ({ socket, accountId, packet }) => {
  try {
    const { transform } = packet;
    const user = getUserById(accountId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }
<<<<<<< HEAD
    //user.updatePosition(TransformInfo);
    user.playerInfo.transform = transform;
    const data = { playerId: user.playerInfo.playerId, transform };
    //const TransformInfos = townSession.getAllLocation(user.playerInfo.playerId);

    townSession.sendPacketToAll(payloadTypes.S_MOVE, data);
=======

    const townSession = user.getSession();
    if (!townSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '타운 세션을 찾을 수 없습니다.');
    }

    await townRedis.updatePlayerTransform(transform, accountId);

    // 현재 추측항법 적용 X
    townSession.movePlayer(accountId, transform);

    //const TransformInfos = townSession.getAllLocation(user.playerInfo.playerId);
>>>>>>> 2f4f17a2523da33585f0303487e49e174ea5a55e
  } catch (error) {
    handleError(socket, error);
  }
};

export default locationUpdateHandler;
