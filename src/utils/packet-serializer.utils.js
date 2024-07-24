import {
  getPayloadNameByPayloadType,
  packetTypes,
  payloadTypes,
} from '../constants/packet.constants.js';
import { getProtoMessages } from '../init/proto.init.js';
import CustomError from './error/customError.js';
import { ErrorCodes } from './error/errorCodes.js';
import { writeHeader } from './packet-header.utils.js';

/**
 *
 * @param {number} type packetTypes에 매핑된 패킷 타입
 * @param {object} data 직렬화할 데이터
 * @param {boolean} withoutHeader 비워둘 시 직렬화 시 헤더를 자동으로 추가, true 시 헤더 없이 반환
 * @returns 버퍼 바이트 배열 반환
 */
export const serialize = (type, data, isPacket, withoutHeader) => {
  const MessageType = getProtoMessages()[isPacket ? 'packet' : 'payload'][type];
  if (!MessageType) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `직렬화 에러: 잘 못된 ${isPacket ? 'packetType' : 'payloadType'} ${type}`,
    );
  }

  const msg = MessageType.verify(data);
  if (msg) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, '직렬화 에러:', msg);
  }
  const encoded = MessageType.encode(data).finish();
  if (withoutHeader) {
    return encoded;
  }
  const header = writeHeader(encoded.length, type);
  return Buffer.concat([header, encoded]);
};

/**
 *
 * @param {Bytes} data
 * @returns decoded data
 */
export const deserialize = (packetType, data) => {
  const MessageType = getProtoMessages().packet[packetType];
  if (!MessageType) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, `잘 못된 packetType: ${packetType}`);
  }
  const decoded = MessageType.decode(data);
  if (packetType === packetTypes.PING) {
    // PING인 경우 payload 없으므로 그냥 반환
    return decoded;
  }

  // 다른 타입은 payload 역직렬화 시도
  const PayloadMessageType = getProtoMessages().payload[decoded.payloadType];
  if (!PayloadMessageType) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, `잘 못된 payloadType: ${decoded.payloadType}`);
  }
  decoded.payload = PayloadMessageType.decode(decoded.payload);

  return decoded;
};

export const deserializeTemp = (payloadType, data) => {
  const PayloadMessageType = getProtoMessages().payload[payloadType];
  if (!PayloadMessageType) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, `잘 못된 payloadType: ${payloadType}`);
  }
  const decoded = PayloadMessageType.decode(data);

  return decoded;
};
