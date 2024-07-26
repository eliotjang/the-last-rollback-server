import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import StatInfo from '../../protobuf/classes/info/stat-info.proto.js';
import PlayerInfo from '../../protobuf/classes/info/player-info.proto.js';
import { playerInfoToObject } from '../../utils/transform-object.utils.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import { getGameAssets } from '../../init/assets.js';
// import { updateUserInfo } from '../../db/user/user.db.js';

const enterTownHandler = async ({ socket, accountId, packet }) => {
  try {
    const { nickname, charClass } = packet;
    const { charStatInfo } = getGameAssets();

    const charStat = charStatInfo[charClass][0];
    const transform = new TransformInfo(0, 0, 0, 0);

    const playerInfo = new PlayerInfo(accountId, nickname, charClass, transform);

    const plainPlayerInfo = playerInfoToObject(playerInfo);
    const user = { playerInfo: plainPlayerInfo, socket };

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    townSession.addUser(user);

    socket.sendResponse(SuccessCode.Success, '유저 생성 성공', payloadTypes.S_ENTER, {
      player: plainPlayerInfo,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
