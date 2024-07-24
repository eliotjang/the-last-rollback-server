import { packetTypes } from '../constants/packet.constants.js';
import { writeHeader } from './packet-header.utils.js';
import { serialize } from './packet-serializer.utils.js';

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
  this.write(packet);
}

/**
 *
 * @param {uint32} code
 * @param {string} message
 * @param {uint32} payloadType
 * @param {Object} data key-value pair
 */
export const sendResponse = function (code, message, payloadType, payload) {
  const serializedPayload = serialize(payloadType, payload);
  const packetData = {
    code,
    message,
    payloadType,
    payload: serializedPayload,
  };
  const serializedPacket = serialize(packetTypes.RESPONSE, packetData, true);
  const header = writeHeader(serializedPacket.length, packetTypes.RESPONSE);
  const packet = Buffer.concat([header, serializedPacket]);
  console.log('---- packet:', packet);
  let value = '';
  for (const byte of packet) {
    value += byte + ' ';
  }
  console.log('---- value: ', value);
  console.log('---- packet length:', packet.length);
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
