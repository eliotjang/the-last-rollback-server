import { payloadTypes } from '../../constants/packet.constants.js';
import {
  getDungeonSessionByUserId,
  getDungeonSessionByUserSocket,
} from '../../session/dungeon.session.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';

// 레거시 코드
const dayRoundReadyHandler = ({ socket, accountId, packet }) => {
  // TODO: 게임 준비 상태 설정
  const user = getUserById(accountId);
  if (!user) {
    throw new CustomError(ErrorCodes.USER_NOT_FOUND, `유저 [${accountId}]를 찾을 수 없습니다.`);
  }
  const dungeon = getDungeonSessionByUserId(accountId);
  if (!dungeon) {
    throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '던전 세션을 찾을 수 없습니다.');
  }

  const isReady = dungeon.toggleReadyState(user);
  if (typeof isReady === 'undefined') {
    return;
  }

  // TODO: 준비 상태 변경 알림
  socket.sendResponse(
    SuccessCode.Success,
    `준비 ${isReady ? '완료' : '해제'}`,
    payloadTypes.S_DAY_ROUND_READY,
    { isReady },
  );
};

// 레거시 코드
// toggleReadyState(user) {
//   if (this.phase !== dc.phases.DAY) return;
//   const idx = this.users.findIndex((targetId) => targetId === user.accountId);
//   if (idx === -1) {
//     throw new CustomError(ErrorCodes.USER_NOT_FOUND, `유저가 세션에 없습니다: ${accountId}`);
//   }
//   if (this.readyStates[idx]) {
//     return true;
//   }
//   this.readyStates[idx] = true; // !this.readyStates[idx];
//   for (const state of this.readyStates) {
//     if (!state) {
//       return this.readyStates[idx];
//     }
//   }
//   // all users are ready
//   this.phase = dc.phases.DAY_STARTED;
//   this.startDayRoundTimer();
// }

export default dayRoundReadyHandler;
