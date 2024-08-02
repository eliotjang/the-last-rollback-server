import { getGameAssets } from '../../init/assets.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
// import { findBaseHpByDungeonCode } from '../../utils/find-baseHp.utils.js';

export const enterDungeonSession = async (dungeonSession, dungeonCode) => {
  const { monsterInfo, charStatInfo, stageUnlock } = getGameAssets();

  const towerHp = stageUnlock[0].towerHp;
  dungeonSession.addTower(towerHp);

  const dungeonInfo = {
    dungeonCode,
    monsters: monsterInfo.data.map((monster, index) => ({
      monsterIdx: index,
      monsterModel: monster.monsterModel,
      monsterName: monster.monsterName,
      monsterHp: monster.monsterHp,
    })),
  };

  const round1 = new Map();
  const transform = {
    posX: 43.5,
    posY: 1.72,
    poxZ: 119.63,
    rot: 0,
  };

  for (let i = 0; i < dungeonInfo.monsters; i++) {
    const monsterIdx = i;
    const data = {
      monsterModel: dungeonInfo.monsters[i].monsterModel,
      monsterName: dungeonInfo.monsters[i].monsterName,
      monsterTransform: transform,
      killExp: 100,
    };
    round1.set(monsterIdx, data);
  }

  // 첫번째 몬스터 라운드 저장
  const roundMonsters = dungeonSession.addRoundMonsters(1, round1, true);
  console.log('roundMonsters : ', roundMonsters);

  // const dungeonSession = getDungeonSessionByUserId(accountId);

  // dungeonSession.users.forEach((user) => {
  //   console.log(`sessionInfo for user ${user.accountId}:`, user.sessionInfo);
  // });

  const playerInfos = new Map();
  const playerStats = new Map();
  const playerInfoArray = [];
  const playerStatusArray = [];

  if (dungeonSession) {
    const accountIds = dungeonSession.users.map((user) => user.accountId);

    for (const accountId of accountIds) {
      const playerChar = await gameCharDB.getGameChar(accountId);
      const playerInfo = {
        nickname: playerChar.nickname,
        charClass: playerChar.charClass,
        transform: null,
        gold: 0,
        itemBox: 0,
      };
      playerInfos.set(accountId, playerInfo);

      // 기존 코드
      const playerInfo2 = {
        playerId: playerChar.playerId,
        nickname: playerChar.nickname,
        charClass: playerChar.charClass,
        transform: playerChar.transform,
      };
      playerInfoArray.push(playerInfo2);

      const playerStatus = {
        playerLevel: charStatInfo[playerChar.charClass][0].level,
        playerExp: 0,
        playerHp: charStatInfo[playerChar.charClass][0].hp,
        playerMp: charStatInfo[playerChar.charClass][0].mp,
      };
      playerStats.set(accountId, playerStatus);

      // 기존 코드
      const charStats = charStatInfo['1001'];
      const playerStatus2 = charStats.map((stat) => ({
        playerLevel: stat.level,
        playerName: playerChar.nickname,
        playerFullHp: stat.maxHp,
        playerFullMp: stat.maxMp,
        playerCurHp: stat.hp,
        playerCurMp: stat.mp,
      }))[0];

      playerStatusArray.push(playerStatus2);
    }
  }

  const addPlayers = dungeonSession.addPlayers(playerInfos, playerStats, true);
  console.log('players : ', addPlayers);

  const data = { dungeonInfo, playerInfo: playerInfoArray, players: playerStatusArray };

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
