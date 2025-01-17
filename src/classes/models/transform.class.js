const MAX_X = 9;
const MIN_X = -9;
const MAX_Z = 8;
const MIN_Z = -8;
const MAX_ROT = 360;
const MIN_ROT = 0;
const POS_Y = 1;

export class Transform {
  constructor(posX = 0, posY = 1, posZ = 0, rot = 0) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rot = rot;
  }

  updateTransform(transform) {
    this.posX = transform.posX;
    this.posY = transform.posY;
    this.posZ = transform.posZ;
    this.rot = transform.rot;
    return {
      posX: this.posX,
      posY: this.posY,
      posZ: this.posZ,
      rot: this.rot,
    };
  }

  setTownSpawn() {
    this.posX = Math.random() * (MAX_X - MIN_X) + MIN_X;
    this.posY = POS_Y;
    this.posZ = Math.random() * (MAX_Z - MIN_Z) + MIN_Z;
    this.rot = Math.random() * (MAX_ROT - MIN_ROT) + MIN_ROT;
  }

  calculateDistance(transform) {
    const x = transform.posX - this.posX;
    const y = transform.posY - this.posY;
    const z = transform.posZ - this.posZ;

    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  }
}
