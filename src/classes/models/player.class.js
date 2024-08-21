import { maxBox } from '../../constants/game.constants.js';
import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

export class Player {
  constructor(playerId, nickname, charClass, accountLevel = 1, accountExp = 0) {
    this.playerId = playerId;
    this.nickname = nickname;
    this.charClass = charClass;
    this.transform = new Transform();
    this.accountLevel = accountLevel;
    this.accountExp = accountExp;
  }

  updateAccountExp(exp) {
    this.accountExp += exp;
    const data = getGameAssets().userInfo.data;
    while (this.accountExp >= data[this.accountLevel - 1].maxExp) {
      if (this.accountLevel >= data[data.length - 1].level) {
        this.accountExp = data[this.accountLevel - 1].maxExp;
        break;
      }
      this.accountExp -= data[this.accountLevel - 1].maxExp;
      this.accountLevel++;
    }
  }
}

export class DungeonPlayer {
  constructor(player) {
    this.playerInfo = player;
    this.playerInfo.transform = new Transform();
    this.playerStatus = new DungeonPlayerStatus(this.playerInfo.charClass);
    this.gold = 3000;
    this.mysteryBox = 0;
    this.killed = []; // 처치 몬스터 index
    this.isDead = false; // 플레이어 상태, (생존: false, 죽음: true)
  }

  /**
   * 플레이어의 공격 사거리 안에 타겟 몬스터가 있는 지 확인.
   * @param {Monster} targetMonster 타겟 몬스터
   * @return {Boolean} true: 공격 사거리 안에 타겟 몬스터가 존재.
   */
  verifyAttack(targetMonster) {
    const distance = this.playerInfo.transform.calculateDistance(targetMonster.transform);
    if (distance <= this.playerStatus.statInfo.attackRange + 1) return true;
    return false;
  }

  useSkill() {
    const useMp = 100;
    if (this.playerStatus.playerMp < useMp) return false;
    this.updateMp(-useMp);
    return true;
  }

  hit(damage) {
    if (this.isDead) {
      console.log(`플레이어(${this.playerInfo.playerId})가 이미 사망함`);
      return null;
    }
    return this.updateHp(-damage);
  }

  updateExp(exp) {
    this.playerStatus.updateExp(exp);
  }

  updateHp(amount) {
    const hp = this.playerStatus.updateHp(amount);
    if (hp === 0) this.isDead = true;
    return hp;
  }

  updateMp(amount) {
    return this.playerStatus.updateMp(amount);
  }

  updateBox(n) {
    if (this.mysteryBox + n < 0) {
      return null;
    }
    this.mysteryBox += n;

    if (this.mysteryBox > maxBox) {
      this.mysteryBox = maxBox;
    }
    return this.mysteryBox;
  }

  resetBox() {
    this.mysteryBox = 0;
  }

  resetKilled() {
    this.killed = [];
  }

  updateGold(gold) {
    if (this.gold + gold < 0) {
      return null;
    }
    this.gold += gold;
    return this.gold;
  }

  updateTransform(transform) {
    return this.playerInfo.transform.updateTransform(transform);
  }
}

export class DungeonPlayerStatus {
  constructor(charClass, playerLevel = 1, playerExp = 0, addStatInfo = new StatInfo({})) {
    this.charClass = charClass;
    this.playerLevel = playerLevel;
    this.playerExp = playerExp;
    this.addStatInfo = addStatInfo;
    this.statInfo = new StatInfo(getGameAssets().charStatInfo[charClass][playerLevel - 1]).addStat(
      addStatInfo,
    );
    this.playerHp = this.statInfo.maxHp;
    this.playerMp = this.statInfo.maxMp;
  }

  updateExp(exp) {
    this.playerExp += exp;
    while (this.playerExp >= this.statInfo.maxExp) {
      this.playerExp -= this.statInfo.maxExp;
      if (!this.updateLevel()) break;
    }
    return this.playerExp;
  }

  updateLevel() {
    const data = getGameAssets().charStatInfo[this.charClass];
    if (this.playerLevel >= data[data.length - 1].level) {
      this.playerExp = this.statInfo.maxExp;
      return null;
    }
    this.playerLevel++;
    this.statInfo = new StatInfo(data[this.playerLevel - 1]).addStat(this.addStatInfo);
    this.playerHp = this.statInfo.maxHp;
    this.playerMp = this.statInfo.maxMp;
    return this.playerLevel;
  }

  updateHp(hp) {
    this.playerHp += hp;
    if (this.playerHp <= 0) {
      this.playerHp = 0;
    } else if (this.playerHp > this.statInfo.maxHp) {
      this.playerHp = this.statInfo.maxHp;
    }
    return this.playerHp;
  }

  updateMp(mp) {
    this.playerMp += mp;
    if (this.playerMp <= 0) {
      this.playerMp = 0;
    } else if (this.playerMp > this.statInfo.maxMp) {
      this.playerMp = this.statInfo.maxMp;
    }
    return this.playerMp;
  }
}

export class StatInfo {
  constructor({
    maxExp = 0,
    maxHp = 0,
    maxMp = 0,
    atk = 0,
    def = 0,
    specialAtk = 0,
    speed = 0,
    attackRange = 0,
    coolTime = 0,
  }) {
    this.maxExp = maxExp;
    this.maxHp = maxHp;
    this.maxMp = maxMp;
    this.atk = atk;
    this.def = def;
    this.specialAtk = specialAtk;
    this.speed = speed;
    this.attackRange = attackRange;
    this.coolTime = coolTime;
  }

  addStat(addStatInfo) {
    this.maxHp += addStatInfo.maxHp;
    this.maxMp += addStatInfo.maxMp;
    this.atk += addStatInfo.atk;
    this.def += addStatInfo.def;
    this.specialAtk += addStatInfo.specialAtk;
    this.speed += addStatInfo.speed;
    this.attackRange += addStatInfo.attackRange;
    this.coolTime += addStatInfo.coolTime;

    return this;
  }
}
