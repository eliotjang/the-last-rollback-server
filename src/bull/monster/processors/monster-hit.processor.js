import { getDungeonSessionByUserId } from '../../../session/dungeon.session.js';

const MonsterHitProcessor = (job, done) => {
  //
  console.log(job.data); // accountId, monsterIdx, damage
  // 판정
  if (Object.keys(job.data).length === 4) {
    const { accountId, monsterIdx, damage } = job.data;
    const dungeonSession = getDungeonSessionByUserId(accountId);
    dungeonSession.updatePlayerAttackMonster(undefined, monsterIdx, damage);
    done();
    return;
  }
  const { accountId, monsterIdx, damage } = job.data;
  const dungeonSession = getDungeonSessionByUserId(accountId);
  dungeonSession.updatePlayerAttackMonster(accountId, monsterIdx, damage);
  done();
};

export default MonsterHitProcessor;
