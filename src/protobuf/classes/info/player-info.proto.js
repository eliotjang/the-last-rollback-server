import TransformInfo from './transform-info.proto.js';

class PlayerInfo {
  /**
   *
   * @param {*} playerId
   * @param {*} nickname
   * @param {*} characterClass
   * @param {TransformInfo} transform
   * @param {*} statInfo
   */
  constructor(playerId, nickname, characterClass, transform, statInfo) {
    this.playerId = playerId++;
    this.nickname = nickname;
    this.characterClass = characterClass;
    this.transform = transform;
    this.statInfo = statInfo;
  }
}

export default PlayerInfo;
