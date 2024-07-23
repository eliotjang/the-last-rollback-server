import { packetTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import loginAccountHandler from './account/login-account.handler.js';
import signupAccountHandler from './account/signup-account.handler.js';

const dummyHandler = () => {};

const handlers = {
  [packetTypes.C_ENTER]: dummyHandler,
  [packetTypes.S_ENTER]: dummyHandler,
  [packetTypes.C_SIGNUP]: signupAccountHandler,
  [packetTypes.C_LOGIN]: loginAccountHandler,
};

export const getHandlerByPacketType = (packetType) => {
  if (!handlers[packetType]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${packetType}`,
    );
  }
  return handlers[packetType];
};
