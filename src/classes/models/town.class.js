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
      data.push(curUser.playerInfo);
      return data;
    }, []);

    this.users.forEach((curUser) => {
      const data = allPlayerInfo.filter(
        (playerInfo) => playerInfo.playerId !== curUser.playerInfo.playerId,
      );
      if (data.length === 0) {
        return;
      }

      // 현재 들어온 유저에게 다른 모든 유저 정보를 전송
      if (curUser === user) {
        // const response = serialize(packetTypes.S_SPAWN, {
        //   players: data,
        // });
        // user.socket.write(response);
        user.socket.sendResponse(0, 'temp', payloadTypes.S_SPAWN, { players: data });
        console.log('현재 들어온 유저에게 다른 모든 유저 정보를 전송:', data);
      } else {
        // 기존 유저에게 새로 들어온 유저 정보를 전송
        // this.sendPacketToOthers(curUser.playerInfo.playerId, packetTypes.S_ENTER, {
        //   player: user.playerInfo,
        // });
        const userInfo = [user.playerInfo];
        user.socket.sendResponse(0, 'temp', payloadTypes.S_SPAWN, { players: userInfo });
        console.log('기존 유저에게 새로 들어온 유저 정보를 전송:', userInfo);
      }
    });
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    this.sendPacketToAll(packetTypes.S_DESPAWN, { playerIds: accountId });
  }
}

export default Town;
