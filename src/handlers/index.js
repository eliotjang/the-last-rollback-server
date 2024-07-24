import { payloadTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import actionInteractHandler from './game/actionInteract.handler.js';
import locationUpdateHandler from './game/locationUpdate.handler.js';
import enterTownHandler from './town/enter-town.handler.js';

const dummyHandler = () => {};

const handlers = {
  [payloadTypes.C_ENTER]: enterTownHandler,
  [payloadTypes.S_ENTER]: dummyHandler,
  [payloadTypes.C_MOVE]: locationUpdateHandler,
  [payloadTypes.C_ANIMATION]: actionInteractHandler,
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
