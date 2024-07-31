import { MAX_USERS } from '../constants/game.constants.js';
import { townRedis } from '../utils/redis/town.redis.js';
import { dungeonRedis } from '../utils/redis/dungeon.redis.js';
import { getTownSessionByUserId } from '../session/town.session.js';
import { addDungeonSession } from '../session/dungeon.session.js';
import { getUserById } from '../session/user.session.js';
import { enterDungeonSession } from '../handlers/dungeon/enter-dungeon.js';

// const waitingList = []; // one list per stage?
let waitingLists; // dungeonCode : waitingList[];

export const initWaitingLists = () => {
  waitingLists = {};
};

/**
 *
 * @param {Object} data
 */
export const addToWaitingList = (data) => {
  const { dungeonCode, user } = data;

  // TODO: init 파일로 모든 던전 코드에 대해 waitingList initialize 하고 이 if문 제거
  if (!waitingLists[dungeonCode]) {
    waitingLists[dungeonCode] = [];
  }
  const idx = getWaitingListIndex(dungeonCode, user);
  console.log('idx:', idx);
  if (idx === -1) {
    // 유저가 큐에 존재하지 않을 때
    waitingLists[dungeonCode].push(user);
  } else {
    console.log(`User ${user.accountId} already in queue.`);
  }

  printWaitingList(dungeonCode);
  // console.log('waitingLists[dungeonCode]:', waitingLists[dungeonCode]);
};

// TODO: 시간복잡도 줄일 수 있는 구조 고민해보기 (전송했던 dungeonCode 저장?)
export const clearFromWaitingLists = (user) => {
  for (const dungeonCode in Object.keys(waitingLists)) {
    const idx = getWaitingListIndex(dungeonCode, user);
    if (idx !== -1) {
      // 유저를 찾으면 제거
      console.log('Found user:', idx);
      waitingLists[dungeonCode]?.splice(idx, 1);
    }
  }
};

const getWaitingListIndex = (dungeonCode, user) => {
  if (waitingLists[dungeonCode]) {
    return waitingLists[dungeonCode].findIndex((item) => item.accountId === user.accountId);
  }
  return -1;
};

const printWaitingList = (dungeonCode) => {
  if (waitingLists[dungeonCode]) {
    console.log(
      'waitingList:',
      waitingLists[dungeonCode].map((user) => user.accountId),
    );
  } else {
    console.log('???');
  }
};

/**
 *
 * @param {number} dungeonCode
 */
export const checkWaitingList = async (dungeonCode) => {
  console.log('------------');
  if (waitingLists[dungeonCode].length >= MAX_USERS) {
    const users = waitingLists[dungeonCode].splice(0, MAX_USERS);
    console.log('checkWaitingList:', users);

    // TODO: 위의 users에 있는 유저들을 포함하는 게임 세션 생성

    const accountIds = users.map((user) => user.accountId);

    // BattleSession 생성
    // redis
    const hostId = accountIds[0];
    const hostInfo = await townRedis.getPlayerInfo(hostId);
    await dungeonRedis.createDungeon(hostInfo, hostId);
    // 인메모리
    const dungeonSession = addDungeonSession();

    for (const accountId of accountIds) {
      // users의 유저를 battle session에 추가
      // redis
      const playerInfo = await townRedis.getPlayerInfo(accountId);
      await dungeonRedis.createGuest(playerInfo, hostId, accountId);
      // 인메모리
      const user = getUserById(accountId);
      dungeonSession.addUser(user);

      // town session에서 유저 제거
      await townRedis.removePlayer(accountId, false);

      // 각 유저의 town session 내 다른 유저에게 Despawn 패킷 전송
      const townSession = getTownSessionByUserId(accountId);
      console.log('townSession:', townSession);
      townSession.removeUser(accountId);

      // 각 클라이언트에게 S_EnterDungeon 패킷 전송
      enterDungeonSession(accountId, dungeonCode);
    }
  }
};
