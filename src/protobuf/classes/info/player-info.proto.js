import TransformInfo from './transform-info.proto.js';

class PlayerInfo {
  /**
   *
   * @param {*} accountId
   * @param {*} nickname
   * @param {*} characterClass
   * @param {TransformInfo} transform
   */
  constructor(accountId, nickname, characterClass, transform) {
    this.accountId = accountId;
    this.nickname = nickname;
    this.characterClass = characterClass;
    this.transform = transform;
  }
}

export default PlayerInfo;
