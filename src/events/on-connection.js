import onEnd from './on-end.event.js';
import onError from './on-error.event.js';
import onData from './on-data.event.js';

const onConnection = (socket) => {
  console.log('클라이언트가 연결되었습니다:', socket.remoteAddress, socket.remotePort);

  socket.buffer = Buffer.alloc(0);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};

export default onConnection;
