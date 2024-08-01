import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

// 몬스터 피격 시
const attackedMonsterHandler = ({ socket, accountId, packet }) => {
  try {
    const { attackType, monsterIdx } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

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
    const monsterHp = 25;

    dungeonSession.attackedMonster(accountId, monsterIdx, monsterHp);

    socket.sendResponse(
      SuccessCode.Success,
      `몬스터(${monsterIdx})가 플레이어(${accountId})에 의해 피격, 몬스터 남은 체력: ${monsterHp}`,
      payloadTypes.S_MONSTER_ATTACKED,
      {
        monsterIdx,
        monsterHp,
      },
    );
  } catch (e) {
    handleError(e);
  }
};

export default attackedMonsterHandler;
