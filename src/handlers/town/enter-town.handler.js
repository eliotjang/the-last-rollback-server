import { payloadTypes } from '../../constants/packet.constants.js';
import { addTownSession, getAllTownSessions } from '../../session/town.session.js';
import CustomError from '../../utils/error/customError.js';
import { handleError } from '../../utils/error/errorHandler.js';
import TransformInfo from '../../protobuf/classes/info/transform-info.proto.js';
import { ErrorCodes, SuccessCode } from '../../utils/error/errorCodes.js';
import { townRedis } from '../../utils/redis/town.redis.js';
import { getUserById } from '../../session/user.session.js';
import { gameCharDB } from '../../db/game-char/game-char.db.js';
import lodash from 'lodash';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { userDB } from '../../db/user/user.db.js';
import { Player } from '../../classes/models/player.class.js';

const enterTownHandler = async ({ socket, accountId, packet }) => {
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
      } else if (charClass < 1001 || charClass > 1005) {
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

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    await townRedis.addPlayer(user.player);
    townSession.addUser(user);

    const data = { ...user.player.playerInfo, accountLevel: user.player.accountLevel };

    socket.sendResponse(SuccessCode.Success, message, payloadTypes.S_ENTER, {
      player: data,
    });
    /*
    const { nickname, charClass } = packet;
    let message;

    const userData = await userDB.getUser(accountId);
    console.log('유저 디비 : ', userDB);

    const dungeonSession = getDungeonSessionByUserId(accountId);
    if (dungeonSession) {
      const user = getUserById(accountId);

      const townSessions = getAllTownSessions();
      let townSession = townSessions.find((townSession) => !townSession.isFull());
      if (!townSession) {
        townSession = addTownSession();
      }

      dungeonSession.removeUser(accountId);
      townSession.addUser(user);

      const transform = new TransformInfo().getTransform();
      const playerEnterInfo = await townRedis.addPlayer(
        accountId,
        nickname,
        charClass,
        transform,
        userData.userLevel,
        true,
      );

      socket.sendResponse(SuccessCode.Success, '타운으로 돌아갑니다.', payloadTypes.S_ENTER, {
        player: playerEnterInfo,
      });
      return;
    }
    
    if (!playerInfo) {
      const isExistPlayerNickname = await gameCharDB.getGameCharByNickname(nickname);
      if (!lodash.isEmpty(isExistPlayerNickname)) {
        socket.sendResponse(
          ErrorCodes.EXISTED_NICKNAME,
          '이미 존재하는 닉네임입니다.',
          payloadTypes.S_ENTER,
        );
        throw new CustomError(ErrorCodes.EXISTED_NICKNAME, '이미 존재하는 닉네임입니다.');
      } else if (charClass < 1001 || charClass > 1005) {
        socket.sendResponse(
          ErrorCodes.INVALID_PACKET,
          '존재하지 않는 캐릭터입니다.',
          payloadTypes.S_ENTER,
        );
        throw new CustomError(ErrorCodes.INVALID_PACKET, '존재하지 않는 캐릭터입니다.');
      }

      const transform = { posX: 0, posY: 1, posZ: 0, rot: 0 }; // 임시, gameCharDB 변경 시 제거

      await gameCharDB.addPlayer(accountId, nickname, charClass, transform);
      console.log('새로운 캐릭터 생성');
      message = '유저 생성 성공';
    } else {
      message = '기존 캐릭터 로드';
    }

    const user = getUserById(accountId);

    const townSessions = getAllTownSessions();
    let townSession = townSessions.find((townSession) => !townSession.isFull());
    if (!townSession) {
      townSession = addTownSession();
    }

    const transform = new TransformInfo().getTransform();
    playerInfo = await townRedis.addPlayer(
      accountId,
      nickname,
      charClass,
      transform,
      userData.userLevel,
      true,
    );
    townSession.addUser(user);

    console.log(userData.userLevel);
    console.log(typeof userData.userLevel);
    // console.log('플레이어 인포', playerInfo);
    socket.sendResponse(SuccessCode.Success, message, payloadTypes.S_ENTER, {
      player: playerInfo,
    });
    // const othersPlayer = await townRedis.getOthersPlayerInfo(accountId);
    // if (!lodash.isEmpty(othersPlayer)) {
    //   socket.sendNotification(payloadTypes.S_SPAWN, { players: othersPlayer });
    // }

    // 기존 유저에게 새로 들어온 유저 정보를 전송 작성 예정

    // Redis에 소켓 저장 후 반환간 데이터가 달라지는 경우로 현재 미사용
    // const townSockets = await socketRedis.getOthersTownSocket(accountId);
    // console.log('townSockets  : ', townSockets.length);
    // if (!lodash.isEmpty(townSockets)) {
    //   const playerInfo = await gameCharDB.getGameChar(accountId);
    //   for (let i = 0; i < townSockets.length; i++) {
    //     const socketObj = townSockets[i];
    //     console.log('socket : ', socket);
    //     sendNotificationSocket(socketObj, payloadTypes.S_SPAWN, { players: [playerInfo] });
    //   }
    // }

    // if (existingSession) {
    //   socket.sendResponse(
    //     ErrorCodes.EXISTED_USER,
    //     '이미 타운 세션에 들어가있는 사용자입니다.',
    //     payloadTypes.S_ENTER,
    //   );
    //   throw new CustomError(ErrorCodes.USER_NOT_FOUND, '이미 타운 세션에 들어가있는 사용자입니다.');
    // }
    */
  } catch (error) {
    handleError(socket, error);
  }
};

export default enterTownHandler;
