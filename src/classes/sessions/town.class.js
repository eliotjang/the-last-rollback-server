import { payloadTypes, dediPacketTypes } from '../../constants/packet.constants.js';
import Game from './game.class.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { townRedis } from '../../utils/redis/town.redis.js';

const MAX_USERS = 20;

class Town extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.TOWN;
  }

  async addUser(user) {
    const playerInfos = await Promise.all(this.users.map((curUser) => curUser.getPlayerInfo()));
    super.addUser(user);

    if (playerInfos.length) {
      super.notifyUser(user.accountId, payloadTypes.S_SPAWN, { players: playerInfos });
    }

    const userInfo = await user.getPlayerInfo();
    super.notifyOthers(user.accountId, payloadTypes.S_SPAWN, { players: [userInfo] });
    this.systemChatAll(user.accountId, `${userInfo.nickname}님이 입장하였습니다.`);
    this.systemChat(
      user.accountId,
      `Town 세션에 입장하였습니다. 현재 세션 유저 수 : ${this.users.length}`,
    );
    console.log(
      'in town',
      this.users.map((user) => user.accountId),
    );
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll(payloadTypes.S_DESPAWN, { playerIds: [accountId] });
  }

  movePlayer(accountId, transform) {
    townRedis.updatePlayerTransform(transform, accountId).then(() => {
      super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
    });
  }

  // ------------ 추가 ------------
  playersLocationUpdate(deserialized) {
    super.notifyAll(dediPacketTypes.S_PLAYERS_LOCATION_UPDATE, { positions: deserialized });
  }

  actionPlayer(accountId, animCode) {
    super.notifyAll(payloadTypes.S_ANIMATION_PLAYER, { playerId: accountId, animCode });
  }

  chatPlayer(accountId, chatMsg) {
    super.notifyAll(payloadTypes.S_CHAT, { playerId: accountId, chatMsg });
  }

  systemChat(accountId, chatMsg) {
    super.notifyUser(accountId, payloadTypes.S_CHAT, {
      playerId: accountId,
      chatMsg,
      system: true,
    });
  }

  systemChatAll(accountId, chatMsg) {
    super.notifyAll(payloadTypes.S_CHAT, { playerId: accountId, chatMsg, system: true });
  }

  systemChatOthers(accountId, chatMsg) {
    super.notifyOthers(accountId, payloadTypes.S_CHAT, {
      playerId: accountId,
      chatMsg,
      system: true,
    });
  }

  animationPlayer(animCode, playerId, monsterIdx) {
    super.notifyAll(payloadTypes.S_ANIMATION_PLAYER, { animCode, playerId, monsterIdx });
  }
}

export default Town;
