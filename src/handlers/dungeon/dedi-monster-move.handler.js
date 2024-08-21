import DediClient from '../../classes/sessions/dedi-client.class.js';

const dediMonsterMoveHandler = ({ socket, accountId, packet }) => {
  // TODO: 클라에서 받은 정보를 토대로 DediClient의 setMonsterDest 메서드 호출
  const { monsterIdx, accountId: player, structureIdx } = packet;
  const dungeonSession = getDungeonSessionByUserSocket(socket);

  let target;

  if (structureIdx) {
    target = { targetStructure: { structureIdx } };
  } else if (player) {
    target = { targetPlayer: { accountId: player } };
  }

  DediClient.getClient(dungeonSession.id).setMonsterDest(monsterIdx, target);
};

export default dediMonsterMoveHandler;
