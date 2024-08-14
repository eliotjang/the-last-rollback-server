import { getGameAssets } from '../../init/assets.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';
import { Base } from '../../classes/models/structure.class.js';

export const enterDungeonSession = async (dungeonSession, dungeonCode) => {
  const base = new Base(DUNGEON_CODE);
  dungeonSession.addStructure(base);

  const dungeonInfo = dungeonUtils.fetchDungeonInfo(dungeonCode, 1);
  dungeonSession.setMonsters(dungeonCode, dungeonInfo.monsters);

  const playerInfos = [];
  const playerStatus = [];

  for (let i = 0; i < dungeonSession.users.length; i++) {
    const user = dungeonSession.users[i];
    dungeonSession.addPlayer(user.accountId, user.player);
    const info = dungeonSession.getPlayer(user.accountId).playerInfo;
    const stat = dungeonSession.getPlayer(user.accountId).playerStatus;
    playerInfos.push({ ...info });
    playerStatus.push({
      playerLevel: stat.playerLevel,
      playerName: info.nickname,
      playerFullHp: stat.baseStatInfo.maxHp,
      playerFullMp: stat.baseStatInfo.maxMp,
      playerCurHp: stat.playerHp,
      playerCurMp: stat.playerMp,
      atk: stat.baseStatInfo.atk,
      def: stat.baseStatInfo.def,
      specialAtk: stat.baseStatInfo.specialAtk,
      speed: stat.baseStatInfo.speed,
      attackRange: stat.baseStatInfo.attackRange,
      coolTime: stat.baseStatInfo.coolTime,
    });
  }

  const data = { dungeonInfo, playerInfo: playerInfos, players: playerStatus };
  console.log(data);

  for (const user of dungeonSession.users) {
    user.socket.sendResponse(
      SuccessCode.Success,
      '던전에 입장합니다.',
      payloadTypes.S_ENTER_DUNGEON,
      data,
    );
  }
};
