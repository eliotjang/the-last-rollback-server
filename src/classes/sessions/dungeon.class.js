import dc, { attackTypes, gameResults } from '../../constants/game.constants.js';
import { payloadKeyNames, payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import pickUpHandler from '../../handlers/dungeon/pick-up.handler.js';
import { getGameAssets } from '../../init/assets.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import Game from './game.class.js';
import { userDB } from '../../db/user/user.db.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { DungeonPlayer } from '../models/player.class.js';
import { Monster } from '../models/monster.class.js';
// const dc.general.MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id, dungeonCode) {
    super(id, dc.general.MAX_USERS);
    this.type = sessionTypes.DUNGEON;
    this.dungeonCode = dungeonCode;
    this.phase = dc.phases.STANDBY;
    this.readyStates = [];
    this.round = null;
    this.roundKillCount = 0;
    this.timers = new Map();
    this.startTime = Date.now();
    this.playersResultArray = [];

    this.structureIdx = 0;
    this.structures = new Map();
    this.players = new Map();
    this.roundMonsters = null;
  }

  // #region 유저
  addUser(user) {
    super.addUser(user);
  }
  // #endregion

  // #region 구조물
  addStructure(structure) {
    this.structures.set(this.structureIdx++, structure);
  }

  updateStructureHp(structureIdx, monsterIdx) {
    const monsterInfo = this.roundMonsters.get(monsterIdx);
    const structure = this.structures.get(structureIdx);
    structure.updateStructureHp(monsterInfo.atk);
    super.notifyAll(payloadTypes.S_TOWER_ATTACKED, { towerHp: structure.hp });
  }

  // #endregion

  // #region 몬스터
  setMonsters(dungeonCode, monsters) {
    this.roundMonsters = new Map();
    monsters.forEach((data) => {
      const { monsterIdx } = data;
      const monster = new Monster(data.monsterModel);
      monster.setSpawnLocate(dungeonCode);
      this.roundMonsters.set(monsterIdx, monster);
    });
    return monsters;
  }

  getMonsters() {
    return this.roundMonsters;
  }

  getMonster(monsterIndex) {
    return this.roundMonsters.get(monsterIndex);
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

    // switch (attackType) {
    //   case attackTypes.NORMAL:
    //     monster.attack(player);
    //     break;
    //   case attackTypes.SKILL:
    //     monster.skillAttack(player);
    //     break;
    //   default:
    //     monster.attack(player);
    //     break;
    // }
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

  // #endregion

  // #region 플레이어

  addPlayer(accountId, player) {
    this.players.set(accountId, new DungeonPlayer(player));
  }

  getPlayer(accountId) {
    return this.players.get(accountId);
  }

  useSkill(accountId, mp) {
    const playerMp = this.getPlayer(accountId).updateMp(mp);
    // 추후 스킬 사용 시 패킷 전달 필요
  }

  movePlayer(accountId, transform) {
    const player = this.getPlayer(accountId);
    const playerTransform = player.playerInfo.transform.updateTransform(transform);
    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform: playerTransform });
  }

  addHpPotion(accountId, hp) {
    const playerHp = this.getPlayer(accountId).updateHp(hp);
    this.systemChat(accountId, 'HP 물약 획득');
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_HP, { playerId: accountId, playerHp });
  }

  addMpPotion(accountId, mp) {
    const playerMp = this.getPlayer(accountId).updateMp(mp);
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
      this.updateGameOver();
    }
  }

  // updatePlayerExp(accountId, killExp) {
  //   const player = this.getPlayer(accountId);
  //   if (!player) {
  //     console.log('해당 플레이어가 존재하지 않음');
  //     return null;
  //   }
  //   player.updateExp(killExp);
  //   return player;
  // }

  // #endregion

  getRoundMonsters() {
    return this.roundMonsters;
  }

  /**
   *
   * @param {number} monsterIndex 몬스터 인덱스
   * @returns 몬스터 정보
   */
  getMonster(monsterIndex) {
    return this.roundMonsters.get(monsterIndex);
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} monsterIndex 몬스터 인덱스
   * @param {number} damage 플레이어가 가한 데미지
   * @param {boolean} wantResult 반환 여부
   * @returns 해당 몬스터 정보
   */
  updatePlayerAttackMonster(accountId, monsterIndex, damage) {
    /*
    const data = this.roundMonsters.get(monsterIndex);
    if (!data) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }
    console.log(`[${monsterIndex}] monster hit, damage: -${damage}, current state: `, data);
    if (data.monsterHp <= 0) {
      return null;
    }

    data.monsterHp -= damage;
    this.roundMonsters.set(monsterIndex, data);
    // 여기까지 Bull
    // 여기서부터 비동기
    (async () => {
      if (data.monsterHp <= 0) {
        console.log(`monsterIndex ${monsterIndex}번 몬스터 처치`);
        this.updatePlayerExp(accountId, data.killExp);
        this.killMonster(monsterIndex, accountId);
        pickUpHandler(accountId);
      }
      const monster = this.getMonster(monsterIndex);
      // this.getUser(accountId).socket.sendResponse(
      //   SuccessCode.Success,
      //   `몬스터(${monsterIndex})가 플레이어(${accountId})에 의해 피격, 몬스터 남은 체력: ${
      //     monster.monsterHp
      //   }`,
      //   payloadTypes.S_MONSTER_ATTACKED,
      //   {
      //     monsterIndex,
      //     monsterHp: monster.monsterHp,
      //   },
      // );
      this.notifyAll(payloadTypes.S_MONSTER_ATTACKED, {
        monsterIdx: monsterIndex,
        monsterHp: monster.monsterHp,
      });
      // this.attackedMonster(accountId, monsterIndex, monster.monsterHp);
      // if (wantResult) {
      //   return this.getMonster(monsterIndex);
      // }
    })();
    */

    const monster = this.getMonster(monsterIndex);
    if (!monster) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }
    console.log(`[${monsterIndex}] monster hit, damage: -${damage}, current state: `, monster);
    monster.hit(damage);
    // 여기까지 Bull
    // 여기서부터 비동기
    (async () => {
      if (monster.monsterHp <= 0) {
        console.log(`monsterIndex ${monsterIndex}번 몬스터 처치`);
        this.killMonster(monsterIndex, accountId);
        pickUpHandler(accountId);
      }

      this.notifyAll(payloadTypes.S_MONSTER_ATTACKED, {
        monsterIdx: monsterIndex,
        monsterHp: monster.monsterHp,
      });
    })();
  }

  /**
   * 몬스터 사망 판정을 위한 호출
   * @param {number} monsterIndex 몬스터 인덱스
   * @param {string} accountId
   * @description updatePlayerAttackMonster 내부에서 사용
   */
  killMonster(monsterIndex, accountId) {
    /*
    const monsterName = this.roundMonsters.get(monsterIndex).monsterName;
    this.systemChat(accountId, `${monsterName}를 처치`);
    this.roundKillCount++;
    const playerInfo = this.playerInfos.get(accountId);
    playerInfo.killed.push(monsterIndex);
    this.playerInfos.set(accountId, playerInfo);
    console.log('------------KILL MONSTER----------', this.roundKillCount, this.roundMonsters.size);
    if (this.roundMonsters.size === this.roundKillCount) {
      // 밤 round 종료
      console.log('------------END NIGHT ROUND----------');
      this.roundKillCount = 0;
      setTimeout(this.endNightRound.bind(this, accountId), 6000);
      //this.endNightRound(accountId);
    }
    */

    const monster = this.getMonster(monsterIndex);
    this.systemChat(accountId, `${monster.monsterName}를 처치`);
    this.roundKillCount++;
    const player = this.players.get(accountId);
    player.playerInfo.killed.push(monsterIndex);
    player.updateExp(monster.killExp);
    console.log('------------KILL MONSTER----------', this.roundKillCount, this.roundMonsters.size);
    if (this.roundMonsters.size === this.roundKillCount) {
      // 밤 round 종료
      console.log('------------END NIGHT ROUND----------');
      this.roundKillCount = 0;
      setTimeout(this.endNightRound.bind(this), 6000);
    }
  }

  // #endregion

  updateMonsterTransform(monsterIndex, transform) {
    const monster = this.getMonster(monsterIndex);
    if (!monster) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }
    monster.transform.updateTransform(transform);
    return monster;
  }

  updateRoundResult(accountId, gameExp) {
    /*
    // stage가 끝날 때마다 호출
    if (arguments.length === 0) {
      return Object.fromEntries(Object.entries(this.accountExpMap).map(([id, exp]) => [id, exp]));
    }

    if (!this.accountExpMap[accountId]) {
      this.accountExpMap[accountId] = 0;
      this.callCountMap[accountId] = 0;
    }

    // 호출 횟수 추적
    this.callCountMap[accountId] += 1;
    const callCount = this.callCountMap[accountId];

    // 라운드별 기본 exp 추가
    if (callCount === 1) {
      gameExp += 10;
    } else if (callCount === 2) {
      gameExp += 20;
    }

    this.accountExpMap[accountId] += gameExp;
    */
    const player = this.players.get(accountId);
    if (!player) {
      console.log('해당 플레이어가 존재하지 않음');
      return;
    }
  }

  // 다음 레벨까지 남은 경험치
  // getExpToNextLevel(player, playerLevel) {
  //   const { userInfo } = getGameAssets();
  //   const nextLevel = playerLevel + 1;
  //   const nextExp = userInfo.data[nextLevel].maxExp;
  //   const currentDbExp = player.userExperience;
  //   const expToNextLevel = nextExp - currentDbExp;
  //   return expToNextLevel;
  // }

  endGame(result, exp) {
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
        super.removeUser(user.accountId);
      });
    });
  }

  async updateGameOver() {
    /*
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    // 죽은 라운드의 경험치는 포함안됨
    const playersExp = this.updateRoundResult();

    Promise.all(
      this.users.map(async (user) => {
        const totalExp = playersExp[user.accountId] || 10;
        const player = await userDB.updateExp(user.accountId, totalExp, true);
        return {
          playerId: user.accountId,
          accountLevel: player.userLevel,
          accountExp: totalExp,
        };
      }),
    ).then(([...data]) => {
      this.playersResultArray.push(...data);
      super.notifyAll(payloadTypes.S_GAME_END, {
        result: 1,
        playersResult: this.playersResultArray,
      });
      console.log('playersResultArray : ', this.playersResultArray);
      // TODO: 던전 퇴장 (타운 입장)
      // this.removeUser(accountId);
      // const user = getUserById(accountId);
      // townSession.addUser(user);
    });
    */

    this.endGame(gameResults.codes.GAMEOVER, gameResults.bonusExp.GAMEOVER);
  }

  async updateGameWin() {
    /*
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    const playersExp = this.updateRoundResult();
    Promise.all(
      this.users.map(async (user) => {
        const totalExp = (playersExp[user.accountId] ? playersExp[user.accountId] : 0) + 100; // 승리 시 정산에서 얻은 경험치에서 100 추가
        const player = await userDB.updateExp(user.accountId, totalExp, true);
        return {
          playerId: user.accountId,
          accountLevel: player.userLevel,
          accountExp: totalExp,
        };
      }),
    ).then(([...data]) => {
      this.playersResultArray.push(...data);
      super.notifyAll(payloadTypes.S_GAME_END, {
        result: 2,
        playersResult: this.playersResultArray,
      });
      // TODO: 던전 퇴장 (타운 입장)
      // this.removeUser(accountId);
      // const user = getUserById(accountId);
      // townSession.addUser(user);
    });
  */

    this.endGame(gameResults.codes.GAMEWIN, gameResults.bonusExp.GAMEWIN);
  }

  attackMonster(accountId, attackType, monsterIdx) {
    super.notifyOthers(accountId, payloadTypes.S_PLAYER_ATTACK, {
      playerId: accountId,
      attackType,
      monsterIdx,
    });
  }

  // attackedMonster(monsterIdx, monsterHp) {
  //   super.notifyAll(payloadTypes.S_MONSTER_ATTACKED, { monsterIdx, monsterHp });
  // }

  // attackedMonster(accountId, monsterIdx, monsterHp) {
  //   super.notifyOthers(accountId, payloadTypes.S_MONSTER_ATTACKED, { monsterIdx, monsterHp });
  // }

  // attackPlayer(monsterIdx, attackType, accountId, playerHp) {
  //   if (playerHp <= 0) {
  //     playerHp = 0;
  //     console.log(`${accountId} 플레이어 사망`);
  //     this.killPlayer(accountId);
  //   }
  //   super.notifyAll(payloadTypes.S_PLAYER_ATTACKED, {
  //     monsterIdx,
  //     attackType,
  //     playerId: accountId,
  //     playerHp,
  //   });
  // }

  removeUser(accountId) {
    super.removeUser(accountId);
  }

  moveMonster(accountId, payloadType, payload) {
    super.notifyOthers(accountId, payloadType, payload);
  }

  /**
   * 던전 세션 실행 시 클라이언트에서 씬 로딩이 완료되었을 때 실행됩니다. 모든 유저가 준비되면 낮 라운드를 시작합니다.
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

    // const idx = this.users.findIndex((user) => user.accountId === accountId);
    // if (idx === -1) {
    //   throw new CustomError(ErrorCodes.USER_NOT_FOUND, `유저가 세션에 없습니다: ${accountId}`);
    // }
    // this.readyStates.push(false);
    // if (this.readyStates.length >= dc.general.MAX_USERS && this.phase === dc.phases.STANDBY) {
    //   this.phase = dc.phases.DAY;
    //   this.startDayRoundTimer();
    // }
  }

  /**
   *
   * @param {User} user
   * @returns 유저의 ready 상태 반환
   */
  toggleReadyState(user) {
    if (this.phase !== dc.phases.DAY) return;
    const idx = this.users.findIndex((targetId) => targetId === user.accountId);
    if (idx === -1) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, `유저가 세션에 없습니다: ${accountId}`);
    }
    if (this.readyStates[idx]) {
      return true;
    }
    this.readyStates[idx] = true; // !this.readyStates[idx];
    for (const state of this.readyStates) {
      if (!state) {
        return this.readyStates[idx];
      }
    }
    // all users are ready
    this.phase = dc.phases.DAY_STARTED;
    this.startDayRoundTimer();
  }

  /**
   * User 인스턴스로 해당 유저의 라운드 통계 정보를 불러옵니다.
   * @param {User} user 유저 세션에 등록된 유저 인스턴스
   * @returns {RoundResult} 유저의 라운드 통계 정보(RoundResult)를 담은 객체
   */
  fetchRoundStatsByUser(user) {
    if (this.phase !== dc.phases.RESULT) return;
    // TODO: 라운드 통계 (RoundResult) 반환

    /*
      message RoundResult {
        string nickname = 1;
        uint32 score = 2;
        uint32 killCount = 3;
        // 밤 라운드 정산 정보 있으면 여기에 추가?
        
      }
    */
    const player = this.getPlayer(user.accountId);
    // TODO: 상자깡?
    // const items = 상자깡();

    // const boxGold = this.mysteryBoxOpen(user.accountId, playerInfo.itemBox);
    const roundGold = +this.roundGold(this.round);

    const totalBoxGold = boxGold.reduce((sum, cur) => sum + cur, 0);
    player.playerInfo.itemBox = 0;
    player.playerInfo.gold += totalBoxGold;
    player.playerInfo.gold += roundGold;

    return {
      playerInfo: player.playerInfo,
      playerStatus: {
        playerLevel: player.playerStatus.playerLevel,
        playerExp: player.playerStatus.playerExp,
        playerCurHp: player.playerStatus.playerHp,
        playerCurMp: player.playerStatus.playerMp,
        playerName: player.playerInfo.nickname,
        playerFullHp: player.playerStatus.getStatInfo().maxHp,
        playerFullMp: player.playerStatus.getStatInfo().maxMp,
        atk: player.playerStatus.getStatInfo().atk,
        def: player.playerStatus.getStatInfo().def,
        specialAtk: player.playerStatus.getStatInfo().specialAtk,
      },
      boxGold: boxGold,
      roundGold: roundGold,
    };
  }

  /**
   * 밤 라운드를 종료시킵니다. 해당 라운드가 마지막 밤 라운드인 경우 S_GameEnd 패킷을 전송합니다.
   */
  endNightRound() {
    /*
    if (this.phase !== dc.phases.NIGHT) return;
    this.phase = dc.phases.RESULT; // dc.phases.RESULT
    Promise.all([
      (async () => {
        const dungeonInfo = dungeonUtils.fetchDungeonInfo(this.dungeonCode, this.round + 1); // 다음 라운드 몬스터 목록 받아오기
        if (dungeonInfo === null) {
          return null;
        }
        this.setMonsters(this.dungeonCode, dungeonInfo.monsters);
        return dungeonInfo;
      })(),
      Promise.all(
        this.users.map(async (user) => {
          const roundResult = this.fetchRoundStatsByUser(user);
          const playerStatus = this.getPlayerStatus(accountId);
          const gameExp = playerStatus.playerExp;
          this.updateRoundResult(accountId, gameExp);
          return roundResult;
        }),
      ),
    ])
      .then(([dungeonInfo, roundResults]) => {
        this.phase = dc.phases.DAY;
        this.round++;

        if (!dungeonInfo) {
          // 마지막 라운드가 종료됨 (gameEnd 전송)
          this.updateGameWin();
        } else {
          // 아직 라운드가 남음
          // console.log(roundResults);
          const data = {
            dungeonInfo,
            roundResults,
          };
          // console.log('########', JSON.stringify(data));
          this.notifyAll(payloadTypes.S_NIGHT_ROUND_END, data);
          setTimeout(this.startDayRoundTimer.bind(this), 10000); // temp
          // this.startDayRoundTimer();
        }
      })
      .catch((err) => {
        handleError(null, err);
      });
      */

    if (this.phase !== dc.phases.NIGHT) return;
    this.phase = dc.phases.RESULT; // dc.phases.RESULT

    this.users.forEach((user) => {
      const player = this.getPlayer(user.accountId);
      const gameExp = player.playerStatus.playerExp + this.round * 10;
      player.updateLevel();
      player.updateAccountExp(gameExp);
    });

    Promise.all([
      (async () => {
        const dungeonInfo = dungeonUtils.fetchDungeonInfo(this.dungeonCode, this.round + 1); // 다음 라운드 몬스터 목록 받아오기
        if (dungeonInfo === null) {
          return null;
        }
        this.setMonsters(this.dungeonCode, dungeonInfo.monsters);
        return dungeonInfo;
      })(),
      Promise.all(
        this.users.map(async (user) => {
          const roundResult = this.fetchRoundStatsByUser(user);
          return roundResult;
        }),
      ),
    ])
      .then(([dungeonInfo, roundResults]) => {
        this.phase = dc.phases.DAY;
        this.round++;

        if (!dungeonInfo) {
          // 마지막 라운드가 종료됨 (gameEnd 전송)
          this.updateGameWin();
        } else {
          // 아직 라운드가 남음
          // console.log(roundResults);
          const data = {
            dungeonInfo,
            roundResults,
          };
          // console.log('########', JSON.stringify(data));
          this.notifyAll(payloadTypes.S_NIGHT_ROUND_END, data);
          setTimeout(this.startDayRoundTimer.bind(this), 10000); // temp
          // this.startDayRoundTimer();
        }
      })
      .catch((err) => {
        handleError(null, err);
      });
  }

  /**
   * 낮 라운드의 타이머를 설정하고 시간을 전송합니다. 설정한 시간이 지나면 밤 라운드를 시작합니다.
   */
  startDayRoundTimer() {
    if (this.phase !== dc.phases.DAY) return;
    this.phase = dc.phases.DAY_STARTED;
    (async () => {
      setTimeout(() => {
        this.phase = dc.phases.NIGHT;
        this.notifyAll(payloadTypes.S_NIGHT_ROUND_START, {});
      }, dc.general.DAY_DURATION);
    })();
    const now = Date.now();
    this.users.forEach(async (user) => {
      const data = {
        startTime: now,
        milliseconds: dc.general.DAY_DURATION,
      };
      user.socket.sendNotification(payloadTypes.S_DAY_ROUND_TIMER, data);
    });
  }

  animationMonster(data) {
    super.notifyAll(payloadTypes.S_ANIMATION_MONSTER, data);
  }

  animationPlayer(animCode, playerId, monsterIdx) {
    if (this.getPlayer(playerId).playerInfo.isDead && animCode !== 1) {
      console.log('해당 플레이어가 행동불가 상태');
      return;
    }
    super.notifyAll(payloadTypes.S_ANIMATION_PLAYER, { animCode, playerId, monsterIdx });
  }

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

  roundGold(round) {
    const { stage } = getGameAssets();

    const curStage = stage.data.find((data) => data.round == round);
    const reward = curStage.reward;

    return reward;
  }
}

export default Dungeon;
