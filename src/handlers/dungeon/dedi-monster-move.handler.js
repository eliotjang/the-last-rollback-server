import DediClient from '../../classes/sessions/dedi-client.class.js';

const dediMonsterMoveHandler = ({ socket, accountId, packet }) => {
  // TODO: 클라에서 받은 정보를 토대로 DediClient의 setMonsterDest 메서드 호출
  const { monsterIdx, accountId: player, structureIdx } = packet;
  const dungeonSession = getDungeonSessionByUserSocket(socket);
  if (structureIdx) {
    DediClient.getClient(dungeonSession.id).setMonsterDest(monsterIdx);
  }
  DediClient.getClient(dungeonSession.id).setMonsterDest(monsterIdx, player);
};

export default dediMonsterMoveHandler;
