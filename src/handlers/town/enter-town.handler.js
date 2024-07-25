import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import StatInfo from '../../protobuf/classes/info/stat-info.proto.js';
import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';
import { playerInfoToObject } from '../../utils/transform-object.utils.js';
// import { updateUserInfo } from '../../db/user/user.db.js';

const enterTownHandler = async ({ socket, accountId, packet }) => {
  try {
    if (packet.class < 10001 || packet.class > 10005) {
      socket.sendResponse(
        ErrorCodes.INVALID_PACKET,
        '존재하지 않는 캐릭터입니다.',
        payloadTypes.S_ENTER,
      );
      throw new CustomError(ErrorCodes.INVALID_PACKET, '존재하지 않는 캐릭터입니다.');
    }

    console.log('accountId: ', accountId);
    const playerId = accountId;
    const transform = new TransformInfo(0, 0, 0, 0);
    const statInfo = new StatInfo(1, 100);
    const playerInfo = new PlayerInfo(playerId, packet.nickname, packet.class, transform, statInfo);

    // await updateUserInfo(nickname, characterClass, accountId);

    const plainPlayerInfo = playerInfoToObject(playerInfo);
    const user = { playerInfo: plainPlayerInfo, socket };

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    const existingSession = townSessions.find((townSession) =>
      townSession.users.some((user) => user.playerInfo.playerId === accountId),
    );
    if (existingSession) {
      socket.sendResponse(
        ErrorCodes.EXISTED_USER,
        '이미 타운 세션에 들어가있는 사용자입니다.',
        payloadTypes.S_ENTER,
      );
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '이미 타운 세션에 들어가있는 사용자입니다.');
    }

    townSession.addUser(user);

    socket.sendResponse(SuccessCode.Success, '타운 입장 완료', payloadTypes.S_ENTER, {
      player: plainPlayerInfo,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
