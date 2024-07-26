import { config } from '../../config/config.js';
import { packetTypes, payloadTypes } from '../../constants/packet.constants.js';
import { createUser, findUserByAccountID } from '../../db/user/user.db.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import bcrypt from 'bcrypt';

const signupAccountHandler = async ({ socket, userId, packet }) => {
  try {
    const { accountId, accountPwd } = packet;
    const hashedPwd = await bcrypt.hash(accountPwd, config.account.saltRounds);

    let userDB = await findUserByAccountID(accountId);
    if (!userDB) {
      userDB = await createUser(accountId, hashedPwd);
    } else {
      socket.sendResponse(ErrorCodes.EXISTED_USER, '이미 존재하는 계정입니다', payloadTypes.S_SIGN_UP);
      throw new CustomError(ErrorCodes.EXISTED_USER, '이미 존재하는 계정입니다.');
    }

    const payload = {
      accountId,
    };

    socket.sendResponse(SuccessCode.Success, '계정 생성 성공', payloadTypes.S_SIGN_UP, payload);
  } catch (error) {
    handleError(socket, error);
  }
};

export default signupAccountHandler;
