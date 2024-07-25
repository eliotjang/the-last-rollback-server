import TransformInfo from './transform-info.proto.js';

class PlayerInfo {
  /**
   *
   * @param {*} accountId
   * @param {*} nickname
   * @param {*} characterClass
   * @param {TransformInfo} transform
   * @param {*} statInfo
   */
  constructor(accountId, nickname, characterClass, transform, statInfo) {
    this.accountId = accountId;
    this.nickname = nickname;
    this.characterClass = characterClass;
    this.transform = transform;
    this.statInfo = statInfo;
  }
}

export default PlayerInfo;
