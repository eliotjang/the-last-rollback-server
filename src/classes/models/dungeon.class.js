import { MAX_USERS } from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import pickUpHandler from '../../handlers/dungeon/pick-up.handler.js';
import { getGameAssets } from '../../init/assets.js';
import Game from './game.class.js';

// const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;
    this._isNight = false;
    this.readyStates = [];
    this.round = null;
    this.roundMonsters = null;
    this.playerInfos = null;
    this.playerStatus = null;
    this.towerHp = null;
    this.itemNames = [];
    this.itemProbability = [];
    this.pickUpItems = [];
  }

  addTowerHp(towerHp) {
    this.towerHp = towerHp;
  }

  updateMonsterAttackTower() {
    //
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
    if (data.playerHp - damage <= 0) {
      console.log(`${accountId} 플레이어 사망`);
      // this.killPlayer(accountId);
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
    this.playerInfos.delete(accountId);
    this.playerStatus.delete(accountId);
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
  addItemBox(accountId, boxCount, wantResult) {
    if (!(this.playerInfos.has(accountId) && this.playerStatus.has(accountId))) {
      console.log('해당 플레이어가 존재하지 않음');
      return null;
    }

    const data = this.playerInfos.get(accountId);
    data.itemBox += boxCount;
    this.playerInfos.set(accountId, data);
    console.log('상자 획득!!!!!!!!!', data.itemBox);
    // super.notifyAll(payloadTypes.S_PICK_UP_ITEM_BOX, {
    //   playerId: accountId,
    //   updateBox: data.itemBox,
    // });
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
    this.roundMonsters = new Map(monsters);

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
    if (data.monsterHp - damage <= 0) {
      pickUpHandler(accountId);
      data.monsterHp -= damage;
      this.roundMonsters.set(monsterIndex, data);
      console.log(`monsterIndex ${monsterIndex}번 몬스터 처치`);
      this.updatePlayerExp(accountId, data.killExp);

      // this.killMonster(monsterIndex);
    } else {
      data.monsterHp -= damage;
      this.roundMonsters.set(monsterIndex, data);
    }

    if (wantResult) {
      return this.getMonster(monsterIndex);
    }
  }

  /**
   *
   * @param {number} monsterIndex 몬스터 인덱스
   * @description updatePlayerAttackMonster 내부에서 사용
   */
  killMonster(monsterIndex) {
    // updatePlayerAttackMonster 내부에서 사용
    this.roundMonsters.delete(monsterIndex);
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
    // Promise.all(this.users.map((curUser) => curUser.getPlayerInfo())).then(() => {
    //   super.addUser(user);
    // });
    super.addUser(user);
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
    super.notifyAll(payloadTypes.S_PLAYER_ATTACKED, {
      monsterIdx,
      attackType,
      playerId: accountId,
      playerHp,
    });
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll(payloadTypes.S_DESPAWN, { playerIds: [accountId] });
  }

  async movePlayer(accountId, transform) {
    // await dungeonRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }

  moveMonster(accountId, payloadType, payload) {
    super.notifyOthers(accountId, payloadType, payload);
  }

  toggleReadyState(user) {
    if (isNight) return true;
    const idx = this.readyStates.findIndex((targetId) => targetId === user.accountId);
    if (idx !== -1) {
      this.readyStates.push(user.accountId);
      if (this.readyStates.length === MAX_USERS) {
        this.setNight();
        // TODO: 모든 유저에게 S_NightRoundStart 전송
        const data = {}; //
        super.notifyAll(payloadTypes.S_NIGHT_ROUND_START, data);
      }
      return true;
    } else {
      this.readyStates.splice(idx, 1);
      return false;
    }
  }

  getReadyCount() {
    return this.readyStates.length;
  }

  endNightRound() {
    if (!isNight) return;
    this.setDay();
    const dungeonInfo = []; // 다음 라운드 몬스터 목록 받아오기
    const roundResults = []; // 각 유저의 라운드 통계 받아오기
    const data = {
      dungeonInfo,
      roundResults,
    };
    super.notifyAll(payloadTypes.S_NIGHT_ROUND_END, data);
  }

  setDay() {
    this._isNight = false;
  }

  setNight() {
    this._isNight = true;
  }

  animationMonster(data) {
    super.notifyAll(payloadTypes.S_ANIMATION_MONSTER, data);
  }

  animationPlayer(data) {
    super.notifyAll(payloadTypes.S_ANIMATION_PLAYER, data);
  }

  addPickUpList(data) {
    const itemNames = data.map((item) => item.itemName);
    const itemProbability = data.map((item) => item.probability);
    const totalProbability = itemProbability.reduce((sum, cur) => sum + cur, 0);
    const lastProbability = 100 - totalProbability;

    if (totalProbability >= 100) {
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
    // super.notifyAll(payloadTypes.S_PICK_UP_ITEM_HP, {
    //   playerId: accountId,
    //   playerHp: statData.playerHp,
    // });

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
    console('마나 획득!!!!!!!!!', statData.playerMp);
    // super.notifyAll(payloadTypes.S_PICK_UP_ITEM_MP, {
    //   playerId: accountId,
    //   playerMp: statData.playerMp,
    // });

    if (wantResult) {
      return statData.playerMp;
    }
  }
}

export default Dungeon;
