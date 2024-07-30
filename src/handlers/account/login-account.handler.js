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
import { addUser, userSocket } from '../../session/user.session.js';

const loginAccountHandler = async ({ socket, userId, packet }) => {
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
      expiresIn: '10h', // 임시
    };
    const token = jwt.sign(accountId, config.account.jwtSecret);
    socket.token = token;
    socket.accountId = userInfo.accountId;

    await userDB.updateLogin(accountId);

    addUser(socket, accountId);

    const playerInfo = await gameCharDB.getGameChar(accountId);
    if (!lodash.isEmpty(playerInfo)) {
      const message = '캐릭터를 생성한 기록이 있습니다. 기존 캐릭터를 로드합니다.';
      const { nickname, charClass } = playerInfo;
      enterTownHandler({ socket, accountId, packet: { nickname, charClass }, message });
      return;
    }

    // 소켓 임시 저장
    // userSocket.addUser(socket, accountId);

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
