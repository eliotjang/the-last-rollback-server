import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { matchDequeue, matchEnqueue } from '../../match_queue/producers/match-queue.producer.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';

const dungeonMatchHandler = async ({ socket, accountId, packet }) => {
  // C_DungeonMatch
  const { dungeonCode } = packet;

  const user = getUserById(accountId);
  if (!user) {
    throw new CustomError(
      ErrorCodes.USER_NOT_FOUND,
      `유저를 찾을 수 없습니다. accountId: ${accountId}`,
    );
  }

  const gameSession = user.getSession();
  if (gameSession.type !== sessionTypes.TOWN) {
    return;
  }

  matchDequeue(accountId);
  matchEnqueue(dungeonCode, accountId);

  socket.sendResponse(SuccessCode.Success, '매칭 시작', payloadTypes.S_DUNGEON_MATCH, {
    dungeonCode,
  });
};

export default dungeonMatchHandler;
