import { sessionTypes } from '../../constants/session.constants.js';
import { getDungeonSession } from '../../session/dungeon.session.js';
import { getTownSession } from '../../session/town.session.js';
import { dungeonRedis } from '../../utils/redis/dungeon.redis.js';
import { townRedis } from '../../utils/redis/town.redis.js';

class User {
  constructor(accountId, socket) {
    this.accountId = accountId;
    this.socket = socket;
    this.sequence = 0;

    // 유저가 포함된 게임 세션 정보
    this.sessionInfo = {
      type: sessionTypes.NULL, // 세션 타입 (0: null || 1: town || 2: battle)
      id: null, // 세션 id
    };
  }

  getNextSequence() {
    return ++this.sequence;
  }

  getSession() {
    let getSessionFunc;
    switch (this.sessionInfo.type) {
      case sessionTypes.TOWN:
        getSessionFunc = getTownSession;
        break;
      case sessionTypes.DUNGEON:
        getSessionFunc = getDungeonSession;
        break;
      default:
        return null;
    }
    return getSessionFunc(this.sessionInfo.id);
  }

  async getPlayerInfo() {
    switch (this.sessionInfo.type) {
      case sessionTypes.TOWN:
        return await townRedis.getPlayerInfo(this.accountId);
      case sessionTypes.BATTLE:
        return await dungeonRedis.getPlayerInfo(this.accountId);
      default:
        return null;
    }
  }

  setSession(sessionType, sessionId) {
    this.sessionInfo.type = sessionType;
    this.sessionInfo.id = sessionId;
  }

  removeSession() {
    this.sessionInfo.type = sessionTypes.NULL;
    this.sessionInfo.id = null;
  }

  async removePlayerInfo() {
    switch (this.sessionInfo.type) {
      case sessionTypes.TOWN:
        return await townRedis.removePlayer(this.accountId);
      case sessionTypes.BATTLE:
        return await dungeonRedis.removePlayer(this.accountId);
      default:
        return null;
    }
  }
}

export default User;
