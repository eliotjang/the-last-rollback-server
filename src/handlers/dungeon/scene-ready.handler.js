import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const sceneReadyHandler = ({ socket, accountId, packet }) => {
  const user = getUserById(accountId);
  if (!user) {
    throw new CustomError(ErrorCodes.USER_NOT_FOUND, `유저를 찾을 수 없습니다: ${accountId}`);
  }
  const dungeonSession = user.getSession();
  if (!dungeonSession) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, `유저가 게임 중이 아닙니다: ${accountId}`);
  }
  if (!dungeonSession.sceneReady) return;
  dungeonSession.sceneReady(accountId);
};

export default sceneReadyHandler;
