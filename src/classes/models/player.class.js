import { getGameAssets } from '../../init/assets.js';
import { getProtoMessages } from '../../init/proto.init.js';
import protobuf from 'protobufjs';
import { Transform } from './transform.class.js';
import { pickUpItemType } from '../../constants/dungeon.constants.js';

export class Player {
  constructor(playerId, nickname, charClass, accountLevel = 1, accountExp = 0) {
    this.playerInfo = new PlayerInfo(playerId, nickname, charClass);
    this.accountLevel = accountLevel;
    this.accountExp = accountExp;
  }

  updateAccountExp(exp) {
    this.accountExp += exp;
    const data = getGameAssets().data;
    while (this.accountExp >= data[this.accountLevel - 1].maxExp) {
      if (this.accountLevel >= data[data.length - 1].level) {
        this.accountExp = data[this.accountLevel - 1].maxExp;
        break;
      }
      this.accountLevel++;
      this.accountExp -= data[this.accountLevel - 1].maxExp;
    }
  }
}

export class DungeonPlayer extends Player {
  constructor(player) {
    super(
      player.playerId,
      player.nickname,
      player.charClass,
      player.accountLevel,
      player.accountExp,
    );
    this.playerInfo = new DungeonPlayerInfo(this.playerInfo);
    this.playerStatus = new DungeonPlayerStatus(this.playerInfo.charClass);
  }

  attack(targetMonster) {
    targetMonster.hit(this.playerStatus.getStatInfo().atk);
    // const monsterHp = targetMonster.hit(this.playerStatus.getStatInfo().atk);
    // if(monsterHp <= 0 ){
    //   this.playerInfo.killed.push(targetMonster);
    //   return true;
    // }
    // return false;
  }

  hit(damage) {
    if (this.playerInfo.isDead) {
      console.log(`플레이어(${this.playerInfo.playerId})가 이미 사망함`);
      return null;
    }
    this.playerStatus.playerHp -= damage;
    if (this.playerStatus.playerHp <= 0) {
      this.playerStatus.playerHp = 0;
      this.playerInfo.isDead = true;
    }
    return this.playerStatus.playerHp;
  }

  updateExp(exp) {
    // this.playerStatus.updateExp(exp);

    this.playerStatus.playerExp += exp;
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
  }

  updateHp(hp) {
    if (this.playerStatus.playerHp + hp < 0) {
      return null;
    }
    this.playerStatus.playerHp += hp;
    const data = getGameAssets().charStatInfo[this.playerInfo.charClass];
    if (this.playerStatus.playerHp > data.maxHp) {
      this.playerStatus.playerHp = data.maxHp;
    }
    return this.playerStatus.playerHp;
  }

  updateMp(mp) {
    if (this.playerStatus.playerMp + mp < 0) {
      return null;
    }
    this.playerStatus.playerMp += mp;
    const data = getGameAssets().charStatInfo[this.playerInfo.charClass];
    if (this.playerStatus.playerMp > data.maxMp) {
      this.playerStatus.playerMp = data.maxMp;
    }
    return this.playerStatus.playerMp;
  }

  updateBox(n) {
    if (this.playerInfo.mysteryBox + n < 0) {
      return null;
    }
    this.playerInfo.mysteryBox += n;
    const data = getGameAssets().charStatInfo[this.playerInfo.charClass];
    if (this.playerInfo.mysteryBox > data.maxBox) {
      this.playerInfo.mysteryBox = data.maxBox;
    }
    return this.playerInfo.mysteryBox;
  }

  updateTransform(transform) {
    this.playerInfo.transform = transform;
    return this.playerInfo.transform;
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
    this.gold = 0;
    this.mysteryBox = 0;
    this.killed = []; // 죽인 몬스터
    this.isDead = false; // 플레이어 상태, (생존: false, 죽음: true)
  }
}

