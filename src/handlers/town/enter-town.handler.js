import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { serialize } from '../../utils/packet-serializer.utils.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import StatInfo from '../../protobuf/classes/info/stat-info.proto.js';
import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';
import { playerInfoToObject } from '../../utils/transform-object.utils.js';

const enterTownHandler = async ({ socket, userId, packet }) => {
  try {
    const playerId = Math.floor(Math.random() * 10) + 1;
    const transform = new TransformInfo(0, 0, 0, 0);
    const statInfo = new StatInfo(1, 100);
    const playerInfo = new PlayerInfo(playerId, packet.nickname, packet.class, transform, statInfo);

    // await createUser(userId, nickname, characterClass, transform.posX, transform.posY);

    const plainPlayerInfo = playerInfoToObject(playerInfo);
    const user = { playerInfo: plainPlayerInfo, socket };

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    townSession.addUser(user);

    const response = serialize(packetTypes.S_ENTER, { player: plainPlayerInfo });
    socket.write(response);
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
