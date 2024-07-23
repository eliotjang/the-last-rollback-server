import { packetTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import locationUpdateHandler from './game/locationUpdate.handler.js';
import enterTownHandler from './town/enter-town.handler.js';

const dummyHandler = () => {};

const handlers = {
  [packetTypes.C_ENTER]: enterTownHandler,
  [packetTypes.S_ENTER]: dummyHandler,
  [packetTypes.C_MOVE]: dummyHandler,
  [packetTypes.S_MOVE]: locationUpdateHandler,
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
