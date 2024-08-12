import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

class Monster {
  constructor(monsterModel) {
    const { monsterInfo } = getGameAssets();
    const data = monsterInfo.monsterModels[monsterModel];

    this.monsterModel = monsterModel;
    this.monsterName = data.monsterName;
    this.monsterHp = data.monsterHp;
    this.killExp = data.killExp;
    this.atk = data.atk;
    this.transform = new Transform();
  }

  setSpawnLocate(dungeonCode) {
    const { monsterSpawnLocate } = getGameAssets();
    const data = monsterSpawnLocate.dungeonCodes[dungeonCode];
    const ranNum = Math.floor(Math.random() * data.length);
    this.transform = new Transform(data[ranNum].posX, data[ranNum].posY, data[ranNum].posZ);
  }

  attack(targetDungeonPlayer) {
    if (targetDungeonPlayer.playerInfo.isDead) {
      return;
    }
    targetDungeonPlayer.hit(this.atk);
  }
}
