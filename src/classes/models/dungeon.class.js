import { payloadTypes } from '../../constants/packet.constants.js';
import { sessionTypes } from '../../constants/session.constants.js';
import { dungeonRedis } from '../../utils/redis/dungeon.redis.js';
import Game from './game.class.js';

const MAX_USERS = 4;

class Dungeon extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.DUNGEON;
  }

  addUser(user) {
    Promise.all(this.users.map((curUser) => curUser.getPlayerInfo())).then((playerInfos) => {
      console.log('this type in dungeon class start');
      console.log('this type in dungeon class : ', this.type);
      console.log('this users in dungeon class : ', this.users);

      super.addUser(user);

      if (playerInfos.length) {
        // console.log('기존 유저 : ', user.accountId, playerInfos);
        super.notifyUser(user.accountId, payloadTypes.S_SPAWN, { players: playerInfos });
        // console.log('현재 들어온 유저에게 다른 모든 유저 정보를 전송:', playerInfos);

        user.getPlayerInfo().then((userInfo) => {
          super.notifyOthers(user.accountId, payloadTypes.S_SPAWN, { players: [userInfo] });
          // console.log('기존 유저에게 새로 들어온 유저 정보를 전송:', userInfo);
        });
      }
    });
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll(payloadTypes.S_DESPAWN, { playerIds: [accountId] });
  }

  async movePlayer(accountId, transform) {
    await dungeonRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }

  moveMonster(accountId, payloadType, payload) {
    super.notifyOthers(accountId, payloadType, payload);
  }
}

export default Dungeon;
