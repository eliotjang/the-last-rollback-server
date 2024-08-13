import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

export class Structure {
  constructor(dungeonCode) {
    // 방어, 공격 구조물 추가시 애셋 변경 필요
    this.hp = getGameAssets().stageUnlock.data[dungeonCode - 1].towerHp;
    this.transform = new Transform();
  }

  updateStructureHp(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    return this.towerHp;
  }
}

export class Base extends Structure {
  constructor(dungeonCode) {
    super(dungeonCode);
  }
}
