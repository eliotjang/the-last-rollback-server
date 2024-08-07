import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
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

    const gameSession = user.getSession();
    // console.log('gameSession : ', gameSession);
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '세션을 찾을 수 없습니다.');
    }

    if (gameSession.type === sessionTypes.TOWN) {
      await townRedis.updatePlayerTransform(transform, accountId);
    }

    // 현재 추측항법 적용 X
    gameSession.movePlayer(accountId, transform);

    //const TransformInfos = townSession.getAllLocation(user.playerInfo.playerId);
  } catch (error) {
    handleError(socket, error);
  }
};

export default locationUpdateHandler;
