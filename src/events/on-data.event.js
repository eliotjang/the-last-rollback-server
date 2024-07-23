import { verifyToken } from '../auth/auth.js';
import { headerConstants, packetTypes } from '../constants/packet.constants.js';
import { getHandlerByPacketType } from '../handlers/index.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { handleError } from '../utils/error/errorHandler.js';
import { readHeader } from '../utils/packet-header.utils.js';
import { deserialize, serialize } from '../utils/packet-serializer.utils.js';

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
      console.log('packetType, decodedPacket : ', packetType, decodedPacket);

      if (packetType !== packetTypes.C_SIGNUP && packetType !== packetTypes.C_LOGIN) {
        console.log(socket.token);
        const user = await verifyToken(socket.token);
        if (!user) {
          const responsePacket = serialize(packetType, {
            code: ErrorCodes.TOKEN_VERIFY_ERROR,
            msg: '토큰 검증 에러',
          });
          socket.write(responsePacket);
          throw new CustomError(ErrorCodes.EXISTED_USER, '토큰 검증 에러');
        }
      }

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
