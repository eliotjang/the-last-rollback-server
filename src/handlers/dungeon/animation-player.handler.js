const animationPlayerHandler = ({ socket, accountId, packet }) => {
  try {
    const { animCode, monsterIdx } = packet;

    const user = getUserById(accountId);
    const dungeonSession = user.getSession();
    if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
    }

    const data = { animCode, accountId };

    if (monsterIdx) {
      data.monsterIdx = monsterIdx;
    }

    dungeonSession.animationPlayer(data);
  } catch (e) {
    handleError(e);
  }
};

export default animationPlayerHandler;
