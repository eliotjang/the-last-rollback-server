import { payloadTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';

const dummyHandler = () => {};

const handlers = {
  [payloadTypes.C_ENTER]: dummyHandler,
  [payloadTypes.S_ENTER]: dummyHandler,
};

export const getHandlerByPayloadType = (packetType) => {
  if (!handlers[packetType]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${packetType}`,
    );
  }
  return handlers[packetType].handler;
};
