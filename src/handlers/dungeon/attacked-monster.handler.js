import { enqueueMonsterHitJob } from '../../bull/monster/monster-kill.js';
import { attackTypes } from '../../constants/game.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

// 몬스터 피격
const attackedMonsterHandler = ({ socket, accountId, packet }) => {
  // C_MONSTER_ATTACKED
  try {
    const { attackType, monsterIdx } = packet;
    console.log('몬스터 피격 정보 : ', attackType, monsterIdx);

    const user = getUserById(accountId);

    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    const player = dungeonSession.getPlayer(accountId);
    let damage;
    switch (attackType) {
      case attackTypes.NORMAL:
        damage = player.playerStatus.getStatInfo().atk;
        break;
      case attackTypes.SKILL:
        damage = player.playerStatus.getStatInfo().specialAtk;
        break;
      default:
        damage = player.playerStatus.getStatInfo().atk;
    }

    const jobData = {
      accountId,
      monsterIdx,
      damage,
    };
    enqueueMonsterHitJob(jobData);
  } catch (e) {
    handleError(e);
  }
};

export default attackedMonsterHandler;
