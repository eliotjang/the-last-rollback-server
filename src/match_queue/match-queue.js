import dc from '../constants/game.constants.js';
import { townRedis } from '../utils/redis/town.redis.js';
import { getTownSessionByUserId } from '../session/town.session.js';
import { addDungeonSession } from '../session/dungeon.session.js';
import { getUserById } from '../session/user.session.js';
import { enterDungeonSession } from '../handlers/dungeon/enter-dungeon.js';
import { handleError } from '../utils/error/errorHandler.js';
import { matchEnqueue } from './producers/match-queue.producer.js';
import { payloadTypes } from '../constants/packet.constants.js';

let waitingLists;

export const initWaitingLists = () => {
  waitingLists = {};
};

export const addToWaitingList = (data) => {
  const { dungeonCode, accountId } = data;

  if (!waitingLists[dungeonCode]) {
    waitingLists[dungeonCode] = [];
  }
  const idx = getWaitingListIndex(dungeonCode, accountId);
  if (idx === -1) {
    waitingLists[dungeonCode].push(accountId);
  } else {
    console.log(`User ${accountId} already in queue.`);
  }
  // printWaitingList(dungeonCode);
};

export const clearFromWaitingLists = (accountId) => {
  for (const dungeonCode of Object.keys(waitingLists)) {
    const idx = getWaitingListIndex(dungeonCode, accountId);
    if (idx !== -1) {
      waitingLists[dungeonCode]?.splice(idx, 1);
    }
  }
};

export const getWaitingList = (dungeonCode) => {
  if (waitingLists[dungeonCode]) {
    return waitingLists[dungeonCode];
  }
  return null;
};

const getWaitingListIndex = (dungeonCode, accountId) => {
  if (waitingLists[dungeonCode]) {
    return waitingLists[dungeonCode].findIndex((item) => item === accountId);
  }
  return -1;
};

const printWaitingList = (dungeonCode) => {
  if (waitingLists[dungeonCode]) {
    console.log(
      'waitingList:',
      waitingLists[dungeonCode].map((accountId) => accountId),
    );
  }
};

export const checkWaitingList = async (dungeonCode) => {
  if (waitingLists[dungeonCode].length >= dc.general.MAX_USERS) {
    const accountIds = waitingLists[dungeonCode].splice(0, dc.general.MAX_USERS);
    console.log('checkWaitingList:', accountIds);

    const dungeonSession = addDungeonSession(dungeonCode);

    Promise.all(
      accountIds.map(async (accountId) => {
        const townSession = getTownSessionByUserId(accountId);
        townSession.removeUser(accountId);
        const user = getUserById(accountId);
        dungeonSession.addUser(user);
        await townRedis.removePlayer(accountId, false);
      }),
    )
      .then(() => {
        enterDungeonSession(dungeonSession, dungeonCode);
      })
      .catch((err) => {
        handleError(err);
        // matchEnqueue(dungeonCode,accountId);
      });
  }
};

export const notifyWaitingListCount = (dungeonCode) => {
  const waitingList = getWaitingList(dungeonCode);
  if (!waitingList) return;

  for (const accountId of waitingList) {
    const user = getUserById(accountId);
    // console.log(user);
    user.socket.sendNotification(payloadTypes.S_DUNGEON_MATCH_COUNT, { count: waitingList.length });
  }
};
