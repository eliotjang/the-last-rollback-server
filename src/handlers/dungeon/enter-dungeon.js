import { getGameAssets } from '../../init/assets.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';

export const enterDungeonSession = async (dungeonSession, dungeonCode) => {
  const { monsterInfo, charStatInfo, stageUnlock, pickUpItemInfo } = getGameAssets();

  const towerHp = stageUnlock.data[0].towerHp;
  dungeonSession.addTowerHp(towerHp);

  const pickUpItems = pickUpItemInfo.data.map((item) => ({
    itemIdx: item.itemIdx,
    itemName: item.itemName,
    HP: item.HP,
    MP: item.MP,
    BOX: item.BOX,
    probability: item.probability,
  }));

  dungeonSession.addPickUpList(pickUpItems);

  const dungeonInfo = dungeonUtils.fetchDungeonInfo(dungeonCode, 1);

  // 첫번째 몬스터 라운드 저장
  const roundMonsters = dungeonSession.addRoundMonsters(1, dungeonInfo.monsters, true);
  console.log('roundMonsters : ', roundMonsters);

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
        gold: 3000,
        itemBox: 0,
        killed: [],
      };
      playerInfos.set(accountId, playerInfo);

      // 기존 코드
      const playerInfo2 = {
        playerId: playerChar.playerId,
        nickname: playerChar.nickname,
        charClass: playerChar.charClass,
        transform: { posX: 0, posY: 1, posZ: 0, rot: 0 },
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
      const charStats = charStatInfo[playerChar.charClass];
      const playerStatus2 = charStats.map((stat) => ({
        playerLevel: stat.level,
        playerName: playerChar.nickname,
        playerFullHp: stat.maxHp,
        playerFullMp: stat.maxMp,
        playerCurHp: stat.hp,
        playerCurMp: stat.mp,
        atk: stat.atk,
        def: stat.def,
        specialAtk: stat.specialAtk,
        speed: stat.speed,
        attackRange: stat.attackRange,
        coolTime: stat.coolTime,
      }))[0];

      playerStatusArray.push(playerStatus2);
    }
  }

  const addPlayers = dungeonSession.addPlayers(playerInfos, playerStats, true);
  console.log('players : ', addPlayers);

  const data = { dungeonInfo, playerInfo: playerInfoArray, players: playerStatusArray };
  console.log(data);

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
