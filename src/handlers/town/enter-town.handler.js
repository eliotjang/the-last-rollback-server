import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { handleError } from '../../utils/error/errorHandler.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import { playerInfoToObject } from '../../utils/transform-object.utils.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { gameCharRedis } from '../../utils/redis/game.char.redis.js';
import { getUserById } from '../../session/user.session.js';

const enterTownHandler = async ({ socket, accountId, packet }) => {
  try {
    const { nickname, charClass } = packet;
    const transform = new TransformInfo().getTransform();
    const gameChar = await gameCharRedis.createGameChar(
      nickname,
      charClass,
      transform,
      accountId,
      true,
    );

    if (charClass < 1001 || charClass > 1005) {
      socket.sendResponse(
        ErrorCodes.INVALID_PACKET,
        '존재하지 않는 캐릭터입니다.',
        payloadTypes.S_ENTER,
      );
      throw new CustomError(ErrorCodes.INVALID_PACKET, '존재하지 않는 캐릭터입니다.');
    }
    gameChar.charClass = +gameChar.charClass;
    // const plainPlayerInfo = playerInfoToObject(playerInfo);
    // const user = { playerInfo: gameChar, socket };
    const user = getUserById(accountId);

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    townSession.addUser(user);
    // if (existingSession) {
    //   socket.sendResponse(
    //     ErrorCodes.EXISTED_USER,
    //     '이미 타운 세션에 들어가있는 사용자입니다.',
    //     payloadTypes.S_ENTER,
    //   );
    //   throw new CustomError(ErrorCodes.USER_NOT_FOUND, '이미 타운 세션에 들어가있는 사용자입니다.');
    // }

    socket.sendResponse(SuccessCode.Success, '유저 생성 성공', payloadTypes.S_ENTER, {
      player: gameChar,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
