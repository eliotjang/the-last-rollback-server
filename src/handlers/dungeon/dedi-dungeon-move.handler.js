import DediClient from '../../classes/sessions/dedi-client.class.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { getDungeonSessionByUserSocket } from '../../session/dungeon.session.js';
import { getUserById } from '../../session/user.session.js';

const dediDungeonMoveHandler = ({ socket, accountId, packet }) => {
  const user = getUserById(accountId);
  if (user.sessionInfo.type === sessionTypes.TOWN) {
    return;
  }

  if (!packet.transformInfo) {
    const dungeonSession = getDungeonSessionByUserSocket(socket);

    DediClient.getClient(dungeonSession.id).setPlayerDest(accountId);
    return;
  }
  // TODO: 클라에서 받은 정보를 토대로 dedi 서버에 C_SetPlayerDest 패킷 전송
  const { posX: x, posY: y, posZ: z } = packet.transformInfo;

  const dungeonSession = getDungeonSessionByUserSocket(socket);
  DediClient.getClient(dungeonSession.id).setPlayerDest(accountId, { x, y, z });
};

export default dediDungeonMoveHandler;
