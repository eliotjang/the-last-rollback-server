const animationMonsterHandler = ({ socket, accountId, packet }) => {
  try {
    const { animCode, monsterIdx } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    // 거리 검증
    // verifyDistance();
    // const playerInfo = dungeonSession.getPlayerInfo(accountId);

    dungeonSession.attackMonster(animCode, monsterIdx);
  } catch (e) {
    handleError(e);
  }
};

export default animationMonsterHandler;