export class DungeonPlayerStatus {
  constructor(charClass, playerLevel = 1, playerExp = 0, addStatInfo = {}) {
    // this.charClass = charClass;
    this.playerLevel = playerLevel;
    this.playerExp = playerExp;
    this.baseStatInfo = new StatInfo(getGameAssets().charStatInfo[charClass][playerLevel - 1]);
    this.addStatInfo = addStatInfo;
    // this.playerHp = baseStatInfo.maxHp + addStatInfo.maxHp;
    // this.playerMp = baseStatInfo.maxMp + addStatInfo.maxMp;
    this.playerHp = this.baseStatInfo.maxHp;
    this.playerMp = this.baseStatInfo.maxMp;
  }

  // updateExp(exp) {
  //   this.playerExp += exp;
  //   const data = getGameAssets().charStatInfo[this.charClass];
  //   while (this.playerExp >= this.baseStatInfo.maxExp) {
  //     if (this.playerLevel >= data[data.length - 1].level) {
  //       this.playerExp = this.baseStatInfo.maxExp;
  //       break;
  //     }

  //     this.playerLevel++;
  //     this.playerExp -= this.baseStatInfo.maxExp;
  //     this.baseStatInfo = new StatInfo(data[this.playerLevel - 1]);
  //   }
  // }

  getStatInfo() {
    return new StatInfo(this.baseStatInfo).addStat(this.addStatInfo);
  }
}

export class StatInfo {
  constructor({ maxExp, maxHp, maxMp, atk, def, specialAtk, speed, attackRange, coolTime }) {
    this.maxExp = maxExp ??= 0;
    this.maxHp = maxHp ??= 0;
    // this.hp = maxHp;
    this.maxMp = maxMp ??= 0;
    // this.mp = maxMp;
    this.atk = atk ??= 0;
    this.def = def ??= 0;
    this.specialAtk = specialAtk ??= 0;
    this.speed = speed ??= 0;
    this.attackRange = attackRange ??= 0;
    this.coolTime = coolTime ??= 0;
  }

  addStat(addStatInfo) {
    this.maxHp += addStatInfo.maxHp;
    // this.hp = maxHp;
    this.maxMp += addStatInfo.maxMp;
    // this.mp = maxMp;
    this.atk += addStatInfo.atk;
    this.def += addStatInfo.def;
    this.specialAtk += addStatInfo.specialAtk;
    this.speed += addStatInfo.speed;
    this.attackRange += addStatInfo.attackRange;
    this.coolTime += addStatInfo.coolTime;
  }
}

// class Dungeon extends Game {
//   constructor(id, dungeonCode) {
//     super(id, dc.general.MAX_USERS);
//     this.type = sessionTypes.DUNGEON;
//     this.players = new Map(Player(accountExp, playerInfos, playerStatus)); // key: accountId, value: DungeonPlayer
//     this.dungeonCode = dungeonCode;
//     this.phase = dc.phases.STANDBY;
//     this.readyStates = [];

//     this.dungeonInfo = null;

//     this.round = null;
//     this.roundMonsters = [Monster()]; // Monster
//     this.towers = [Tower(towerHp)];
//     this.pickUpItems = [Item(itemName, probability)];
//     this.roundKillCount = 0;
//     this.timers = new Map();
//     this.startTime = Date.now();
//   }

//   add(playerId) {
//     this.players.set(playerId, Player);
//   }
// }

// testCode
// const tr = new Transform(1, 1, 1, 1);
// const tr1 = { posX: 1, posY: 1, posZ: 1, rot: 1 };

// console.log(tr, tr1);

// const root = new protobuf.Root();
// root.loadSync('./src/protobuf/protocol.proto');
// const Msg = root.lookupType('Google.Protobuf.Protocol.TransformInfo');

// const a = Msg.encode(tr).finish();
// const b = Msg.encode(tr1).finish();

// console.log(a);
// console.log(b);

// console.log(new StatInfo({ atk: 1 }));

// const aa = new Player('aa', 'aaa', 1001);
// console.log({ ...aa });
// console.log({ ...aa.playerInfo, accountLevel: aa.accountLevel });

// const c = new DungeonPlayer(new Player('c','c',1001));
// console.log(c);
// console.log(c as Player)
