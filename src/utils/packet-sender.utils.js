import { serialize } from './packet-serializer.utils.js';

/**
 * 소켓 쓰기용 함수. 소켓을 bind하여 사용한다.
 * 예) socket.sendPacket = sendPacket.bind(socket);
 * socket.sendPacket(packetType, data);
 * @param {number} packetType packetType as mapped in packetTypes
 * @param {Object} data key-value object to be serialized
 */
export const sendPacket = (packetType, data) => {
  const serialized = serialize(packetType, data, true);
  const header = writeHeader(serialized.length, packetType);
  const packet = Buffer.concat([header, serialized]);
  this.write(packet);
};
