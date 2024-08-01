import { getGameAssets } from '../../init/assets.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';

export const enterDungeonSession = async (dungeonSession, dungeonCode) => {
  const { monsterInfo, charStatInfo } = getGameAssets();
  const dungeonInfo = {
    dungeonCode,
    monsters: monsterInfo.data.map((monster, index) => ({
      monsterIdx: index + 1,
      monsterModel: monster.monsterModel,
      monsterName: monster.monsterName,
      monsterHp: monster.maxHp,
    })),
  };

  // const dungeonSession = getDungeonSessionByUserId(accountId);

  // dungeonSession.users.forEach((user) => {
  //   console.log(`sessionInfo for user ${user.accountId}:`, user.sessionInfo);
  // });

  const playerInfoArray = [];
  const playerStatusArray = [];

  if (dungeonSession) {
    const accountIds = dungeonSession.users.map((user) => user.accountId);

    for (const accountId of accountIds) {
      const playerChar = await gameCharDB.getGameChar(accountId);
      const playerInfo = {
        playerId: playerChar.playerId,
        nickname: playerChar.nickname,
        charClass: playerChar.charClass,
        transform: playerChar.transform,
      };
      playerInfoArray.push(playerInfo);

      const charStats = charStatInfo['1001'];
      const playerStatus = charStats.map((stat) => ({
        playerLevel: stat.level,
        playerName: playerChar.nickname,
        playerFullHp: stat.maxHp,
        playerFullMp: stat.maxMp,
        playerCurHp: stat.hp,
        playerCurMp: stat.mp,
      }))[0];

      playerStatusArray.push(playerStatus);
    }
  }

  const data = { dungeonInfo, playerInfo: playerInfoArray, players: playerStatusArray };
  // console.log('data:', data);

  for (const user of dungeonSession.users) {
    user.socket.sendResponse(
      SuccessCode.Success,
      '던전에 입장합니다.',
      payloadTypes.S_ENTER_DUNGEON,
      data,
    );
  }
  // const currentUser = dungeonSession.users.find((user) => user.accountId === accountId);
  // console.log('currentUser:', currentUser);

  // currentUser.socket.sendResponse(
  //   SuccessCode.Success,
  //   '던전에 입장합니다.',
  //   payloadTypes.S_ENTER_DUNGEON,
  //   data,
  // );
};
