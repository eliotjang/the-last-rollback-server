import { payloadTypes } from '../../constants/packet.constants.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../config/config.js';
import lodash from 'lodash';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import { userDB } from '../../db/user/user.db.js';
import enterTownHandler from '../town/enter-town.handler.js';
import { addUser } from '../../session/user.session.js';
import { Player } from '../../classes/models/player.class.js';

const loginAccountHandler = async ({ socket, userId, packet }) => {
  // C_LOG_IN
  try {
    const { accountId, accountPwd } = packet;

    const userInfo = await userDB.getUser(accountId);
    if (!userInfo || !(await bcrypt.compare(accountPwd, userInfo.accountPwd))) {
      socket.sendResponse(
        ErrorCodes.USER_NOT_FOUND,
        '계정을 찾을 수 없습니다.',
        payloadTypes.S_LOG_IN,
      );
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '계정을 찾을 수 없습니다.');
    }

    const jwtOptions = {
      expiresIn: '10h',
    };
    const token = jwt.sign(accountId, config.account.jwtSecret);
    socket.token = token;
    socket.accountId = userInfo.accountId;

    await userDB.updateLogin(accountId);

    const user = await addUser(socket, accountId);

    const playerInfo = await gameCharDB.getGameChar(accountId);
    if (!lodash.isEmpty(playerInfo)) {
      const player = new Player(
        playerInfo.playerId,
        playerInfo.nickname,
        playerInfo.charClass,
        userInfo.userLevel,
        userInfo.userExperience,
      );
      user.player = player;
      enterTownHandler({ socket, accountId });
      return;
    }

    const payload = {
      accountId,
      token,
    };
    socket.sendResponse(SuccessCode.Success, '계정 로그인 성공', payloadTypes.S_LOG_IN, payload);
  } catch (error) {
    handleError(socket, error);
  }
};

export default loginAccountHandler;
