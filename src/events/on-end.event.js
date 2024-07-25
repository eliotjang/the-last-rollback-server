import { removeUser } from '../session/user.session.js';
import { handleError } from '../utils/error/errorHandler.js';

const onEnd = (socket) => async () => {
  try {
    removeUser(socket);
    console.log('클라이언트 연결이 종료되었습니다.');
  } catch (error) {
    handleError(socket, error);
  }
};

export default onEnd;
