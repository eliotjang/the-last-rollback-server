import { ErrorCodes } from './errorCodes.js';

export const handleError = (socket, error) => {
  try {
    let responseCode;
    let message;
    if (error.code) {
      responseCode = error.code;
      message = error.message;
      const err = `${error.name}\r\nCode: ${error.code}\r\nMessage: ${error.message}\r\n${error.stack}`;
      console.error(err);
    } else {
      responseCode = ErrorCodes.SOCKET_ERROR;
      message = error.message;
      const err = `${error.name}\r\nMessage: ${error.message}\r\n${error.stack}`;
      console.error(err);
    }
  } catch (err) {
    console.error('Error in errorHandler:', err);
  }
};
