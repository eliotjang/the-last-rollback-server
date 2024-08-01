import { gameCharDB } from '../db/game-char/game-char.db.js';
import TransformInfo from '../protobuf/classes/info/transform-info.proto.js';
import { removeUser } from '../session/user.session.js';
import { handleError } from '../utils/error/errorHandler.js';
import { socketRedis } from '../utils/redis/socket.redis.js';
import { townRedis } from '../utils/redis/town.redis.js';

const onEnd = (socket) => async () => {
  try {
    await removeUser(socket);
    // const player = await townRedis.removePlayer(socket.accountId, true);
    // await gameCharDB.updateTransform(socket.accountId, player.transform, true);
    // await socketRedis.removeTownSocket(socket.accountId);

    console.log('클라이언트 연결이 종료되었습니다.');
  } catch (error) {
    handleError(socket, error);
  }
};

export default onEnd;
