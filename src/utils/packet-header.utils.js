import { headerConstants } from '../constants/packet.constants.js';

/**
 *
 * @param {Buffer} packet packet with header attached
 */
export const readHeader = (packet) => {
  //
  const totalLength = packet.readIntLE(0, headerConstants.TOTAL_LENGTH);
  const packetType = packet.readIntLE(
    headerConstants.TOTAL_LENGTH,
    headerConstants.PACKET_TYPE_LENGTH,
  );
  return {
    totalLength,
    packetType,
  };
};

/**
 * 서버쪽 역직렬화 테스트용 헤더 분리 함수
 * @param {Buffer} data
 */
export const detachHeader = (data) => {
  const headerSize = headerConstants.TOTAL_LENGTH + headerConstants.PACKET_TYPE_LENGTH;
  const totalLength = data.readIntBE(0, headerConstants.TOTAL_LENGTH);
  const packetType = data.readIntBE(
    headerConstants.TOTAL_LENGTH,
    headerConstants.PACKET_TYPE_LENGTH,
  );
  return {
    totalLength,
    packetType,
    payload: data.subarray(headerSize),
  };
};

/**
 *
 * @param {number} dataLength length of the data (serialized)
 * @param {number} packetType packet type as mapped in
 */
export const writeHeader = (dataLength, packetType) => {
  const headerSize = headerConstants.TOTAL_LENGTH + headerConstants.PACKET_TYPE_LENGTH;
  const header = Buffer.alloc(headerSize);
  header.writeIntBE(headerSize + dataLength, 0, headerConstants.TOTAL_LENGTH);
  header.writeIntBE(packetType, headerConstants.TOTAL_LENGTH, headerConstants.PACKET_TYPE_LENGTH);
  return header;
};
