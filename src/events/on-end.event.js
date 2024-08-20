import { removeUser } from '../session/user.session.js';
import { handleError } from '../utils/error/errorHandler.js';

let testUser = 0;

const onEnd = (socket) => async () => {
  try {
    await removeUser(socket);
    console.log(`[${testUser++}] 클라이언트 연결이 종료되었습니다.`);
  } catch (error) {
    handleError(socket, error);
  }
};

export default onEnd;
