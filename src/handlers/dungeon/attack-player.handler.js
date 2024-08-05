import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';

// 몬스터가 플레이어 공격 요청 시
const attackPlayerHandler = async ({ socket, accountId, packet }) => {
  try {
    const { monsterIdx, attackType, playerId } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    // 거리 검증
    // verifyDistance();

    // Session에 저장되어 있는 정보를 가져와 처리
    // dungeonRedis에서 hp 정보 가져옴
    // let monsterHp = await dungeonRedis.get();

    // dungeonRedis에서 플레이어 playerInfo(charStatInfo) 가져옴
    // const playerInfo = await dungeonRedis.get(accountId);

    // let damage;
    // switch (attackType) {
    //   case 0:
    //     damage = playerInfo.statInfo.atk;
    //     break;
    //   case 1:
    //     damage = playerInfo.statInfo.magic;
    //     break;
    //   default:
    //     damage = 0;
    // }
    // monsterHp -= damage;

    const playerStatus = dungeonSession.updateMonsterAttackPlayer(playerId, 10, true);

    const playerHp = playerStatus.playerHp;

    dungeonSession.attackPlayer(monsterIdx, attackType, playerId, playerHp);
    console.log('attackPlayerHandler', packet);
  } catch (e) {
    handleError(e);
  }
};

export default attackPlayerHandler;
