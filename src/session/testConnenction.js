import { getGameAssets } from '../init/assets.js';
import TransformInfo from '../protobuf/classes/info/transform-info.proto.js';
import { addDungeonSession } from './dungeon.session.js';
import { addUser, removeUser } from './user.session.js';

const dungeonSessionConnection = async () => {
  const { monsterInfo, charStatInfo } = getGameAssets();
  const round1 = new Map();
  for (let i = 0; i < 3; i++) {
    const monsterIdx = i;
    const transform = new TransformInfo();
    const data = {
      monsterModel: monsterInfo.data[i].monsterModel,
      monsterName: monsterInfo.data[i].monsterName,
      monsterHp: monsterInfo.data[i].monsterHp,
      monsterTransform: transform.getTransform(),
      killExp: monsterInfo.data[i].killExp,
    };
    round1.set(monsterIdx, data);
  }
  const tempRound = {
    round1,
  };
  const playerInfos = new Map();
  const playerStatus = new Map();
  const playerTransform = new TransformInfo();
  const player1Id = 'eliot1';
  const player1Info = {
    nickname: 'eliot1Nick',
    charClass: 1003,
    transform: playerTransform.getTransform(),
    gold: 0,
    itemBox: 0,
  };
  const player2Id = 'eliot2';
  const player2Info = {
    nickname: 'eliot2Nick',
    charClass: 1001,
    transform: playerTransform.getTransform(),
    gold: 0,
    itemBox: 0,
  };
  playerInfos.set(player1Id, player1Info);
  playerInfos.set(player2Id, player2Info);
  const player1Status = {
    playerLevel: charStatInfo[player1Info.charClass][0].level,
    playerExp: 0,
    playerHp: charStatInfo[player1Info.charClass][0].hp,
    playerMp: charStatInfo[player1Info.charClass][0].mp,
  };
  const player2Status = {
    playerLevel: charStatInfo[player2Info.charClass][0].level,
    playerExp: 0,
    playerHp: charStatInfo[player2Info.charClass][0].hp,
    playerMp: charStatInfo[player2Info.charClass][0].mp,
  };
  playerStatus.set(player1Id, player1Status);
  playerStatus.set(player2Id, player2Status);

  const user1 = await addUser('socket1', 'eliot1');
  const user2 = await addUser('socket2', 'eliot2');

  const dungeonSession = addDungeonSession();
  dungeonSession.addUser(user1);
  dungeonSession.addUser(user2);
  const roundMonsters = dungeonSession.addRoundMonsters(1, tempRound.round1, true);
  // console.log(roundMonsters);

  const testTransform = {
    posX: 12,
    poxY: 15,
    posZ: 11,
    rot: 8,
  };
  const test2 = dungeonSession.updateMonsterTransform(2, testTransform, true);
  // console.log(test2);
  const test3 = dungeonSession.addPlayers(playerInfos, playerStatus, true);
  // console.log(test3);
  const test4 = dungeonSession.getPlayerInfo(player1Id);
  // console.log(test4);
  const test5 = dungeonSession.getPlayerStatus(player2Id);
  // console.log(test5);
  const test6 = dungeonSession.updateMonsterAttackPlayer(player2Id, 30, true);
  // console.log(test6);
  const test7 = dungeonSession.updatePlayerUseSkill(player1Id, 40, true);
  // console.log(test7);
  const test8 = dungeonSession.updatePlayerAttackMonster(player1Id, 0, 20, true);
  // console.log(test8);
  const test9 = dungeonSession.updatePlayerExp(player1Id, 14000, true);
  // console.log(test9);
  const test10 = dungeonSession.updatePlayerTransform(player1Id, testTransform, true);
  // console.log(test10);
  const test11 = dungeonSession.addPlayerGold(player1Id, 500, true);
  // console.log(test11);
  const test12 = dungeonSession.removePlayerGold(player1Id, 200, true);
  // console.log(test12);
  const test13 = dungeonSession.addItemBox(player1Id, true);
  // console.log(test13);
  const test14 = dungeonSession.removeItemBox(player1Id, true);
  // console.log(test14);
  const test15 = dungeonSession.addItemBox(player1Id, 1, true);
  //console.log(test15);
  removeUser('socket1');
  removeUser('socket2');
};

export const testAllSessionConnections = async () => {
  await dungeonSessionConnection();
};
