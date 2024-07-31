import { payloadTypes } from '../../constants/packet.constants.js';
import { getTownSessionByUserSocket } from '../../session/town.session.js';
import { getBattleSessionByUserSocket } from '../../session/battle.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getUserById } from '../../session/user.session.js';
//import { updatePosition } from '../../classes/models/user.class.js';

const locationUpdateHandler = ({ socket, userId, packet }) => {
  try {
    const { transform } = packet;
    console.log('transform', transform);
    // const currentSession = getUserById(socket).sessionInfo.type;
    // console.log('######', currentSession);
    let playerSession = getTownSessionByUserSocket(socket);
    // if (currentSession === 1) {
    //   // 1: TOWN
    //   playerSession = getTownSessionByUserSocket(socket);
    // } else if (currentSession === 2) {
    //   // 2: BATTLE
    //   playerSession = getBattleSessionByUserSocket(socket);
    // } else {
    //   throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '잘못된 세션 입니다.');
    // }

    if (!playerSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '현재 세션을 찾을 수 없습니다.');
    }

    const user = playerSession.getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    //user.updatePosition(TransformInfo);
    user.getPlayerInfo().transform = transform;
    const payload = { session: 1, transform };

    playerSession.notifyOthers(user.accountId, payloadTypes.S_MOVE, payload);
  } catch (error) {
    handleError(socket, error);
  }
};

export default locationUpdateHandler;
