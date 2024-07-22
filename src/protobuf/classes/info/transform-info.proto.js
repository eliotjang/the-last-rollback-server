class TransformInfo {
  /**
   *
   * @param {float} posX
   * @param {float} posY
   * @param {float} posZ
   * @param {float} rot
   */
  constructor(posX, posY, posZ, rot) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rot = rot;
  }
}

export default TransformInfo;
