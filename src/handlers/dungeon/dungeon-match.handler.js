import { payloadTypes } from '../../constants/packet.constants.js';
import { matchEnqueue } from '../../match_queue/producers/match_queue.producer.js';
import { getUserById } from '../../session/user.session.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';

const dungeonMatchHandler = async ({ socket, accountId, packet }) => {
  // packet == C_DungeonMatch
  const { dungeonCode } = packet;

  // 매치 Queue에 유저 추가
  const user = getUserById(accountId);
  matchEnqueue(dungeonCode, user);

  // Response 보내기도 전에 즉시 매칭된 경우는??

  // 추가 후 S_DungeonMatch response 보내기
  socket.sendResponse(SuccessCode.Success, '매칭 시작', payloadTypes.S_DUNGEON_MATCH, {
    dungeonCode,
  });
};

export default dungeonMatchHandler;
