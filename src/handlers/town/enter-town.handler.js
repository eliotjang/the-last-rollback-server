import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import StatInfo from '../../protobuf/classes/info/stat-info.proto.js';
import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';
import { playerInfoToObject } from '../../utils/transform-object.utils.js';
// import { updateUserInfo } from '../../db/user/user.db.js';

const enterTownHandler = async ({ socket, accountId, packet }) => {
  try {
    console.log('accountId: ', accountId);
    const playerId = Math.floor(Math.random() * 10) + 1;
    const transform = new TransformInfo(0, 0, 0, 0);
    const statInfo = new StatInfo(1, 100);
    const playerInfo = new PlayerInfo(playerId, packet.nickname, packet.class, transform, statInfo);

    //await updateUserInfo(nickname, characterClass, accountId);

    const plainPlayerInfo = playerInfoToObject(playerInfo);
    const user = { playerInfo: plainPlayerInfo, socket };

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    townSession.addUser(user);

    // const response = serialize(packetTypes.S_ENTER, { player: plainPlayerInfo });
    // socket.write(response);

    socket.sendResponse(1, 'temp', payloadTypes.S_ENTER, { player: plainPlayerInfo });
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
