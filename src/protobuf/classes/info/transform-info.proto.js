const MAX_X = 9;
const MIN_X = -9;
const MAX_Z = 8;
const MIN_Z = -8;
const MAX_ROT = 360;
const MIN_ROT = 0;
const POS_Y = 1;

class TransformInfo {
  constructor() {
    this.posX = Math.random() * (MAX_X - MIN_X) + MIN_X;
    this.posY = POS_Y;
    this.posZ = Math.random() * (MAX_Z - MIN_Z) + MIN_Z;
    this.rot = Math.random() * (MAX_ROT - MIN_ROT) + MIN_ROT;
  }

  getTransform() {
    return { posX: this.posX, posY: this.posY, posZ: this.posZ, rot: this.rot };
  }
}

export default TransformInfo;
