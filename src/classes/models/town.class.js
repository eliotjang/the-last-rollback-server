import { payloadTypes } from '../../constants/packet.constants.js';
import Game from './game.class.js';
import { serialize } from '../../utils/packet-serializer.utils.js';

const MAX_USERS = 20;

class Town extends Game {
  constructor(id) {
    super(id, MAX_USERS);
  }

  addUser(user) {
    super.addUser(user);

    const allPlayerInfo = this.users.reduce((data, curUser) => {
      data.push(curUser.getPlayerInfo());
      return data;
    }, []);

    this.users.forEach((curUser) => {
      const data = allPlayerInfo.filter(
        (playerInfo) => playerInfo.playerId !== curUser.getPlayerInfo().playerId,
      );
      if (data.length === 0) {
        return;
      }

      // 현재 들어온 유저에게 다른 모든 유저 정보를 전송
      if (curUser === user) {
        // user.socket.sendResponse(2, 'tempp', payloadTypes.S_SPAWN, { players: data });
        super.notifyUser(user.accountId, 'in', payloadTypes.S_SPAWN, { players: data });
        console.log('현재 들어온 유저에게 다른 모든 유저 정보를 전송:', data);
      } else {
        // 기존 유저에게 새로 들어온 유저 정보를 전송
        const userInfo = [user.getPlayerInfo()];
        // user.socket.sendResponse(2, 'temp', payloadTypes.S_SPAWN, { players: userInfo });
        super.notifyOthers(user.accountId, 'in', payloadTypes.S_SPAWN, { players: userInfo });
        console.log('기존 유저에게 새로 들어온 유저 정보를 전송:', userInfo);
      }
    });
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll('message', payloadTypes.S_DESPAWN, { playerIds: accountId });
  }
}

export default Town;
