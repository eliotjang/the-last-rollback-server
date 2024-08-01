import { stringToCamelCase, stringToPascalCase } from '../utils/transform-case.utils.js';

const PROTOCOL_PREFIX = 'Google.Protobuf.Protocol.';
const PACKET_SUFFIX = 'Packet';

export const headerConstants = {
  // bytes
  TOTAL_LENGTH: 4,
  PACKET_TYPE_LENGTH: 1,
};

export const packetTypes = {
  PING: 0,
  REQUEST: 1,
  RESPONSE: 2,
  NOTIFICATION: 3,
};

export const payloadTypes = {
  C_ENTER: 0,
  S_ENTER: 1,
  S_SPAWN: 2,
  S_DESPAWN: 5, // 나 빼고 모두
  C_MOVE: 6,
  S_MOVE: 7, // 모두
  C_ANIMATION: 8,
  S_ANIMATION: 9, // 모두
  C_CHAT: 12,
  S_CHAT: 13, // noti
  // C_ENTER_DUNGEON: 14,
  C_PLAYER_RESPONSE: 15,
  // S_ENTER_DUNGEON: 16,
  S_LEAVE_DUNGEON: 17,
  S_SCREEN_TEXT: 18,
  S_SCREEN_DONE: 19,
  S_BATTLE_LOG: 20,
  S_SET_PLAYER_HP: 21,
  S_SET_PLAYER_MP: 22,
  S_SET_MONSTER_HP: 23,
  S_PLAYER_ACTION: 24,
  S_MONSTER_ACTION: 25,
  C_SIGN_UP: 26,
  S_SIGN_UP: 27,
  C_LOG_IN: 28,
  S_LOG_IN: 29,
  C_DUNGEON_MATCH: 50,
  S_DUNGEON_MATCH: 51,
  S_ENTER_DUNGEON: 55,
  S_ENTER_DUNGEON: 54,
  // S_LEAVE_DUNGEON: 55,
  C_DAY_ROUND_READY: 56,
  S_DAY_ROUND_READY: 57,
  S_NIGHT_ROUND_START: 58,
  S_NIGHT_ROUND_END: 59,
  C_MONSTER_MOVE: 60,
  S_MONSTER_MOVE: 61,

  S_SOME_NOTIFICATION: 300,
};

export const packetNames = Object.fromEntries(
  Object.entries(packetTypes).map(([key, value]) => {
    const str = PROTOCOL_PREFIX + stringToPascalCase(key) + PACKET_SUFFIX;
    return [value, str];
  }),
);

export const payloadNames = Object.fromEntries(
  Object.entries(payloadTypes).map(([key, value]) => {
    const str = PROTOCOL_PREFIX + key.substring(0, 2) + stringToPascalCase(key.substring(2));
    return [value, str];
  }),
);

/**
 * @deprecated
 */
export const typeMappings = Object.fromEntries(
  Object.entries(payloadTypes).map(([key, value]) => {
    if (key.charAt(0) === 'S') {
      if (key.endsWith('NOTIFICATION')) {
        return [value, packetTypes.NOTIFICATION];
      }
      return [value, packetTypes.RESPONSE];
    }
    return [value, packetTypes.REQUEST];
  }),
);

export const payloadKeyToTypes = {};

export const payloadKeyNames = Object.fromEntries(
  Object.entries(payloadTypes).map(([key, value]) => {
    const payloadKey = stringToCamelCase(key);
    payloadKeyToTypes[payloadKey] = value;
    return [value, payloadKey];
  }),
);

/**
 *
 * @param {number} payloadType payloadTypes에 매핑된 타입
 * @returns payloadType에 맞는 Message 이름 반환
 */
export const getPayloadNameByPayloadType = (payloadType) => {
  if (Object.values(payloadNames).includes(payloadType)) {
    return payloadNames[payloadType];
  }
  return null;
};
