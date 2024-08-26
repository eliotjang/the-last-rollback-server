import dc, { gameResults, playerAnimTypes, REVIVE_GOLD } from '../../constants/game.constants.js';
import { payloadTypes, dediPacketTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import pickUpHandler from '../../handlers/dungeon/pick-up.handler.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import Game from './game.class.js';
import { userDB } from '../../db/user/user.db.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { DungeonPlayer } from '../models/player.class.js';
import { Monster } from '../models/monster.class.js';
import DediClient from '../../classes/sessions/dedi-client.class.js';
import dungeonConstants from '../../constants/game.constants.js';
import { removeDungeonSession } from '../../session/dungeon.session.js';

class Dungeon extends Game {
  constructor(id, dungeonCode) {
    super(id, dc.general.MAX_USERS);
    this.type = sessionTypes.DUNGEON;
    this.dungeonCode = dungeonCode;
    this.phase = dc.phases.STANDBY;
    this.readyStates = [];
    this.round = 1;
    this.roundKillCount = 0;
    this.timers = new Map();
    this.startTime = Date.now();
    this.structureIdx = 0;
    this.structures = new Map();
    this.players = new Map();
    this.roundMonsters = null;
    // this.dediClient = new DediClient(this.id);
    DediClient.addClient(this.id, new DediClient(this.id));
    DediClient.getClient(this.id).createSession(this.dungeonCode);
  }

  // #region 유저
  addUser(user) {
    super.addUser(user);
  }

  removeUser(accountId) {
    super.removeUser(accountId);
  }

  // #endregion

  // #region 구조물
  addStructure(structure, transform, accountId) {
    if (transform) {
      const currentIdx = this.structureIdx;
      this.structures.set(currentIdx, structure);
      const structureStatus = {
        structureModel: structure.structureModel,
        structureIdx: currentIdx,
        structureHp: structure.hp,
      };

      const playerGold = this.getPlayer(accountId).updateGold(-structure.gold);
      if (playerGold === null) {
        this.systemChat(accountId, `골드가 부족합니다.`);
        return null;
      }

      super.notifyAll(payloadTypes.S_STRUCTURE, {
        structureStatus,
        transform,
        gold: playerGold,
        playerId: accountId,
      });
      DediClient.getClient(this.id).addStructure(this.structureIdx++, structure.structureModel, {
        x: transform.posX,
        y: transform.posY,
        z: transform.posZ,
      });
      return;
    }
    DediClient.getClient(this.id).addStructure(this.structureIdx, structure.structureModel, {
      x: 0, // pos values won't matter for the base
      y: 0,
      z: 0,
    });
    this.structures.set(this.structureIdx++, structure);
  }

  getStructure(structureIdx) {
    return this.structures.get(structureIdx);
  }

  updateStructureHp(structureIdx, monsterIdx) {
    const monsterInfo = this.roundMonsters.get(monsterIdx);
    const structure = this.getStructure(structureIdx);
    structure.updateStructureHp(monsterInfo.atk);

    if (structure.hp <= 0) {
      DediClient.getClient(this.id).removeStructure(structureIdx);
      this.structures.delete(structureIdx);
    }

    if (structureIdx > 0) {
      this.notifyAll(payloadTypes.S_STRUCTURE_ATTACKED, {
        monsterIdx,
        structureIdx,
        structureHp: structure.hp,
      });
      return;
    }
    if (structureIdx === 0) {
      this.checkBaseHp(structure);
      super.notifyAll(payloadTypes.S_TOWER_ATTACKED, { towerHp: structure.hp });
    }
  }

  checkBaseHp(structure) {
    if (structure.hp <= 0) {
      this.phase = dc.phases.ENDING;
      DediClient.removeClient(this.id);
      this.endGame(gameResults.codes.GAME_OVER, gameResults.bonusExp.GAME_OVER);
    }
  }

  animationStructure(data) {
    super.notifyAll(payloadTypes.S_ANIMATION_STRUCTURE, data);
  }

  // #endregion

  // #region 몬스터
  setMonsters(dungeonCode, monsters) {
    this.roundMonsters = new Map();
    const data = [];

    monsters.forEach((monsterData) => {
      const { monsterIdx } = monsterData;
      const monster = new Monster(monsterData.monsterModel);
      monsterData.monsterTransform = monster.setSpawnLocate(dungeonCode);
      this.roundMonsters.set(monsterIdx, monster);

      data.push({ monsterIdx, monsterModel: monsterData.monsterModel });
      // data[monsterIdx] = monsterData.monsterModel;
    });

    console.log('JS -> 데디 몬스터 정보 : ', data);
    DediClient.getClient(this.id).setMonsters(data);

    return monsters;
  }

  getMonsters() {
    return this.roundMonsters;
  }

  getMonster(monsterIndex) {
    return this.roundMonsters.get(monsterIndex);
  }

  moveMonster(accountId, monsterIdx, transform) {
    const monster = this.getMonster(monsterIdx);
    if (!monster) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }
    const monsterTransform = monster.transform.updateTransform(transform);
    super.notifyOthers(accountId, payloadTypes.S_MONSTER_MOVE, {
      monsterIdx,
      transform: monsterTransform,
    });
  }

  updateMonsterAttackPlayer(accountId, monsterIdx, attackType) {
    const player = this.getPlayer(accountId);
    if (!player) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const monster = this.getMonster(monsterIdx);
    if (!monster) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }

    monster.attack(player);

    if (player.playerInfo.isDead) {
      console.log(`${accountId} 플레이어 사망`);
      this.checkAllDead();
    }
    super.notifyAll(payloadTypes.S_PLAYER_ATTACKED, {
      monsterIdx,
      attackType,
      playerId: accountId,
      playerHp: player.playerStatus.playerHp,
    });
  }

  animationMonster(data) {
    super.notifyAll(payloadTypes.S_ANIMATION_MONSTER, data);
  }

  // #endregion

  // #region 플레이어
  addPlayer(accountId, player) {
    this.players.set(accountId, new DungeonPlayer(player));
    if (this.players.size === dungeonConstants.general.MAX_USERS) {
      const data = [];

      for (const [accountId, dungeonPlayer] of this.players.entries()) {
        data.push({ accountId, charClass: dungeonPlayer.playerInfo.charClass });
        // data[accountId] = dungeonPlayer.playerInfo.charClass;
      }
      DediClient.getClient(this.id).setPlayers(data);
    }
  }

  getPlayer(accountId) {
    return this.players.get(accountId);
  }

  useSkill(accountId, mp) {
    const playerMp = this.getPlayer(accountId).updateMp(mp);
    // 추후 스킬 사용 시 패킷 전달 필요
  }

  movePlayer(accountId, transform) {
    // const player = this.getPlayer(accountId);
    // if (!player) return;
    // transform = player.playerInfo.transform.updateTransform(transform);
    // super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }

  addHpPotion(accountId, hp) {
    const player = this.getPlayer(accountId);
    if (player.playerInfo.isDead) return;
    const playerHp = player.updateHp(hp);
    this.systemChat(accountId, 'HP 물약 획득');
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_HP, { playerId: accountId, playerHp });
  }

  addMpPotion(accountId, mp) {
    const player = this.getPlayer(accountId);
    if (player.playerInfo.isDead) return;
    const playerMp = player.updateMp(mp);
    this.systemChat(accountId, 'MP 물약 획득');
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_MP, { playerId: accountId, playerMp });
  }

  addMysteryBox(accountId, n) {
    const mysteryBox = this.getPlayer(accountId).updateBox(n);
    this.systemChat(accountId, '미스테리 박스 획득');
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_BOX, {
      playerId: accountId,
      updateBox: mysteryBox,
    });
  }

  checkAllDead() {
    let isAllDead = true;
    for (const player of this.players.values()) {
      if (!player.playerInfo.isDead) {
        isAllDead = false;
        break;
      }
    }
    if (isAllDead) {
      DediClient.removeClient(this.id);
      this.endGame(gameResults.codes.GAME_OVER, gameResults.bonusExp.GAME_OVER);
    }
  }

  updatePlayerAttackMonster(accountId, monsterIdx, damage) {
    const monster = this.getMonster(monsterIdx);
    if (!monster) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }
    if (monster.isDead) {
      console.log(`몬스터(${monster.monsterName})가 이미 사망함`);
      return;
    }
    console.log(`[${monsterIdx}] monster hit, damage: -${damage}`);
    monster.hit(damage);

    if (monster.isDead) {
      this.killMonster(monsterIdx, accountId);
    }

    this.notifyAll(payloadTypes.S_MONSTER_ATTACKED, {
      monsterIdx: monsterIdx,
      monsterHp: monster.monsterHp,
    });
  }

  killMonster(monsterIdx, accountId) {
    const monster = this.getMonster(monsterIdx);
    this.systemChat(accountId, `${monster.monsterName}를 처치`);
    this.roundKillCount++;
    const player = this.players.get(accountId);
    player.playerInfo.killed.push(monsterIdx);
    DediClient.getClient(this.id).killMonster({
      monsterIdx,
      monsterModel: monster.monsterModel,
    });
    console.log('------------KILL MONSTER----------', this.roundKillCount, this.roundMonsters.size);
    pickUpHandler(accountId, this.dungeonCode, this.round);
    // 모든 몬스터 처치 시 밤 라운드 종료
    if (this.roundMonsters.size === this.roundKillCount) {
      this.roundKillCount = 0;
      setTimeout(this.endNightRound.bind(this), 6000);
    }
  }

  animationPlayer(animCode, playerId, monsterIdx, mousePoint) {
    const player = this.getPlayer(playerId);
    if (player.playerInfo.isDead && animCode !== playerAnimTypes.DIE) {
      console.log(`해당 플레이어(${playerId})가 행동불가 상태 ${animCode}, ${monsterIdx}`);
      return;
    }

    if (monsterIdx !== -1 && Object.values(playerAnimTypes.ATTACK).includes(animCode)) {
      const monster = this.getMonster(monsterIdx);
      if (!player.verifyAttack(monster)) {
        console.log('공격 실패');
        return;
      }
    }

    if (animCode === playerAnimTypes.SKILL) {
      if (player.useSkill()) {
        super.notifyAll(payloadTypes.S_PICK_UP_ITEM_MP, {
          playerId,
          playerMp: player.playerStatus.playerMp,
        });
      } else return;
    }
    super.notifyAll(payloadTypes.S_ANIMATION_PLAYER, {
      animCode,
      playerId,
      monsterIdx,
      mousePoint,
    });
  }

  revivePlayer(playerId, targetPlayerId) {
    const targetPlayer = this.getPlayer(targetPlayerId);
    if (!targetPlayer.playerInfo.isDead) return null;

    const player = this.getPlayer(playerId);
    const playerGold = player.updateGold(-REVIVE_GOLD);
    if (playerGold === null) {
      this.systemChat(playerId, `골드가 부족합니다.`);
      return null;
    }

    targetPlayer.revive();

    super.notifyAll(payloadTypes.S_REVIVE_PLAYER, {
      playerId: targetPlayerId,
      playerHp: targetPlayer.playerStatus.playerHp,
      playerMp: targetPlayer.playerStatus.playerMp,
    });
  }

  // #endregion

  // #region 라운드

  /**
   * 던전 세션 실행 시 클라이언트에서 씬 로딩이 완료되었을 때 실행. 모든 유저가 준비되면 낮 라운드 시작.
   * @param {string} accountId 유저의 accountId
   */
  async sceneReady(accountId) {
    if (this.phase !== dc.phases.STANDBY) return;
    let found = false;
    Promise.all(
      this.users.map(async (user) => {
        if (user.accountId === accountId) {
          found = true;
          this.readyStates.push(false);
        }
      }),
    ).then(() => {
      if (!found) {
        throw new CustomError(ErrorCodes.USER_NOT_FOUND, `유저가 세션에 없습니다: ${accountId}`);
      }
      if (this.readyStates.length >= dc.general.MAX_USERS && this.phase === dc.phases.STANDBY) {
        this.phase = dc.phases.DAY;
        this.startDayRoundTimer();
      }
    });
  }

  /**
   * 낮 라운드의 타이머를 설정하고 시간을 전송. 설정한 시간이 지나면 밤 라운드 시작.
   */
  startDayRoundTimer() {
    if (this.phase !== dc.phases.DAY) return;
    this.phase = dc.phases.DAY_STARTED;
    (async () => {
      setTimeout(() => {
        this.phase = dc.phases.NIGHT;
        this.notifyAll(payloadTypes.S_NIGHT_ROUND_START, {});
        DediClient.getClient(this.id).setNightRoundStart();
      }, dc.general.DAY_DURATION);
    })();
    const now = Date.now();
    const data = {
      startTime: now,
      milliseconds: dc.general.DAY_DURATION,
    };
    this.notifyAll(payloadTypes.S_DAY_ROUND_TIMER, data);
  }

  /**
   * 밤 라운드를 종료시킵니다. 해당 라운드가 마지막 밤 라운드인 경우 S_GameEnd 패킷을 전송합니다.
   */
  endNightRound() {
    if (this.phase !== dc.phases.NIGHT) return;
    this.phase = dc.phases.RESULT; // dc.phases.RESULT
    Promise.all([
      (async () => {
        const dungeonInfo = dungeonUtils.fetchDungeonInfo(this.dungeonCode, this.round + 1);
        if (dungeonInfo === null) {
          return null;
        }
        return dungeonInfo;
      })(),
      Promise.all(
        this.users.map(async (user) => {
          const player = this.players.get(user.accountId);
          const boxGold = dungeonUtils.openMysteryBox(player.playerInfo.mysteryBox);
          const totalBoxGold = boxGold.reduce((acc, cur) => acc + cur, 0);
          const roundExp = player.playerInfo.killed.reduce(
            (acc, cur) => acc + this.getMonster(cur).killExp,
            0,
          );
          player.updateAccountExp(roundExp + this.round * 10);
          player.updateExp(roundExp);
          player.updateLevel();
          player.updateGold(totalBoxGold);
          const roundGold = player.updateRoundGold(this.round);

          const roundResult = {
            boxGold,
            roundGold,
          };
          roundResult.playerInfo = {
            ...player.playerInfo,
            accountLevel: player.accountLevel,
          };
          const stat = player.playerStatus;
          roundResult.playerStatus = {
            playerLevel: stat.playerLevel,
            playerName: player.playerInfo.nickname,
            playerFullHp: stat.baseStatInfo.maxHp,
            playerFullMp: stat.baseStatInfo.maxMp,
            playerCurHp: stat.playerHp,
            playerCurMp: stat.playerMp,
            atk: stat.baseStatInfo.atk,
            def: stat.baseStatInfo.def,
            specialAtk: stat.baseStatInfo.specialAtk,
            speed: stat.baseStatInfo.speed,
            attackRange: stat.baseStatInfo.attackRange,
            coolTime: stat.baseStatInfo.coolTime,
          };
          return roundResult;
        }),
      ),
    ])
      .then(([dungeonInfo, roundResults]) => {
        this.phase = dc.phases.DAY;
        this.round++;

        if (!dungeonInfo) {
          this.phase = dc.phases.ENDING;
          DediClient.removeClient(this.id);
          this.endGame(gameResults.codes.GAME_WIN, gameResults.bonusExp.GAME_WIN);
        } else {
          this.setMonsters(this.dungeonCode, dungeonInfo.monsters);
          this.users.forEach((user) => {
            const player = this.getPlayer(user.accountId);
            player.resetKilled();
            player.resetBox();
          });

          const data = {
            dungeonInfo,
            roundResults,
          };
          this.notifyAll(payloadTypes.S_NIGHT_ROUND_END, data);
          setTimeout(this.startDayRoundTimer.bind(this), 10000);
        }
      })
      .catch((err) => {
        handleError(null, err);
      });
  }

  endGame(result, exp) {
    this.phase = dc.phases.ENDING;
    DediClient.removeClient(this.id);
    Promise.all(
      this.users.map(async (user) => {
        const player = this.getPlayer(user.accountId);
        player.updateAccountExp(exp);
        await userDB.updateLevel(user.accountId, player.accountLevel);
        user = await userDB.updateExp(user.accountId, player.accountExp);
        return {
          playerId: user.accountId,
          accountLevel: user.userLevel,
          accountExp: user.userExperience,
        };
      }),
    ).then((data) => {
      super.notifyAll(payloadTypes.S_GAME_END, {
        result,
        playersResult: data,
      });
      console.log('playersResultArray : ', data);
      this.users.forEach((user) => {
        const dungeonPlayer = this.getPlayer(user.accountId);
        user.player = dungeonPlayer.toPlayer();
        super.removeUser(user.accountId);
      });
      removeDungeonSession(this.id);
    });
  }

  // #region 채팅

  chatPlayer(accountId, chatMsg) {
    super.notifyAll(payloadTypes.S_CHAT, { playerId: accountId, chatMsg });
  }

  systemChat(accountId, chatMsg) {
    super.notifyUser(accountId, payloadTypes.S_CHAT, {
      playerId: accountId,
      chatMsg,
      system: true,
    });
  }

  systemChatAll(accountId, chatMsg) {
    super.notifyAll(payloadTypes.S_CHAT, { playerId: accountId, chatMsg, system: true });
  }

  systemChatOthers(accountId, chatMsg) {
    super.notifyOthers(accountId, payloadTypes.S_CHAT, {
      playerId: accountId,
      chatMsg,
      system: true,
    });
  }

  // #endregion
}

export default Dungeon;
