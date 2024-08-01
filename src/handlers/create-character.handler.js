// import { packetTypes } from '../constants/packet.constants.js';
// import { serialize } from '../utils/packet-serializer.utils.js';
// import TransformInfo from '../protobuf/classes/info/transform-info.proto.js';
// import StatInfo from '../protobuf/classes/info/stat-info.proto.js';
// import PlayerInfo from '../protobuf/classes/info/player-info.proto.js';
// import { addTownSession, getAllTownSessions } from '../session/town.session.js';
// import { handleError } from '../utils/error/errorHandler.js';

// const initialHandler = async ({ socket, userId, packet }) => {
//   try {
//     const { nickname, characterClass } = packet;

//     const transform = new TransformInfo(0, 0, 0, 0);
//     const statInfo = new StatInfo(1, 100);
//     const playerInfo = new PlayerInfo(userId, nickname, characterClass, transform, statInfo);

//     await addUser(userId, nickname, characterClass, transform.posX, transform.posY);

//     const user = { playerInfo, socket };

//     const townSessions = getAllTownSessions();
//     let townSession = townSessions.find((townSession) => !townSession.isFull());
//     if (!townSession) {
//       townSession = addTownSession();
//     }

//     townSession.addUser(user);

//     const sSpawnPacket = serialize(packetTypes.S_SPAWN, playerInfo);
//     socket.write(sSpawnPacket);

//     townSession.sendPacketToOthers(userId, packetTypes.S_ENTER, playerInfo);
//   } catch (error) {
//     handleError(socket, error);
//   }
// };

// export default initialHandler;
