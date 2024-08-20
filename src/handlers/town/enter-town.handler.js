import { payloadTypes } from '../../constants/packet.constants.js';
import CustomError from '../../utils/error/customError.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { townRedis } from '../../utils/redis/town.redis.js';
import { getUserById, getUserBySocket } from '../../session/user.session.js';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import lodash from 'lodash';
import { Player } from '../../classes/models/player.class.js';
import { enqueueEnterTownJob } from '../../bull/player/enter-town.js';

const enterTownHandler = async ({ socket, accountId, packet }) => {
  // C_ENTER
  try {
    let message;

    const user = getUserById(accountId);

    if (!user.player) {
      const { nickname, charClass } = packet;
      const isExistPlayerNickname = await gameCharDB.getGameCharByNickname(nickname);
      if (!lodash.isEmpty(isExistPlayerNickname)) {
        socket.sendResponse(
          ErrorCodes.EXISTED_NICKNAME,
          '이미 존재하는 닉네임입니다.',
          payloadTypes.S_ENTER,
        );
        throw new CustomError(ErrorCodes.EXISTED_NICKNAME, '이미 존재하는 닉네임입니다.');
      } else if (charClass < 1001 || charClass > 1006) {
        socket.sendResponse(
          ErrorCodes.INVALID_PACKET,
          '존재하지 않는 캐릭터입니다.',
          payloadTypes.S_ENTER,
        );
        throw new CustomError(ErrorCodes.INVALID_PACKET, '존재하지 않는 캐릭터입니다.');
      }

      const transform = { posX: 0, posY: 1, posZ: 0, rot: 0 }; // 임시, gameCharDB 변경 시 제거

      await gameCharDB.addPlayer(accountId, nickname, charClass, transform);
      const player = new Player(accountId, nickname, charClass);
      user.player = player;
      console.log('새로운 캐릭터 생성');
      message = '유저 생성 성공';
    } else {
      message = '기존 캐릭터 로드';
    }

    user.player.playerInfo.transform.setTownSpawn();
    await townRedis.addPlayer(user.player);

    enqueueEnterTownJob({ accountId });

    const data = { ...user.player.playerInfo, accountLevel: user.player.accountLevel };

    socket.sendResponse(SuccessCode.Success, message, payloadTypes.S_ENTER, {
      player: data,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
