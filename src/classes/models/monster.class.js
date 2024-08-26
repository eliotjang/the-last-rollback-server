import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

export class Monster {
  constructor(monsterModel) {
    const { monsterInfo } = getGameAssets();
    const data = monsterInfo.monsterModels[monsterModel];

    this.monsterModel = monsterModel;
    this.monsterName = data.monsterName;
    this.monsterHp = data.monsterHp;
    this.killExp = data.killExp;
    this.atk = data.atk;
    this.transform = new Transform();
    this.isDead = false;
  }

  setSpawnLocate(dungeonCode) {
    const { monsterSpawnLocate } = getGameAssets();
    const data = monsterSpawnLocate.dungeonCodes[dungeonCode];
    const ranNum = Math.floor(Math.random() * data.length);
    this.transform = new Transform(data[ranNum].posX, data[ranNum].posY, data[ranNum].posZ);
    return { ...this.transform };
  }

  attack(targetDungeonPlayer) {
    targetDungeonPlayer.hit(this.atk);
  }

  hit(damage) {
    if (this.isDead) return null;

    this.monsterHp -= damage;
    if (this.monsterHp <= 0) {
      this.isDead = true;
    }

    return this.monsterHp;
  }
}
