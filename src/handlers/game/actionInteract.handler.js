const actionInteractHandler = ({ socket, userId, packet }) => {
  try {
    const { animCode } = packet;
    const townSession = getTownSessionByUserSocket(socket);

    if (!townSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '타운 세션을 찾을 수 없습니다.');
    }

    const user = townSession.getUserBySocket(socket);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    //user.updatePosition(TransformInfo);
    user.playerInfo.transform = transform;
    const data = { playerId: user.playerInfo.playerId, animCode };

    //const TransformInfos = townSession.getAllLocation(user.playerInfo.playerId);

    townSession.sendPacketToAll(packetTypes.S_Animation, data);
  } catch (error) {
    handleError(socket, error);
  }
};

export default actionInteractHandler;
