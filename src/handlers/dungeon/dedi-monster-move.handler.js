import DediClient from '../../classes/sessions/dedi-client.class.js';

const dediMonsterMoveHandler = ({ socket, accountId, packet }) => {
  //
  //   const { posX: x, posY: y, posZ: z } = packet.transformInfo;
  //   const dungeonSession = getDungeonSessionByUserSocket(socket);
  //   DediClient.getClient(dungeonSession.id).setPlayerDest(accountId, { x, y, z });
};

export default dediMonsterMoveHandler;
