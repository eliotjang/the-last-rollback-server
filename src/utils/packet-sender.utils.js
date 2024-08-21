import { isBlackListed, loggerConstants } from '../constants/constants.js';
import { packetTypes, payloadKeyNames, payloadTypes } from '../constants/packet.constants.js';
import { getProtoMessages } from '../init/proto.init.js';
import { handleError } from './error/errorHandler.js';
import { readHeader, writeHeader } from './packet-header.utils.js';
import {
  serializeEx,
  deserializeTest,
  serializePf,
  deserializePf,
} from './packet-serializer.utils.js';

/**
 * Bind this function to a socket. Sends ping packet to the connected client.
 * @param {*} timestamp
 * @param {*} dontSend
 * @returns
 */
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
 * Bind this function to a socket. Sends response packet to the connected client.
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
    const serializedPacket = serializeEx(packetTypes.RESPONSE, payloadType, packetData);

    logPacket(packetTypes.RESPONSE, payloadType, serializedPacket);

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
 * Bind this function to a net socket. Sends notification packet to the connected client.
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
    const serializedPacket = serializeEx(packetTypes.NOTIFICATION, payloadType, packetData);

    logPacket(packetTypes.NOTIFICATION, payloadType, serializedPacket);

    const header = writeHeader(serializedPacket.length, packetTypes.NOTIFICATION);
    const packet = Buffer.concat([header, serializedPacket]);
    this.write(packet);
  } catch (err) {
    handleError(this, err);
  }
};

/**
 *
 * @param {*} dediPacketType
 * @param {*} data
 */
export const sendPacketToDediServer = async function (dediPacketType, data) {
  try {
    const serializedPacket = serializePf(dediPacketType, data);
    deserializePf(dediPacketType, serializedPacket);
    const header = writeHeader(serializedPacket.length, dediPacketType);
    const packet = Buffer.concat([header, serializedPacket]);
    this.write(packet);
  } catch (err) {
    // TODO: need custom error handling for this
    console.error(err);
  }
};

const logPacket = (packetType, payloadType, serializedPacket) => {
  if (loggerConstants.LOGGING && !isBlackListed(payloadType)) {
    const { totalLength } = readHeader(serializedPacket);
    console.log(`sending: [${payloadType}] ${payloadKeyNames[payloadType]}`);
    if (loggerConstants.VERBOSE) {
      console.log(`-- totalLength: ${totalLength}`);
      deserializeTest(packetType, serializedPacket);
    }
  }
};
