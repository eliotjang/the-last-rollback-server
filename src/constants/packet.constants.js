import { stringToCamelCase, stringToPascalCase } from '../utils/transform-case.utils.js';

const packagePrefix = 'Google.Protobuf.Protocol.';

export const headerConstants = {
  // bytes
  TOTAL_LENGTH: 4,
  PACKET_TYPE_LENGTH: 1,
};

export const packetTypes = {
  C_ENTER: 0,
  S_ENTER: 1,
  S_SPAWN: 2,
  S_DESPAWN: 5,
  C_MOVE: 6,
  S_MOVE: 7,
  C_ANIMATION: 8,
  S_ANIMATION: 9,
  C_CHAT: 12,
  S_CHAT: 13,
  C_ENTER_DUNGEON: 14,
  C_PLAYER_RESPONSE: 15,
  S_ENTER_DUNGEON: 16,
  S_LEAVE_DUNGEON: 17,
  S_SCREEN_TEXT: 18,
  S_SCREEN_DONE: 19,
  S_BATTLE_LOG: 20,
  S_SET_PLAYER_HP: 21,
  S_SET_PLAYER_MP: 22,
  S_SET_MONSTER_HP: 23,
  S_PLAYER_ACTION: 24,
  S_MONSTER_ACTION: 25,
  C_SIGNUP: 26,
  S_SIGNUP: 27,
  C_LOGIN: 28,
  S_LOGIN: 29,
};

export const packetNames = Object.fromEntries(
  Object.entries(packetTypes).map(([key, value]) => {
    const str = packagePrefix + key.substring(0, 2) + stringToPascalCase(key.substring(2));
    return [value, str];
  }),
);

/**
 *
 * @param {number} packetType packetTypes에 매핑된 타입
 * @returns packetType에 맞는 Message 이름 반환
 */
export const getPacketNameByPacketType = (packetType) => {
  if (Object.values(packetNames).includes(packetType)) {
    return packetNames[packetType];
  }
  return null;
};

// const payloadNames = Object.fromEntries(
//   Object.entries(packetTypes).map(([key, value]) => {
//     return [value, stringToCamelCase(key)];
//   }),
// );

// [packetTypes.C_ENTER]: "cEnter",
// [packetTypes.S_ENTER]: "sEnter",
// [packetTypes.S_SPAWN]: "sSpawn",
// [packetTypes.S_DESPAWN]: "sDespawn",
// [packetTypes.C_MOVE]: "cMove",
// [packetTypes.S_MOVE]: "sMove",
// [packetTypes.C_ANIMATION]: "cAnimation",
// [packetTypes.S_ANIMATION]: "sAnimation",
// [packetTypes.C_CHAT]: "cChat",
// [packetTypes.S_CHAT]: "sChat",
// [packetTypes.C_ENTER_DUNGEON]: "cEnterDungeon",
// [packetTypes.C_PLAYER_RESPONSE]: "cPlayerResponse",
// [packetTypes.S_ENTER_DUNGEON]: "sEnterDungeon",
// [packetTypes.S_LEAVE_DUNGEON]: "sLeaveDungeon",
// [packetTypes.S_SCREEN_TEXT]: "sScreenText",
// [packetTypes.S_SCREEN_DONE]: "sScreenDone",
// [packetTypes.S_BATTLE_LOG]: "sBattleLog",
// [packetTypes.S_SET_PLAYER_HP]: "sSetPlayerHp",
// [packetTypes.S_SET_PLAYER_MP]: "sSetPlayerMp",
// [packetTypes.S_SET_MONSTER_HP]: "sSetMonsterHp",
// [packetTypes.S_PLAYER_ACTION]: "sPlayerAction",
// [packetTypes.S_MONSTER_ACTION]: "sMonsterAction",

// /**
//  *
//  * @param {number} packetType
//  * @returns proto message's payload field name, or null if dne.
//  */
// export const getPacketNameByPacketType = (packetType) => {
//   if (Object.values(payloadNames).includes(packetType)) {
//     return packetNames[packetType];
//   }
//   return null;
// };
