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
  }
}
