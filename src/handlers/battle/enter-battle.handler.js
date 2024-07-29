import { packetTypes } from '../../constants/packet.constants.js';
import { addBattleSession } from '../../session/battle.session.js';
import { getTownSessionByUserSocket } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { serialize, serializeEx } from '../../utils/packet-serializer.utils.js';

const enterBattleHandler = ({ socket, userId, payload }) => {
  try {
    const { dungeonCode } = payload;

    const user = getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const townSession = getTownSessionByUserSocket(socket);
    if (!townSession) {
      //   throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Town 세션을 찾을 수 없습니다.');
    } else {
      townSession.removeUser(userId);
    }

    const battleSession = addBattleSession();
    battleSession.addUser(user);

    // const response = serializeEx(packetTypes.S_ENTER_DUNGEON, {
    //   payload: {
    //     dungeonInfo,
    //     player,
    //     screenText,
    //     battleLog,
    //   },
    // });

    // socket.write(response);
  } catch (e) {
    handleError(socket, e);
  }
};

export default enterBattleHandler;
