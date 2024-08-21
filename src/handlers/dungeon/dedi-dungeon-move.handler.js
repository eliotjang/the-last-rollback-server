import DediClient from '../../classes/sessions/dedi-client.class.js';

const dediDungeonMoveHandler = ({ socket, accountId, packet }) => {
  // TODO: 클라에서 받은 정보를 토대로 dedi 서버에 C_SetPlayerDest 패킷 전송
  const { posX: x, posY: y, posZ: z } = packet.transformInfo;
  const dungeonSession = getDungeonSessionByUserSocket(socket);
  DediClient.getClient(dungeonSession.id).setPlayerDest(accountId, { x, y, z });
};

export default dediDungeonMoveHandler;
