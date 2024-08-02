import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { getAllTownSessions, addTownSession } from '../../session/town.session.js';

// 전투 핸들러 내부

const dungeonSession = getDungeonSessionByUserId(accountId);
const townSessions = getAllTownSessions();
let townSession = townSessions.find((townSession) => !townSession.isFull());
if (!townSession) {
  townSession = addTownSession();
}

// 플레이어 모두 사망 시 Lose
if (dungeonSession.getPlayerInfo.isEmpty()) {
  await dungeonSession.updateGameOver(townSession);
}

// 마지막 웨이브에서 몬스터 모두 사망 시 Win
if (stage === '3' && dungeonSession.getRoundMonsters.isEmpty()) {
  await dungeonSession.updateGameWin(townSession);
}
