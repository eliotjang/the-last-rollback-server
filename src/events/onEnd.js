import { handleError } from '../utils/error/errorHandler.js';

export const onEnd = (socket) => async () => {
  try {
    console.log('클라이언트 연결이 종료되었습니다.');
  } catch (error) {
    handleError(socket, error);
  }
};
