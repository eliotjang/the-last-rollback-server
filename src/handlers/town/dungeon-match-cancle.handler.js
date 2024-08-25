import { matchDequeue } from '../../match_queue/producers/match-queue.producer.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const dungeonMatchCancleHandler = async ({ socket, accountId, packet }) => {
  // C_MatchCancle
  const user = getUserById(accountId);
  if (!user) {
    throw new CustomError(
      ErrorCodes.USER_NOT_FOUND,
      `유저를 찾을 수 없습니다. accountId: ${accountId}`,
    );
  }

  matchDequeue(accountId);
};

export default dungeonMatchCancleHandler;
