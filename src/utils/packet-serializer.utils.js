import { payloadKeyNames, typeMappings } from '../constants/packet.constants.js';
import { getProtoMessages } from '../init/proto.init.js';
import CustomError from './error/customError.js';
import { ErrorCodes } from './error/errorCodes.js';
import { writeHeader } from './packet-header.utils.js';

/**
 *
 * @deprecated
 * @param {number} payloadType packetTypes에 매핑된 패킷 타입
 * @param {object} data 직렬화할 데이터
 * @param {boolean} withoutHeader 비워둘 시 직렬화 시 헤더를 자동으로 추가, true 시 헤더 없이 반환
 * @returns 버퍼 바이트 배열 반환
 */
export const serialize = (packetType, data, withoutHeader) => {
  const MessageType = getProtoMessages().packet[packetType];
  if (!MessageType) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `직렬화 에러: 잘 못된 packetType ${packetType}`,
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

  const header = writeHeader(encoded.length, packetType);
  return Buffer.concat([header, encoded]);
};

export const serializeEx = (packetType, payloadType, data) => {
  const MessageType = getProtoMessages().packet[packetType];
  data[payloadKeyNames[payloadType]] = data.payload;
  data.payload = null;
  if (!MessageType) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `직렬화 에러: 잘 못된 payloadType ${payloadType}`,
    );
  }

  const msg = MessageType.verify(data);
  if (msg) {
    console.log('failed data:', JSON.stringify(data));
    console.log(msg);
    throw new CustomError(ErrorCodes.INVALID_PACKET, '직렬화 에러:', msg);
  }

  const created = MessageType.create(data);
  const encoded = MessageType.encode(created).finish();
  // console.log('ex deserialize:', deserializeEx(payloadType, encoded));
  return encoded;
};

/**
 *
 * @param {Bytes} data
 * @returns decoded data
 */
export const deserialize = (packetType, data) => {
  const MessageType = getProtoMessages().packet[packetType];
  if (!MessageType) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, `잘 못된 payloadType: ${payloadType}`);
  }
  const decoded = MessageType.decode(data);

  return decoded;
};

export const deserializeByPacketType = (packetType, data) => {
  const MessageType = getProtoMessages().packet[packetType];
  if (!MessageType) {
    throw new CustomError(ErrorCodes.INVALID_PACKET, `잘 못된 packetType: ${packetType}`);
  }
  const decoded = MessageType.decode(data);

  const obj = {
    ...decoded,
  };
  obj.payload = decoded[payloadKeyNames[decoded.payloadType]];
  delete obj[payloadKeyNames[decoded.payloadType]];

  return obj;
};

export const deserializeTest = (packetType, packet) => {
  const MessageType = getProtoMessages().packet[packetType];
  if (!MessageType) {
    throw new CustomError('역직렬화 문제 발생');
  }
  const decoded = MessageType.decode(packet);
  // console.log('deserialize test:', decoded);
  return decoded;
};
