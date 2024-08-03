import { verifyToken } from '../auth/auth.js';
import { headerConstants, packetTypes, payloadTypes } from '../constants/packet.constants.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { getHandlerByPayloadType } from '../handlers/index.js';
import { handleError } from '../utils/error/errorHandler.js';
import { readHeader } from '../utils/packet-header.utils.js';
import { deserialize, deserializeByPacketType } from '../utils/packet-serializer.utils.js';
import { config } from '../config/config.js';
import CustomError from '../utils/error/customError.js';

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

      switch (packetType) {
        case packetTypes.PING: {
          //
          // console.log('PING RECEIVED');
          break;
        }
        case packetTypes.REQUEST: {
          // console.log('REQUEST RECEIVED');
          const { clientVersion, sequence, payloadType, payload } = deserializeByPacketType(
            packetType,
            packet,
          );

          // if (payloadType !== payloadTypes.C_SIGN_UP && payloadType !== payloadTypes.C_LOG_IN) {
          //   console.log(socket.token);
          //   await verifyToken(socket.token);
          // }

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
    //handleError(socket, err);
  }
};

const verifyClientVersion = (clientVersion) => {
  if (clientVersion !== config.client.version) {
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      '클라이언트 버전이 일치하지 않습니다.',
    );
  }
};

const verifySequence = (sequence) => {
  // TODO: sequence 검증
};

export default onData;
