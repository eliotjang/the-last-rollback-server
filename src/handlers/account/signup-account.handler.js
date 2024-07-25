import { config } from '../../config/config.js';
import { packetTypes, payloadTypes } from '../../constants/packet.constants.js';
import { createUser, findUserByAccountID } from '../../db/user/user.db.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { serialize } from '../../utils/packet-serializer.utils.js';
import bcrypt from 'bcrypt';

const signupAccountHandler = async ({ socket, userId, packet }) => {
  try {
    const { accountId, accountPwd } = packet;
    // const hashedPwd = await bcrypt.hash(accountPwd, config.account.saltRounds);

    // console.log(hashedPwd);

    let userDB = await findUserByAccountID(accountId);
    if (!userDB) {
      userDB = await createUser(accountId, accountPwd);
    } else {
      socket.sendResponse(
        ErrorCodes.EXISTED_USER,
        '이미 존재하는 계정입니다',
        payloadTypes.S_SIGN_UP,
      );
      // const responsePacket = serialize(packetTypes.S_SIGNUP, {
      //   code: ErrorCodes.EXISTED_USER,
      //   message: '이미 존재하는 계정입니다',
      //   timestamp: Date.now(),
      //   payloadType: packetTypes.S_SIGNUP
      // });
      // socket.write(responsePacket);
      throw new CustomError(ErrorCodes.EXISTED_USER, '이미 존재하는 계정입니다.');
    }
    const payload = {
      accountId,
      accountPwd: accountPwd,
    };
    socket.sendResponse(SuccessCode.Success, '계정 생성 성공', payloadTypes.S_SIGN_UP, payload);
    // const payload = {
    //   code: SuccessCode.Success,
    //   msg: '계정 생성 성공',
    //   accountId,
    //   accountPwd: hashedPwd,
    // };

    // socket.sendPacket(payloadTypes.S_SIGNUP, payload);
  } catch (error) {
    handleError(socket, error);
  }
};

export default signupAccountHandler;
