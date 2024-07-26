import { packetTypes, payloadTypes } from '../constants/packet.constants.js';
import { writeHeader } from './packet-header.utils.js';
import { deserializeTest, serializeEx } from './packet-serializer.utils.js';

/**
 * 소켓 쓰기용 함수. 소켓을 bind하여 사용한다.
 * 예) socket.sendPacket = sendPacket.bind(socket);
 * socket.sendPacket(packetType, data);
 * @param {number} payloadType packetType as mapped in packetTypes
 * @param {Object} data key-value object to be serialized
 */
export function sendPacket(payloadType, data) {
  // const serialized = serialize(payloadType, data, true);
  // const header = writeHeader(serialized.length, payloadType);
  // const packet = Buffer.concat([header, serialized]);
  // this.write(packet);
}

/**
 *
 * @param {uint32} code
 * @param {string} message
 * @param {uint32} payloadType
 * @param {Object} data key-value pair
 * @param {boolean} dontSend true면 안보내고 packet 반환
 */
export const sendResponse = function (code, message, payloadType, payload, dontSend = false) {
  const packetData = {
    code,
    message,
    timestamp: Date.now(),
    payloadType,
    payload,
  };
  const serializedPacket = serializeEx(packetTypes.RESPONSE, payloadType, packetData);
  console.log('deserialize test:', deserializeTest(packetTypes.RESPONSE, serializedPacket));
  const header = writeHeader(serializedPacket.length, packetTypes.RESPONSE);
  const packet = Buffer.concat([header, serializedPacket]);

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
export const sendNotification = function (payloadType, payload) {
  const packetData = {
    timestamp: Date.now(),
    payloadType,
    payload,
  };
  const serializedPacket = serializeEx(packetTypes.NOTIFICATION, payloadType, packetData);
  console.log('deserialize test:', deserializeTest(packetTypes.NOTIFICATION, serializedPacket));
  const header = writeHeader(serializedPacket.length, packetTypes.NOTIFICATION);
  const packet = Buffer.concat([header, serializedPacket]);
  this.write(packet);
};
