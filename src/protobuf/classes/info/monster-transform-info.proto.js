import { getGameAssets } from '../../../init/assets.js';

export class MonsterTransformInfo {
  constructor(dungeonCode) {
    const { monsterSpawnLocate } = getGameAssets();
    const data = monsterSpawnLocate.data.filter((element) => dungeonCode === element.dungeonCode);
    const ranNum = Math.floor(Math.random() * data.length);
    this.posX = data[ranNum].posX;
    this.posY = data[ranNum].posY;
    this.posZ = data[ranNum].posZ;
    this.rot = 1;
  }

  getTransform() {
    return { posX: this.posX, posY: this.posY, posZ: this.posZ, rot: this.rot };
  }
}

export default MonsterTransformInfo;
