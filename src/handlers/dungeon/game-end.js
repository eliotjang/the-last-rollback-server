// 전투 핸들러 내부
// . . .
const dungeonSession = getDungeonSessionByUserId(accountId);
const townSession = getTownSessionByUserId(accountId);

// 플레이어 모두 사망 시 Lose
if (PlayerSurvivalStatus.length === 0) {
  // 임시코드
  // playerHp update (S -> C)
  await dungeonSession.updateGameOver(townSession);
}

// 몬스터 모두 사망 시 Win
// 추가 경험치 필요
await dungeonSession.updateGameWin(townSession);
