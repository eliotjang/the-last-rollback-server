import { packetTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
//import enterTownHandler from './town/enter-town.handler.js';
import initialHandler from './create-character.handler.js';

const handlers = {
  //[packetTypes.C_입장이벤트]: enterTownHandler,
  [packetTypes.C_ENTER]: initialHandler,
};

export const getHandlerByPacketType = (packetType) => {
  if (!handlers[packetType]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${packetType}`,
    );
  }
  return handlers[packetType].handler;
};
