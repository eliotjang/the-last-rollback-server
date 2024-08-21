import DediClient from '../../classes/sessions/dedi-client.class.js';

const dediMonsterMoveHandler = ({ socket, accountId, packet }) => {
  // TODO: 클라에서 받은 정보를 토대로 DediClient의 setMonsterDest 메서드 호출
  const { posX: x, posY: y, posZ: z } = packet.transformInfo;
  const dungeonSession = getDungeonSessionByUserSocket(socket);
  DediClient.getClient(dungeonSession.id).setMonsterDest(accountId, { x, y, z });
};

export default dediMonsterMoveHandler;
