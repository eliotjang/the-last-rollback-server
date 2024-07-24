class User {
  constructor(accountId, socket) {
    this.accountId = accountId;
    this.socket = socket;
    this.sequence = 0;
    this.sessionId = null; // 유저가 포함된 세션 id (null || town.id || battle.id)
  }

  getNextSequence() {
    return ++this.sequence;
  }

  getSessionId() {
    return this.sessionId;
  }
}

export default User;
