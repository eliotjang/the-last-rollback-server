import { payloadTypes } from '../constants/packet.constants.js';
import { SuccessCode } from '../utils/error/errorCodes.js';
import dungeonUtils from '../utils/dungeon/dungeon.utils.js';
import { Base } from '../classes/models/structure.class.js';
import { addDungeonSession } from '../session/dungeon.session.js';
import { getTownSessionByUserId } from '../session/town.session.js';
import { getUserById, getUserBySocket } from '../session/user.session.js';
import { townRedis } from '../utils/redis/town.redis.js';

const testEnterDungeonSession = async ({ socket, accountId, packet }) => {
  const { dungeonCode } = packet;

  const dungeonSession = addDungeonSession(dungeonCode);
  const townSession = getTownSessionByUserId(accountId);
  if (townSession) {
    townSession.removeUser(accountId);
  }

  const user = getUserById(accountId);
  dungeonSession.addUser(user);
  await townRedis.removePlayer(accountId, false);

  const base = new Base(dungeonCode);
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

  console.log('data', data);

  for (const user of dungeonSession.users) {
    user.socket.sendResponse(
      SuccessCode.Success,
      '던전에 입장합니다.',
      payloadTypes.S_ENTER_DUNGEON,
      data,
    );
  }
};

export default testEnterDungeonSession;
