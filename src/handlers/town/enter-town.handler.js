import { packetTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { serialize } from '../../utils/packet-serializer.utils.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import StatInfo from '../../protobuf/classes/info/stat-info.proto.js';
import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';

const enterTownHandler = async ({ socket, userId, _ }) => {
  try {
    // userId로 DB에서 유저 찾기
    const userInfo = await findUserByID(userId); // DB에서 조회

    // 없으면 캐릭터 생성 창으로
    // if (!user) {
    //   캐릭터 생성 창으로
    // }

    // 있으면 바로 타운 입장
    const transform = new TransformInfo(userInfo.xCoord, userInfo.yCoord, 0, 0);
    const statInfo = new StatInfo(1, 100);
    const playerInfo = new PlayerInfo(
      userId,
      userInfo.nickname,
      userInfo.characterClass,
      transform,
      statInfo,
    );

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    const user = { playerInfo, socket };
    townSession.addUser(user);

    const sSpawnPacket = serialize(packetTypes.S_SPAWN, {
      payload: playerInfo,
    });
    socket.write(sSpawnPacket);

    townSession.sendPacketToOthers(userId, packetTypes.S_ENTER, playerInfo);
  } catch (e) {
    handleError(socket, e);
  }
};

export default enterTownHandler;
