import { enqueueMonsterHitJob } from '../../bull/monster/monster-kill.js';
import { attackTypes } from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getGameAssets } from '../../init/assets.js';
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

    // // 구조물이 몬스터를 공격하는 경우
    // if (attackType >= 100) {
    //   const { structureInfo } = getGameAssets();
    //   const data = structureInfo.data.find((element) => element.structureModel === 3);

    //   let damage;
    //   switch (attackType) {
    //     case 100:
    //       damage = data.power;
    //       break;
    //     case 101:
    //       const currentIndex = structureInfo.data.indexOf(data);
    //       nextData = structureInfo.data[currentIndex + 1];
    //       damage = nextData.power;
    //       break;
    //   }

    //   const jobData = {
    //     accountId,
    //     monsterIdx,
    //     damage,
    //     marker: true,
    //   };

    //   enqueueMonsterHitJob(jobData);
    //   return;
    // }

    // dungeonRedis에서 플레이어 playerInfo(charStatInfo) 가져옴
    const playerInfo = dungeonSession.getPlayerInfo(accountId);
    const playerStatus = dungeonSession.getPlayerStatus(accountId);
    const { charStatInfo, structureInfo } = getGameAssets();

    let damage;
    switch (attackType) {
      case attackTypes.NORMAL:
        damage = charStatInfo[playerInfo.charClass][playerStatus.playerLevel - 1].atk;
        break;
      case attackTypes.SKILL:
        damage = charStatInfo[playerInfo.charClass][playerStatus.playerLevel - 1].magic;
        break;
      case attackTypes.BALLISTA:
        const ballista = structureInfo.data.find(
          (structure) => structure.structureName === 'ballista',
        );
        damage = ballista.power;
      case attackTypes.LASER:
        const laser = structureInfo.data.find((structure) => structure.structureName === 'laser');
        damage = laser.power;
      default:
        damage = charStatInfo[playerInfo.charClass][playerStatus.playerLevel - 1].atk;
    }
    // monsterHp -= damage;
    // const monsterHp = 25;

    if (attackType !== attackTypes.NORMAL && attackType !== attackTypes.SKILL) {
      const jobData = {
        accountId,
        monsterIdx,
        damage,
        marker: true,
      };

      enqueueMonsterHitJob(jobData);
      return;
    }

    const jobData = {
      accountId,
      monsterIdx,
      damage,
    };

    enqueueMonsterHitJob(jobData);

    // const monster = dungeonSession.updatePlayerAttackMonster(accountId, monsterIdx, damage, true);

    // dungeonSession.attackedMonster(accountId, monsterIdx, monster.monsterHp);

    // socket.sendResponse(
    //   SuccessCode.Success,
    //   `몬스터(${monsterIdx})가 플레이어(${accountId})에 의해 피격, 몬스터 남은 체력: ${monster.monsterHp}`,
    //   payloadTypes.S_MONSTER_ATTACKED,
    //   {
    //     monsterIdx,
    //     monsterHp: monster.monsterHp,
    //   },
    // );
  } catch (e) {
    handleError(e);
  }
};

export default attackedMonsterHandler;
