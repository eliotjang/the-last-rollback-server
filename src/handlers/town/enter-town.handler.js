import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { serialize } from '../../utils/packet-serializer.utils.js';

let playerId = 1;

const enterTownHandler = ({ socket, userId, packet }) => {
  try {
    // const user = getUserById(userId);
    // if (!user) {
    //   throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    // }
    console.log('payload', packet);
    const xScope = 9;
    const zScope = 8;
    const posX = Math.floor(Math.random() * (2 * xScope) - xScope);
    const posZ = Math.floor(Math.random() * (2 * zScope) - zScope);
    const user = {
      socket,
      playerInfo: {
        playerId: playerId++,
        nickname: packet.nickname,
        class: packet.class,
        transform: { posX, posY: 1, posZ, rot: 0 },
        statInfo: {
          level: 1,
          hp: 10,
          maxHp: 20,
          mp: 10,
          maxMp: 15,
          atk: 20,
          def: 20,
          magic: 15,
          speed: 10,
        },
      },
    };

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    townSession.addUser(user);

    const response = serialize(payloadTypes.S_ENTER, { player: user.playerInfo });

    socket.write(response);
    console.log('enterTown', response);
  } catch (e) {
    handleError(socket, e);
  }
};

export default enterTownHandler;
