import { verifyToken } from '../auth/auth.js';
import { headerConstants, packetTypes, payloadTypes } from '../constants/packet.constants.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { getHandlerByPayloadType } from '../handlers/index.js';
import { handleError } from '../utils/error/errorHandler.js';
import { readHeader } from '../utils/packet-header.utils.js';
import { deserialize, deserializeByPacketType } from '../utils/packet-serializer.utils.js';

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

      // if (payloadType !== payloadTypes.C_SIGN_UP && payloadType !== payloadTypes.C_LOG_IN) {
      //   console.log(socket.token);
      //   await verifyToken(socket.token);
      // }

      switch (packetType) {
        case packetTypes.PING: {
          //
          console.log('PING RECEIVED');
          break;
        }
        case packetTypes.REQUEST: {
          console.log('REQUEST RECEIVED');
          const { clientVersion, sequence, payloadType, payload } = deserializeByPacketType(
            packetType,
            packet,
          );
          console.log(clientVersion, sequence, payloadType, payload);
          verifyClientVersion(clientVersion);
          verifySequence(sequence);
          const handler = getHandlerByPayloadType(payloadType || 0);
          const result = await handler({ socket, accountId: socket.accountId, packet: payload });
          if (result) {
            // result가 있다면 추가 작업
          }
          break;
        }
      }
    }
  } catch (err) {
    handleError(socket, err);
  }
};

const verifyClientVersion = (clientVersion) => {
  // TODO: 버전 체크
};

const verifySequence = (sequence) => {
  // TODO: sequence 검증
};

export default onData;
