import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';
import { getGameAssets } from '../../init/assets.js';

// 몬스터가 플레이어 공격 요청 시
const attackPlayerHandler = async ({ socket, accountId, packet }) => {
  try {
    const { monsterIdx, attackType, playerId } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    dungeonSession.updateMonsterAttackPlayer(playerId, monsterIdx, attackType);
  } catch (e) {
    handleError(socket, e);
  }
};

export default attackPlayerHandler;
