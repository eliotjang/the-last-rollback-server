// import { removeUser } from '../session/user.session.js';
import { removeUser } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { handleError } from '../utils/error/errorHandler.js';

const onError = (socket) => async (err) => {
  try {
    console.error('소켓 오류:', err);
    removeUser(socket);

    // await removeUser(socket);

    // const user = getUserBySocket(socket);
    // const gameInstance = getGameSession();
    // gameInstance.removeUser(user.id);
  } catch (error) {
    handleError(socket, new CustomError(500, `소켓 오류: ${err.message}`));
  }
};

export default onError;
