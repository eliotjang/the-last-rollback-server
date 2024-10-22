import { maxBox } from '../../constants/dungeon.constants.js';
import { SKILL_USE_MP } from '../../constants/game.constants.js';
import { getGameAssets } from '../../init/assets.js';
import { Transform } from './transform.class.js';

export class Player {
  constructor(playerId, nickname, charClass, accountLevel = 1, accountExp = 0) {
    this.playerInfo = new PlayerInfo(playerId, nickname, charClass);
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

export class DungeonPlayer extends Player {
  constructor(player) {
    super(
      player.playerInfo.playerId,
      player.playerInfo.nickname,
      player.playerInfo.charClass,
      player.accountLevel,
      player.accountExp,
    );
    this.playerInfo = new DungeonPlayerInfo(this.playerInfo);
    this.playerStatus = new DungeonPlayerStatus(this.playerInfo.charClass);
  }

  /**
   * 플레이어의 공격 사거리 안에 타겟 몬스터가 있는 지 확인.
   * @param {Monster} targetMonster 타겟 몬스터
   * @return {Boolean} true: 공격 사거리 안에 타겟 몬스터가 존재.
   */
  verifyAttack(targetMonster) {
    const distance = this.playerInfo.transform.calculateDistance(targetMonster.transform);
    if (distance <= this.playerStatus.getStatInfo().attackRange + 1) return true;
    return false;
  }

  useSkill() {
    if (this.playerStatus.playerMp < SKILL_USE_MP) return false;
    this.updateMp(-SKILL_USE_MP);
    return true;
  }

  hit(damage) {
    if (this.playerInfo.isDead) {
      console.log(`플레이어(${this.playerInfo.playerId})가 이미 사망함`);
      return null;
    }
    const dmg = Math.round(damage * (50 / (50 + this.playerStatus.getStatInfo().def)));
    this.playerStatus.playerHp -= dmg;
    if (this.playerStatus.playerHp <= 0) {
      this.playerStatus.playerHp = 0;
      this.playerInfo.isDead = true;
    }
    return this.playerStatus.playerHp;
  }

  updateExp(exp) {
    this.playerStatus.playerExp += exp;
  }

  updateLevel() {
    const data = getGameAssets().charStatInfo[this.playerInfo.charClass];
    while (this.playerStatus.playerExp >= this.playerStatus.baseStatInfo.maxExp) {
      if (this.playerStatus.playerLevel >= data[data.length - 1].level) {
        this.playerStatus.playerExp = this.playerStatus.baseStatInfo.maxExp;
        break;
      }

      this.playerStatus.playerLevel++;
      this.playerStatus.playerExp -= this.playerStatus.baseStatInfo.maxExp;
      this.playerStatus.baseStatInfo = new StatInfo(data[this.playerStatus.playerLevel - 1]);
    }
    this.updateHp(this.playerStatus.getStatInfo().maxHp);
    this.updateMp(this.playerStatus.getStatInfo().maxMp);
  }

  updateHp(hp) {
    this.playerStatus.playerHp += hp;
    if (this.playerStatus.playerHp <= 0) {
      this.playerStatus.playerHp = 0;
    } else if (this.playerStatus.playerHp > this.playerStatus.getStatInfo().maxHp) {
      this.playerStatus.playerHp = this.playerStatus.getStatInfo().maxHp;
    }
    return this.playerStatus.playerHp;
  }

  updateMp(mp) {
    this.playerStatus.playerMp += mp;
    if (this.playerStatus.playerMp <= 0) {
      this.playerStatus.playerMp = 0;
    } else if (this.playerStatus.playerMp > this.playerStatus.getStatInfo().maxMp) {
      this.playerStatus.playerMp = this.playerStatus.getStatInfo().maxMp;
    }
    return this.playerStatus.playerMp;
  }

  updateBox(n) {
    if (this.playerInfo.mysteryBox + n < 0) {
      return null;
    }
    this.playerInfo.mysteryBox += n;

    if (this.playerInfo.mysteryBox > maxBox) {
      this.playerInfo.mysteryBox = maxBox;
    }
    return this.playerInfo.mysteryBox;
  }

  resetBox() {
    this.playerInfo.mysteryBox = 0;
  }

  resetKilled() {
    this.playerInfo.killed = [];
  }

  updateGold(gold) {
    if (this.playerInfo.gold + gold < 0) {
      return null;
    }
    this.playerInfo.gold += gold;
    return this.playerInfo.gold;
  }

  updateRoundGold(round) {
    const data = getGameAssets().stage.data.find((e) => e.round === round);
    this.playerInfo.gold += data.reward;
    return data.reward;
  }

  updateTransform(transform) {
    return this.playerInfo.transform.updateTransform(transform);
  }

  revive() {
    this.playerInfo.isDead = false;
    this.updateHp(this.playerStatus.getStatInfo().maxHp);
    this.updateMp(this.playerStatus.getStatInfo().maxMp);
  }

  toPlayer() {
    return new Player(
      this.playerInfo.playerId,
      this.playerInfo.nickname,
      this.playerInfo.charClass,
      this.accountLevel,
      this.accountExp,
    );
  }
}

export class PlayerInfo {
  constructor(playerId, nickname, charClass) {
    this.playerId = playerId;
    this.nickname = nickname;
    this.charClass = charClass;
    this.transform = new Transform();
  }
}

export class DungeonPlayerInfo extends PlayerInfo {
  constructor(playerInfo) {
    super(playerInfo.playerId, playerInfo.nickname, playerInfo.charClass);
    this.gold = 3000;
    this.mysteryBox = 0;
    this.killed = []; // 처치 몬스터 index
    this.isDead = false; // 플레이어 상태, (생존: false, 죽음: true)
  }
}

export class DungeonPlayerStatus {
  constructor(charClass, playerLevel = 1, playerExp = 0, addStatInfo = new StatInfo({})) {
    this.playerLevel = playerLevel;
    this.playerExp = playerExp;
    this.baseStatInfo = new StatInfo(getGameAssets().charStatInfo[charClass][playerLevel - 1]);
    this.addStatInfo = addStatInfo;
    this.playerHp = this.baseStatInfo.maxHp;
    this.playerMp = this.baseStatInfo.maxMp;
  }

  getStatInfo() {
    const statInfo = new StatInfo(this.baseStatInfo);
    statInfo.addStat(this.addStatInfo);
    return statInfo;
  }
}

export class StatInfo {
  constructor({ maxExp, maxHp, maxMp, atk, def, specialAtk, speed, attackRange, coolTime }) {
    this.maxExp = maxExp ??= 0;
    this.maxHp = maxHp ??= 0;
    this.maxMp = maxMp ??= 0;
    this.atk = atk ??= 0;
    this.def = def ??= 0;
    this.specialAtk = specialAtk ??= 0;
    this.speed = speed ??= 0;
    this.attackRange = attackRange ??= 0;
    this.coolTime = coolTime ??= 0;
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
  }
}
