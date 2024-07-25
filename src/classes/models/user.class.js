import { sessionTypes } from '../../constants/session.constants.js';
import { getBattleSession } from '../../session/battle.session.js';
import { getTownSession } from '../../session/town.session.js';

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

  getSessionId() {
    switch (this.sessionInfo.type) {
      case sessionTypes.TOWN:
        return getTownSession(this.sessionInfo.id);
      case sessionTypes.BATTLE:
        return getBattleSession(this.sessionInfo.id);
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
}

export default User;
