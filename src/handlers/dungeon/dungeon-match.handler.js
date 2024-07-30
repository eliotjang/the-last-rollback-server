import { payloadTypes } from '../../constants/packet.constants.js';
import { matchDequeue, matchEnqueue } from '../../match_queue/producers/match_queue.producer.js';
import { getUserById, userSocket } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';

const dungeonMatchHandler = async ({ socket, accountId, packet }) => {
  // packet == C_DungeonMatch
  const { dungeonCode } = packet;

  // 이미 진행 중인 던전 세션이 있는지 확인?

  // 유저 객체 찾기
  const user = userSocket.getUserById(accountId);

  if (!user) {
    // 유저가 없을 때
    throw new CustomError(
      ErrorCodes.USER_NOT_FOUND,
      `유저를 찾을 수 없습니다. accountId: ${accountId}`,
    );
  }

  // 이미 큐에 있다면 제거 후 새로운 매칭 큐에 추가
  matchDequeue(user);
  matchEnqueue(dungeonCode, user);

  // Response 보내기도 전에 즉시 매칭된 경우는??

  // 추가 후 S_DungeonMatch response 보내기
  socket.sendResponse(SuccessCode.Success, '매칭 시작', payloadTypes.S_DUNGEON_MATCH, {
    dungeonCode,
  });
};

export default dungeonMatchHandler;
