import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

export class Structure {
  constructor() {
    this.hp = 0;
    this.transform = new Transform();
  }

  updateStructureHp(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    return this.towerHp;
  }

  setLocate(transform) {
    this.transform = new Transform(transform.posX, transform.posY, transform.posZ);
  }
}

export class Base extends Structure {
  constructor(dungeonCode) {
    super();
    const data = getGameAssets().stageUnlock.data.find((e) => e.dungeonCode === dungeonCode);
    this.hp = data.baseHp;
    this.transform = new Transform(data.posX, data.posY, data.posZ);
  }
}
