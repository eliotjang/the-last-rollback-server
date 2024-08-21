import { packetTypes, payloadKeyNames } from '../constants/packet.constants.js';
import { getProtoMessages } from '../init/proto.init.js';
import CustomError from './error/customError.js';
import { ErrorCodes } from './error/errorCodes.js';

export const serialize = (messageType, data) => {
  if (!messageType) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `직렬화 에러: empty messageType ${messageType}.`,
    );
  }
  const msg = messageType.verify(data);
  if (msg) {
    const errorMessage = `직렬화 검증 실패: ${msg}\r\nfailed data: ${JSON.stringify(data, null, 2)}\r\n`;
    throw new CustomError(ErrorCodes.INVALID_PACKET, errorMessage);
  }

  const created = messageType.create(data);
  return messageType.encode(created).finish();
};

export const serializeEx = (packetType, payloadType, data) => {
  const MessageType = getProtoMessages().packet[packetType];
  data[payloadKeyNames[payloadType]] = data.payload;
  data.payload = null;
  return serialize(MessageType, data);
};

export const serializePf = (dediPacketType, data) => {
  const MessageType = getProtoMessages().pathfinding[dediPacketType];
  return serialize(MessageType, data);
};

/**
 *
 * @param {Bytes} data
 * @returns decoded data
 */
export const deserialize = (messageType, data) => {
  if (!messageType) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `역직렬화 에러: empty messageType (${messageType})`,
    );
  }
  return messageType.decode(data);
};

export const deserializeByPacketType = (packetType, data) => {
  const MessageType = getProtoMessages().packet[packetType];
  const decoded = deserialize(MessageType, data);
  if (packetType === packetTypes.PING) {
    return decoded;
  }

  const obj = {
    ...decoded,
  };
  obj.payload = decoded[payloadKeyNames[decoded.payloadType]];
  delete obj[payloadKeyNames[decoded.payloadType]];

  return obj;
};

export const deserializeTest = (packetType, packet) => {
  const MessageType = getProtoMessages().packet[packetType];
  const decoded = deserialize(MessageType, packet);
  console.log('-- deserialize test:', decoded);
  return decoded;
};

export const deserializePf = (dediPacketType, packet) => {
  const MessageType = getProtoMessages().pathfinding[dediPacketType];
  const deserialized = deserialize(MessageType, packet);
  console.log('===== ', deserialized);
  return deserialized;
};
