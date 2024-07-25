import { packetTypes, payloadTypes } from '../constants/packet.constants.js';
import { writeHeader } from './packet-header.utils.js';
import { deserializeTemp, serialize, serializeEx } from './packet-serializer.utils.js';

/**
 * 소켓 쓰기용 함수. 소켓을 bind하여 사용한다.
 * 예) socket.sendPacket = sendPacket.bind(socket);
 * socket.sendPacket(packetType, data);
 * @deprecated
 * @param {number} payloadType packetType as mapped in packetTypes
 * @param {Object} data key-value object to be serialized
 */
export function sendPacket(payloadType, data) {
  const serialized = serialize(payloadType, data);
  const header = writeHeader(serialized.length, payloadType);
  const packet = Buffer.concat([header, serialized]);
  console.log('deserialized:', deserializeTemp(payloadType, serialized));
  this.write(packet);
}

/**
 *
 * @param {uint32} code
 * @param {string} message
 * @param {uint32} payloadType
 * @param {Object} data key-value pair
 * @param {boolean} dontSend true면 안보내고 packet 반환
 */
export const sendResponse = function (code, message, payloadType, payload, dontSend) {
  // const serializedPayload = serialize(payloadType, payload);
  // console.log('deserialized:', deserializeTemp(payloadType, serializedPayload));
  const packetData = {
    code,
    message,
    timestamp: Date.now(),
    payloadType,
    payload,
  };
  const serializedPacket = serializeEx(payloadType, packetData);
  const header = writeHeader(serializedPacket.length, payloadType);
  const packet = Buffer.concat([header, serializedPacket]);
  // console.log('---- packet:', packet);
  // let value = '';
  // for (const byte of packet) {
  //   value += byte + ' ';
  // }
  // console.log('---- value: ', value);
  // console.log('---- packet length:', packet.length);
  if (dontSend) {
    return packet;
  }
  this.write(packet);
};

/**
 *
 * @param {*} code
 * @param {*} message
 * @param {*} payloadType
 * @param {*} payload
 * @param {boolean} dontSend
 * @returns
 */
export const sendResponseEx = function (code, message, payloadType, payload, dontSend) {
  const packetData = {
    code,
    message,
    payloadType,
    payload,
  };
  const serialized = serializeEx(payloadType, packetData);
  const header = writeHeader(serialized.length, payloadType); // 2 is placeholder
  const packet = Buffer.concat([header, serialized]);
  if (dontSend) {
    return packet;
  }
  this.write(packet);
};

/**
 *
 * @param {uint64} timestamp Date.now()
 * @param {string} message
 * @param {uint32} payloadType
 * @param {Object} payload key-value pair
 */
export const sendNotification = function (timestamp, message, payloadType, payload) {
  const serializedPayload = serialize(payloadType, payload);
  console.log('deserialized:', deserializeTemp(payloadType, serializedPayload));
  const packetData = {
    timestamp,
    message,
    payloadType,
    payload: serializedPayload,
  };
  const serializedPacket = serialize(packetTypes.NOTIFICATION, packetData, true);
  const header = writeHeader(serializedPacket.length, packetTypes.NOTIFICATION);
  const packet = Buffer.concat([header, serializedPacket]);
  this.write(packet);
};
