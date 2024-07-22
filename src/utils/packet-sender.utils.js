import { serialize } from './packet-serializer.utils.js';

export const sendPacket = (packetType, data) => {
  const serialized = serialize(packetType, data, true);
  const header = writeHeader(serialized.length, packetType);
  const packet = Buffer.concat([header, serialized]);
  this.write(packet);
};
