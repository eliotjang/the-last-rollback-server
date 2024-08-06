import dc from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import pickUpHandler from '../../handlers/dungeon/pick-up.handler.js';
import { getGameAssets } from '../../init/assets.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import Game from './game.class.js';
import User from './user.class.js';
import { userDB } from '../../db/user/user.db.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import { getUserById } from '../../session/user.session.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';
import lodash from 'lodash';
// const dc.general.MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id, dungeonCode) {
    super(id, dc.general.MAX_USERS);
    this.type = sessionTypes.DUNGEON;
    this.accountExpMap = {};
    this.callCountMap = {};
    this.dungeonCode = dungeonCode;
    this.phase = dc.phases.STANDBY;
    this.readyStates = [];
    this.dungeonInfo = null;
    this.round = null;
    this.roundMonsters = null;
    this.playerInfos = null;
    /*
      const player1Info = {
        nickname: 'eliot1Nick',
        charClass: 1003,
        transform: playerTransform.getTransform(),
        gold: 0,
        itemBox: 0,
        killed: [],
        isDead: false,
      };
    */
    this.playerStatus = null;
    /*
      const player1Status = {
        playerLevel: charStatInfo[player1Info.charClass][0].level,
        playerExp: 0,
        playerHp: charStatInfo[player1Info.charClass][0].hp,
        playerMp: charStatInfo[player1Info.charClass][0].mp,
      };
    */
    this.towerHp = null;
    this.itemNames = [];
    this.itemProbability = [];
    this.pickUpItems = [];
    this.roundKillCount = 0;
    this.timers = new Map();
    this.startTime = Date.now();
  }

  addTowerHp(towerHp) {
    this.towerHp = towerHp;
  }

  updateTowerHp(amount) {
    this.towerHp -= amount;
    if (this.towerHp <= 0) {
      this.towerHp = 0;
      this.updateGameOver();
      // for (const [accountId, value] of this.playerStatus.entries()) {
      //   console.log('accountId, value : ', accountId, value);
      //   const user = this.getUser(accountId);
      //   user.socket.sendResponse(SuccessCode.Success, '게임 패배', payloadTypes.S_GAME_END, {
      //     result: 3, // 0 패배, 1 승리
      //     playerId: accountId,
      //     accountLevel: 3, //value.playerLevel,
      //     accountExp: 3, //value.playerExp,
      //   });
      // }
    }
    console.log('타워 공격', this.towerHp);
    super.notifyAll(payloadTypes.S_TOWER_ATTACKED, { towerHp: this.towerHp });

    return this.towerHp;
  }

  /**
   *
   * @param {map} playerInfos 플레이어 정보
   * @param {map} playerStatus 플레이어 상태
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 정보 및 플레이어 상태 배열
   */
  addPlayers(playerInfos, playerStatus, wantResult) {
    this.playerInfos = new Map(playerInfos);
    this.playerStatus = new Map(playerStatus);

    if (wantResult) {
      return [this.playerInfos, this.playerStatus];
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns 플레이어 정보
   */
  getPlayerInfo(accountId) {
    return this.playerInfos.get(accountId);
  }

  getPlayersInfo() {
    return this.playerInfos;
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns 플레이어 상태
   */
  getPlayerStatus(accountId) {
    return this.playerStatus.get(accountId);
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} damage 몬스터가 가한 데미지
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 상태
   */
  updateMonsterAttackPlayer(accountId, damage, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }
    const data = this.playerStatus.get(accountId);

    if (data.isDead) {
      console.log('player is already dead');
      return null;
    }

    data.playerHp -= damage;
    this.playerStatus.set(accountId, data);

    if (wantResult) {
      return this.getPlayerStatus(accountId);
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   */
  killPlayer(accountId) {
    // this.playerInfos.delete(accountId);
    // console.log('플레이어 사망 확인-------------', this.playerInfos);
    // this.playerStatus.delete(accountId);

    const playerInfo = this.playerInfos.get(accountId);
    playerInfo.isDead = true;
    this.playerInfos.set(accountId, playerInfo);
    console.log('kilpl', playerInfo);

    let isAllDead = true;
    for (const playerInfo of this.playerInfos.values()) {
      if (!playerInfo.isDead) {
        isAllDead = false;
        break;
      }
    }
    if (isAllDead) {
      this.updateGameOver();
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} skillMp 스킬 마나 사용
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 상태
   */
  updatePlayerUseSkill(accountId, skillMp, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }
    const data = this.playerStatus.get(accountId);
    if (data.playerMp - skillMp < 0) {
      console.log(`스킬 사용 마나 부족`);
      return null;
    }

    data.playerMp -= skillMp;
    this.playerStatus.set(accountId, data);

    if (wantResult) {
      return this.getPlayerStatus(accountId);
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} killExp 획득 경험치
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 상태
   */
  updatePlayerExp(accountId, killExp, wantResult) {
    // updatePlayerAttackMonster 내부에서 사용
    const { charStatInfo } = getGameAssets();
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }
    const infoData = this.playerInfos.get(accountId);
    let statData = this.playerStatus.get(accountId);
    const lastData = charStatInfo[infoData.charClass][charStatInfo[infoData.charClass].length - 1];
    if (statData.playerLevel >= lastData.level && statData.playerExp >= lastData.maxExp) {
      console.log('최대 레벨 및 최대 경험치 도달');
      return null;
    }

    let targetData = charStatInfo[infoData.charClass].find(
      (data) => data.level === statData.playerLevel,
    );

    while (killExp >= targetData.maxExp) {
      killExp -= targetData.maxExp;
      this.updatePlayerLevel(accountId);

      statData = this.playerStatus.get(accountId);
      if (statData.playerLevel >= lastData.level) {
        console.log('최대 레벨 도달');
        return;
      }
      targetData = charStatInfo[infoData.charClass].find(
        (data) => data.level === statData.playerLevel,
      );
    }
    statData.playerExp += killExp;

    if (wantResult) {
      return this.getPlayerStatus(accountId);
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @description updateUserExp 내부에서 사용
   */
  updatePlayerLevel(accountId) {
    // updateUserExp 내부에서 사용
    const { charStatInfo } = getGameAssets();
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerStatus.get(accountId);
    const infoData = this.playerInfos.get(accountId);
    const lastData = charStatInfo[infoData.charClass][charStatInfo[infoData.charClass].length - 1];
    if (data.playerLevel >= lastData.level) {
      console.log('최대 레벨 도달');
      return null;
    }

    data.playerLevel++;
    this.playerStatus.set(accountId, data);
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {object} transform 플레이어 이동 좌표
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 정보
   */
  updatePlayerTransform(accountId, transform, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerInfos.get(accountId);
    data.transform = transform;
    this.playerInfos.set(accountId, data);

    if (wantResult) {
      return this.getPlayerInfo(accountId);
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} gold 획득 골드
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 상태
   */
  addPlayerGold(accountId, gold, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerInfos.get(accountId);
    data.gold += gold;
    this.playerInfos.set(accountId, data);

    if (wantResult) {
      return this.getPlayerInfo(accountId);
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} gold 사용 골드
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 상태
   */
  removePlayerGold(accountId, gold, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerInfos.get(accountId);

    if (data.gold - gold < 0) {
      console.log('골드가 부족합니다.');
      return null;
    }

    data.gold -= gold;
    this.playerInfos.set(accountId, data);

    if (wantResult) {
      return this.getPlayerInfo(accountId);
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 정보
   */
  addItemBox(accountId, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerInfos.get(accountId);
    console.log('get 상자 : ', data.itemBox);
    data.itemBox++;
    this.playerInfos.set(accountId, data);
    console.log('상자 획득!!!!!!!!!', data.itemBox);
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_BOX, {
      playerId: accountId,
      updateBox: data.itemBox,
    });
    if (wantResult) {
      return data.itemBox;
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult 반환 여부
   * @returns 플레이어 정보
   */
  removeItemBox(accountId, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerInfos.get(accountId);

    if (data.itemBox === 0) {
      console.log('제거할 아이템 박스가 없습니다.');
      return null;
    }

    data.itemBox--;
    this.playerInfos.set(accountId, data);

    if (wantResult) {
      return this.getPlayerInfo(accountId);
    }
  }

  /**
   *
   * @param {number} round 몬스터 라운드
   * @param {map} monsters 생성 몬스터
   * @param {boolean} wantResult 반환 여부
   * @returns 해당 라운드의 몬스터
   */
  addRoundMonsters(round, monsters, wantResult) {
    this.round = round;
    // this.roundMonsters = new Map(monsters);
    this.setMonsters(monsters);

    if (wantResult) {
      return this.getRoundMonsters();
    }
  }

  /**
   *
   * @return 해당 라운드의 몬스터
   */
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
   * @returns 현재 라운드
   */
  getCurrentRound() {
    return this.round;
  }

  /**
   *
   * @param {boolean} wantResult 반환 여부
   * @returns 현재 라운드
   */
  setNextRound(wantResult) {
    const { stage } = getGameAssets();
    const maxRound = stage.data[stage.data.length - 1];
    if (maxRound <= this.round) {
      console.log('최대 라운드 도달');
      return null;
    }
    this.round++;

    if (wantResult) {
      return this.getCurrentRound();
    }
  }

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} monsterIndex 몬스터 인덱스
   * @param {number} damage 플레이어가 가한 데미지
   * @param {boolean} wantResult 반환 여부
   * @returns 해당 몬스터 정보
   */
  updatePlayerAttackMonster(accountId, monsterIndex, damage, wantResult) {
    if (!this.roundMonsters.has(monsterIndex)) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }

    const data = this.roundMonsters.get(monsterIndex);

    data.monsterHp -= damage;
    this.roundMonsters.set(monsterIndex, data);

    if (data.monsterHp <= 0) {
      console.log(`monsterIndex ${monsterIndex}번 몬스터 처치`);
      pickUpHandler(accountId);
      this.updatePlayerExp(accountId, data.killExp);
      this.killMonster(monsterIndex, accountId);
    }

    if (wantResult) {
      return this.getMonster(monsterIndex);
    }
  }

  /**
   *
   * @param {number} monsterIndex 몬스터 인덱스
   * @param {string} accountId
   * @description updatePlayerAttackMonster 내부에서 사용
   */
  killMonster(monsterIndex, accountId) {
    // updatePlayerAttackMonster 내부에서 사용
    // this.roundMonsters.delete(monsterIndex);
    this.roundKillCount++;
    const playerInfo = this.playerInfos.get(accountId);
    playerInfo.killed.push(monsterIndex);
    this.playerInfos.set(accountId, playerInfo);
    console.log('------------KILL MONSTER----------', this.roundKillCount, this.roundMonsters.size);
    if (this.roundMonsters.size === this.roundKillCount) {
      // 밤 round 종료
      console.log('------------END NIGHT ROUND----------');
      this.roundKillCount = 0;
      this.endNightRound(accountId);
    }
  }

  /**
   *
   * @param {number} monsterIndex 몬스터 인덱스
   * @param {object} transform 몬스터 이동 좌표
   * @param {boolean} wantResult 반환 여부
   * @returns 해당 몬스터 정보
   */
  updateMonsterTransform(monsterIndex, transform, wantResult) {
    if (!this.roundMonsters.has(monsterIndex)) {
      console.log('해당 몬스터가 존재하지 않음');
      return null;
    }
    const data = this.roundMonsters.get(monsterIndex);
    data.monsterTransform = transform;
    this.roundMonsters.set(monsterIndex, data);

    if (wantResult) {
      return this.getMonster(monsterIndex);
    }
  }

  addUser(user) {
    super.addUser(user);
  }

  updateRoundResult(accountId, gameExp) {
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
  }

  // 다음 레벨까지 남은 경험치
  getExpToNextLevel(player, playerLevel) {
    const { userInfo } = getGameAssets();
    const nextLevel = playerLevel + 1;
    const nextExp = userInfo.data[nextLevel].maxExp;
    const currentDbExp = player.userExperience;
    const expToNextLevel = nextExp - currentDbExp;
    return expToNextLevel;
  }

  async updateGameOver() {
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    // 죽은 라운드의 경험치는 포함안됨
    const playersExp = this.updateRoundResult();
    // 1라운드 도중에 죽었을 때
    if (lodash.isEmpty(playersExp)) {
      this.users.forEach(async (user) => {
        const player = await userDB.updateExp(user.accountId, 10, true);
        console.log('player : ', player);
        const playerLevel = player.userLevel;
        console.log('playerLevel : ', playerLevel);

        user.socket.sendResponse(
          SuccessCode.Success,
          '게임에서 패배하였습니다.',
          payloadTypes.S_GAME_END,
          { result: 3, playerId: user.accountId, accountLevel: playerLevel, accountExp: 10 },
        );
      });
    }

    for (const [accountId, totalExp] of Object.entries(playersExp)) {
      const player = await userDB.updateExp(accountId, totalExp, true);
      console.log('player : ', player);
      const playerLevel = player.userLevel;
      console.log('playerLevel : ', playerLevel);

      this.users.forEach((user) => {
        if (user.accountId === accountId) {
          user.socket.sendResponse(
            SuccessCode.Success,
            '게임에서 패배하였습니다.',
            payloadTypes.S_GAME_END,
            { result: 0, playerId: accountId, accountLevel: playerLevel, accountExp: totalExp },
          );
        }
      });
    }
  }

  async updateGameWin() {
    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    const playersExp = this.updateRoundResult();
    for (const [accountId, totalExp] of Object.entries(playersExp)) {
      const winExp = +totalExp + 100; // 승리 시 정산에서 얻은 경험치에서 100 추가
      console.log('winExp : ', winExp);
      const player = await userDB.updateExp(accountId, winExp, true);
      console.log('player : ', player);
      const playerLevel = player.userLevel;

      this.users.forEach((user) => {
        if (user.accountId === accountId) {
          user.socket.sendResponse(
            SuccessCode.Success,
            '게임에서 승리하였습니다.',
            payloadTypes.S_GAME_END,
            { result: 1, playerId: accountId, accountLevel: playerLevel, accountEXP: winExp },
          );
        }
      });
    }
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

  attackedMonster(accountId, monsterIdx, monsterHp) {
    super.notifyOthers(accountId, payloadTypes.S_MONSTER_ATTACKED, { monsterIdx, monsterHp });
  }

  attackPlayer(monsterIdx, attackType, accountId, playerHp) {
    if (playerHp <= 0) {
      playerHp = 0;
      console.log(`${accountId} 플레이어 사망`);
      this.killPlayer(accountId);
    }
    super.notifyAll(payloadTypes.S_PLAYER_ATTACKED, {
      monsterIdx,
      attackType,
      playerId: accountId,
      playerHp,
    });
  }

  removeUser(accountId) {
    super.removeUser(accountId);
  }

  async movePlayer(accountId, transform) {
    // await dungeonRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
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

    /*
    const player1Info = {
      nickname: 'eliot1Nick',
      charClass: 1003,
      transform: playerTransform.getTransform(),
      gold: 0,
      itemBox: 0,
      killed: [],
      score: 0,
    };
    */
    const { nickname, score, killed, itemBox, gold } = this.playerInfos.get(user.accountId);
    // TODO: 상자깡?

    return {
      nickname,
      score: score ? score : 0,
      killed,
      // items: [],
      // gold,
    };
  }

  /**
   * 밤 라운드를 종료시킵니다. 해당 라운드가 마지막 밤 라운드인 경우 S_GameEnd 패킷을 전송합니다.
   */
  endNightRound(accountId) {
    if (this.phase !== dc.phases.NIGHT) return;
    this.phase = dc.phases.RESULT; // dc.phases.RESULT
    Promise.all([
      (async () => {
        const dungeonInfo = dungeonUtils.fetchDungeonInfo(this.dungeonCode, this.round + 1); // 다음 라운드 몬스터 목록 받아오기
        if (dungeonInfo === null) {
          return null;
        }
        this.setMonsters(dungeonInfo.monsters);
        return dungeonInfo;
      })(),
      (async () => {
        const roundResults = this.users.map((user) => this.fetchRoundStatsByUser(user)); // 각 유저의 라운드 통계 받아오기
        return roundResults;
      })(),
    ]).then(([dungeonInfo, roundResults]) => {
      this.phase = dc.phases.DAY;
      this.round++;
      if (!dungeonInfo) {
        // 마지막 라운드가 종료됨 (gameEnd 전송)
        const playerStatus = this.getPlayerStatus(accountId);
        const gameExp = playerStatus.playerExp;
        this.updateRoundResult(accountId, gameExp);
        this.updateGameWin();
      } else {
        const playerStatus = this.getPlayerStatus(accountId);
        const gameExp = playerStatus.playerExp;
        this.updateRoundResult(accountId, gameExp);
        // 아직 라운드가 남음
        const data = {
          dungeonInfo,
          roundResults,
        };
        this.notifyAll(payloadTypes.S_NIGHT_ROUND_END, data);
        this.startDayRoundTimer();
      }
    });
  }

  /**
   *
   * @param {[MonsterStatus]} monsters
   */
  setMonsters(monsters) {
    this.roundMonsters = new Map();
    monsters.forEach((monster) => {
      const { monsterIdx, ...rest } = monster;
      this.roundMonsters.set(monsterIdx, rest);
    });
    return monsters;
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
    (async () => {
      const data = {
        startTime: Date.now(),
        milliseconds: dc.general.DAY_DURATION,
      };
      this.notifyAll(payloadTypes.S_DAY_ROUND_TIMER, data);
    })();
  }

  animationMonster(data) {
    super.notifyAll(payloadTypes.S_ANIMATION_MONSTER, data);
  }

  animationPlayer(data) {
    if (this.playerInfos.get(data.playerId).isDead && data.animCode !== 1) {
      console.log('해당 플레이어가 행동불가 상태');
      return;
    }
    super.notifyAll(payloadTypes.S_ANIMATION_PLAYER, data);
  }

  addPickUpList(data) {
    const itemNames = data.map((item) => item.itemName);
    const itemProbability = data.map((item) => item.probability);
    const totalProbability = itemProbability.reduce((sum, cur) => sum + cur, 0);
    const lastProbability = 100 - totalProbability;

    if (totalProbability > 100) {
      throw new CustomError(ErrorCodes.PROBABILITY_ERROR, '확률의 합이 100이 넘습니다.');
    }

    itemProbability.push(lastProbability);

    this.itemNames = itemNames;
    this.itemProbability = itemProbability;
    this.pickUpItems = data;
  }

  getItemNames() {
    return this.itemNames;
  }

  getItemProbability() {
    return this.itemProbability;
  }

  getPickUpItems() {
    return this.pickUpItems;
  }

  recoveredHp(accountId, itemHp, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }
    const { charStatInfo } = getGameAssets();

    const infoData = this.playerInfos.get(accountId);
    let statData = this.playerStatus.get(accountId);

    const targetData = charStatInfo[infoData.charClass].find(
      (data) => data.level === statData.playerLevel,
    );

    const maxHp = targetData.maxHp;

    statData.playerHp += itemHp;
    if (statData.playerHp > maxHp) {
      statData.playerHp = maxHp;
    }
    console.log('체력 획득!!!!!!!!!', statData.playerHp);
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_HP, {
      playerId: accountId,
      playerHp: statData.playerHp,
    });

    if (wantResult) {
      return statData.playerHp;
    }
  }

  recoveredMp(accountId, itemMp, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }
    const { charStatInfo } = getGameAssets();

    const infoData = this.playerInfos.get(accountId);
    let statData = this.playerStatus.get(accountId);

    const targetData = charStatInfo[infoData.charClass].find(
      (data) => data.level === statData.playerLevel,
    );

    const maxMp = targetData.maxMp;

    statData.playerMp += itemMp;
    if (statData.playerMp > maxMp) {
      statData.playerMp = maxMp;
    }
    console.log('마나 획득!!!!!!!!!', statData.playerMp);
    super.notifyAll(payloadTypes.S_PICK_UP_ITEM_MP, {
      playerId: accountId,
      playerMp: statData.playerMp,
    });

    if (wantResult) {
      return statData.playerMp;
    }
  }
}

export default Dungeon;
