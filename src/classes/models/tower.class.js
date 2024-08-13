import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

export class Tower {
  constructor(dungeonCode) {
    this.hp = getGameAssets().stageUnlock.data[dungeonCode - 1].towerHp;
    this.transform = new Transform();
  }

  updateTowerHp(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    return this.towerHp;
  }
}
