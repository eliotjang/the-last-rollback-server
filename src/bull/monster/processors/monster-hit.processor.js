import { getDungeonSessionByUserId } from '../../../session/dungeon.session.js';

const MonsterHitProcessor = (job, done) => {
  const { playerId, monsterIdx, damage } = job.data;
  const dungeonSession = getDungeonSessionByUserId(playerId);
  dungeonSession.updatePlayerAttackMonster(playerId, monsterIdx, damage);
  done();
};

export default MonsterHitProcessor;
