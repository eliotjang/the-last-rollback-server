import { headerConstants } from '../constants/packet.constants.js';
import { getHandlerByPacketType } from '../handlers/index.js';
import { handleError } from '../utils/error/errorHandler.js';
import { readHeader } from '../utils/packet-header.utils.js';
import { deserialize } from '../utils/packet-serializer.utils.js';

const headerSize = headerConstants.TOTAL_LENGTH + headerConstants.PACKET_TYPE_LENGTH;

const onData = (socket) => async (data) => {
  try {
    socket.buffer = Buffer.concat([socket.buffer, data]);
    while (socket.buffer.length >= headerSize) {
      const { totalLength, packetType } = readHeader(socket.buffer);
      if (totalLength > socket.buffer.length) {
        break;
      }
      const packet = socket.buffer.subarray(headerSize, totalLength);
      socket.buffer = socket.buffer.subarray(totalLength);

      const decodedPacket = deserialize(packetType, packet);

      const handler = getHandlerByPacketType(packetType);
      const result = await handler({ socket, userId: null, packet: decodedPacket });
      if (result) {
        // result가 있다면 추가 작업
      }
    }
  } catch (err) {
    handleError(socket, err);
  }
};

export default onData;
