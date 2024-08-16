import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

// 레거시 코드
// 플레이어가 몬스터 공격
const attackMonsterHandler = ({ socket, accountId, packet }) => {
  // C_PLAYER_ATTACK
  try {
    const { attackType, monsterIdx } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    dungeonSession.attackMonster(accountId, attackType, monsterIdx);

    socket.sendResponse(
      SuccessCode.Success,
      `플레이어(${accountId})가 몬스터(${monsterIdx}) 공격`,
      payloadTypes.S_PLAYER_ATTACK,
      { playerId: accountId, attackType, monsterIdx },
    );
  } catch (e) {
    handleError(e);
  }
};

export default attackMonsterHandler;
