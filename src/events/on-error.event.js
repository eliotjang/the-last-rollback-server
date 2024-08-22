import { removeUser } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { handleError } from '../utils/error/errorHandler.js';

const onError = (socket) => async (err) => {
  try {
    console.error('소켓 오류:', err);
    await removeUser(socket);
  } catch (error) {
    handleError(socket, new CustomError(500, `소켓 오류: ${err.message}`));
  }
};

export default onError;
