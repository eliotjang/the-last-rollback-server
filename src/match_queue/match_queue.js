import { MAX_USERS } from '../constants/game.constants.js';
import { townRedis } from './town.redis.js';
import { dungeonRedis } from './dungeon.redis.js';
import { getTownSessionByUserId } from '../session/town.session.js';
import { payloadTypes } from '../../constants/packet.constants.js';

// const waitingList = []; // one list per stage?
const waitingLists = {}; // dungeonCode : waitingList[];

/**
 *
 * @param {Object} data
 */
export const addToWaitingList = (data) => {
  // TODO: init 파일로 모든 던전 코드에 대해 waitingList initialize 하고 이 if문 제거
  if (!waitingLists[data.dungeonCode]) {
    waitingLists[data.dungeonCode] = [];
  }
  waitingLists[data.dungeonCode].push(data.user);
  console.log('waitingLists[data.dungeonCode]:', waitingLists[data.dungeonCode]);
};

/**
 *
 * @param {number} dungeonCode
 */
export const checkWaitingList = async (dungeonCode) => {
  console.log('------------');
  if (waitingLists[dungeonCode].length >= MAX_USERS) {
    const users = waitingLists.splice(0, MAX_USERS);
    console.log('checkWaitingList:', users);

    // TODO: 위의 users에 있는 유저들을 포함하는 게임 세션 생성

    // BattleSession 생성
    const hostId = users[0];
    const hostInfo = await townRedis.getPlayerInfo(hostId);
    await dungeonRedis.createDungeon(hostInfo, hostId);

    // users의 유저를 battle session에 추가
    for (const user of users) {
      const playerInfo = await townRedis.getPlayerInfo(user);
      await dungeonRedis.createGuest(playerInfo, hostId, user);
    }

    // town session에서 유저 제거
    for (const user of users) {
      await townRedis.removePlayer(user, false);
    }

    // 각 유저의 town session 내 다른 유저에게 Despawn 패킷 전송
    for (const user of users) {
      const townSession = getTownSessionByUserId(user); // 이 방법으로 townSession에 저장했다는 가정 하에
      townSession.notifyOthers(user, payloadTypes.S_DESPAWN, { playerIds: users });
    }
  }
};
