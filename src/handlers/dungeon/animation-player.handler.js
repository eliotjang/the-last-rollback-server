import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const animationPlayerHandler = ({ socket, accountId, packet }) => {
  // C_ANIMATION_PLAYER
  try {
    const { animCode, monsterIdx } = packet;
    // console.debug('플레이어 애니메이션 정보 : ', animCode, monsterIdx);
    const user = getUserById(accountId);
    const gameSession = user.getSession();
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Game Session을 찾을 수 없습니다.');
    }

    gameSession.animationPlayer(animCode, accountId, monsterIdx);
  } catch (e) {
    handleError(e);
  }
};

export default animationPlayerHandler;
