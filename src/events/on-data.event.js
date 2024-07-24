import { headerConstants, packetTypes } from '../constants/packet.constants.js';
import { getHandlerByPayloadType } from '../handlers/index.js';
import { handleError } from '../utils/error/errorHandler.js';
import { readHeader } from '../utils/packet-header.utils.js';
import { deserialize } from '../utils/packet-serializer.utils.js';

const headerSize = headerConstants.TOTAL_LENGTH + headerConstants.PACKET_TYPE_LENGTH;

const onData = (socket) => async (data) => {
  try {
    console.log('DATA RECEIVED');
    socket.buffer = Buffer.concat([socket.buffer, data]);
    while (socket.buffer.length >= headerSize) {
      const { totalLength, packetType: payloadType } = readHeader(socket.buffer);
      // const { totalLength, payloadType } = readHeader(socket.buffer);
      if (totalLength > socket.buffer.length) {
        break;
      }
      const packet = socket.buffer.subarray(headerSize, totalLength);
      socket.buffer = socket.buffer.subarray(totalLength);

      // switch (packetType) {
      //   case packetTypes.PING: {
      //     //
      //     console.log('PING RECEIVED');
      //     break;
      //   }
      //   case packetTypes.REQUEST: {
      //     console.log('REQUEST RECEIVED');
      //     const { clientVersion, sequence, payloadType, payload } = deserialize(packetType, packet);
      //     console.log(clientVersion, sequence, payloadType, payload);
      //     verifyClientVersion(clientVersion);
      //     verifySequence(sequence);
      //     const handler = getHandlerByPayloadType(payloadType);
      //     const result = await handler({ socket, userId: 'temp', packet: payload });
      //     if (result) {
      //       // result가 있다면 추가 작업
      //     }
      //     break;
      //   }
      // }
      console.log('payloadType: ', payloadType);
      const handler = getHandlerByPayloadType(payloadType);
      await handler({ socket, userId: 'temp', packet });
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
