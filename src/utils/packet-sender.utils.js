import { isBlackListed } from '../constants/constants.js';
import { packetTypes, payloadKeyNames, payloadTypes } from '../constants/packet.constants.js';
import { handleError } from './error/errorHandler.js';
import { writeHeader } from './packet-header.utils.js';
import { serializeEx } from './packet-serializer.utils.js';

export async function sendPing(timestamp, dontSend = false) {
  try {
    const packetData = {
      timestamp,
    };
    const serialized = serializeEx(packetTypes.PING, 0, packetData);
    const header = writeHeader(serialized.length, packetTypes.PING);
    const packet = Buffer.concat([header, serialized]);
    if (dontSend) {
      return packet;
    }
    this.write(packet);
  } catch (err) {
    handleError(this, err);
  }
}

/**
 *
 * @param {uint32} code
 * @param {string} message
 * @param {uint32} payloadType
 * @param {Object} data key-value pair
 * @param {boolean} dontSend true면 안보내고 packet 반환
 */
export const sendResponse = async function (code, message, payloadType, payload, dontSend = false) {
  try {
    const packetData = {
      code,
      message,
      timestamp: Date.now(),
      payloadType,
      payload,
    };
    if (!isBlackListed(payloadType)) {
      console.log(`sendResponse: ${payloadKeyNames[payloadType]}`);
    }

    const serializedPacket = serializeEx(packetTypes.RESPONSE, payloadType, packetData);
    const header = writeHeader(serializedPacket.length, packetTypes.RESPONSE);
    const packet = Buffer.concat([header, serializedPacket]);

    if (dontSend) {
      return packet;
    }

    this.write(packet);
  } catch (err) {
    handleError(this, err);
  }
};

/**
 *
 * @param {uint64} timestamp Date.now()
 * @param {string} message
 * @param {uint32} payloadType
 * @param {Object} payload key-value pair
 */
export const sendNotification = async function (payloadType, payload) {
  try {
    const packetData = {
      timestamp: Date.now(),
      payloadType,
      payload,
    };
    if (!isBlackListed(payloadType)) {
      console.log(`sendNotification: ${payloadKeyNames[payloadType]}`);
    }

    const serializedPacket = serializeEx(packetTypes.NOTIFICATION, payloadType, packetData);
    const header = writeHeader(serializedPacket.length, packetTypes.NOTIFICATION);
    const packet = Buffer.concat([header, serializedPacket]);
    this.write(packet);
  } catch (err) {
    handleError(this, err);
  }
};
