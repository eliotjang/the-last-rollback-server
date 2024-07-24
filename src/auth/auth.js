import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { findUserByAccountID } from '../db/user/user.db.js';

export const verifyToken = async (token) => {
  try {
    const accountId = jwt.verify(token, config.account.jwtSecret);

    if (accountId === null || typeof accountId === 'undefined') {
      throw new CustomError(ErrorCodes.MISSING_LOGIN_FIELDS, '로그인 정보 필요');
    }
    const user = await findUserByAccountID(accountId);

    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유효하지 않은 유저');
    }
  } catch (error) {
    switch (error.name) {
      case 'TokenExpiredError':
        throw new CustomError(ErrorCodes.TOKEN_EXPIRED_ERROR, '토큰 만료');
      case 'JsonWebTokenError':
        throw new CustomError(ErrorCodes.JSON_WEB_TOKEN_ERROR, '토큰 조작');
      default:
        throw new CustomError(ErrorCodes.UNUSUAL_REQUEST, '비정상적인 요청');
    }
  }
};
