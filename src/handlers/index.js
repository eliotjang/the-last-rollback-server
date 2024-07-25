import { payloadTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import locationUpdateHandler from './game/locationUpdate.handler.js';
import enterTownHandler from './town/enter-town.handler.js';
import loginAccountHandler from './account/login-account.handler.js';
import signupAccountHandler from './account/signup-account.handler.js';
import chattingHandler from './game/chatting.handler.js';

const handlers = {
  [payloadTypes.C_ENTER]: enterTownHandler,
  [payloadTypes.C_SIGNUP]: signupAccountHandler,
  [payloadTypes.C_LOGIN]: loginAccountHandler,
  [payloadTypes.C_MOVE]: locationUpdateHandler,
  [payloadTypes.C_CHAT]: chattingHandler,
};

export const getHandlerByPayloadType = (packetType) => {
  if (!handlers[packetType]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${packetType}`,
    );
  }
  return handlers[packetType];
};
