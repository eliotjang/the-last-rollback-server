import { payloadTypes } from '../../constants/packet.constants.js';
import Game from './game.class.js';
import { serialize } from '../../utils/packet-serializer.utils.js';
import { sessionTypes } from '../../constants/session.constants.js';

const MAX_USERS = 20;

class Town extends Game {
  constructor(id) {
    super(id, MAX_USERS);
    this.type = sessionTypes.TOWN;
  }

  addUser(user) {
    console.log('In townSession', this.users);
    Promise.all(this.users.map((curUser) => curUser.getPlayerInfo())).then((playerInfos) => {
      super.addUser(user);

      if (playerInfos.length) {
        super.notifyUser(user.accountId, payloadTypes.S_SPAWN, { players: playerInfos });
        // console.log('현재 들어온 유저에게 다른 모든 유저 정보를 전송:', playerInfos);

        user.getPlayerInfo().then((userInfo) => {
          super.notifyOthers(user.accountId, payloadTypes.S_SPAWN, { players: [userInfo] });
          // console.log('기존 유저에게 새로 들어온 유저 정보를 전송:', userInfo);
        });
      }
    });

    // const allPlayerInfo = this.users.reduce((data, curUser) => {
    //   // data.push(curUser.getPlayerInfo());
    //   curUser.getPlayerInfo().then((e) => data.push(e));
    //   return data;
    // }, []);

    // this.users.forEach((curUser) => {
    //   const data = allPlayerInfo.filter((playerInfo) => playerInfo.playerId !== curUser.accountId);
    //   if (data.length === 0) {
    //     return;
    //   }

    //   // 현재 들어온 유저에게 다른 모든 유저 정보를 전송
    //   if (curUser === user) {
    //     // user.socket.sendResponse(2, 'tempp', payloadTypes.S_SPAWN, { players: data });
    //     super.notifyUser(user.accountId, 'in', payloadTypes.S_SPAWN, { players: data });
    //     console.log('현재 들어온 유저에게 다른 모든 유저 정보를 전송:', data);
    //   } else {
    //     // 기존 유저에게 새로 들어온 유저 정보를 전송
    //     const userInfo = [user.getPlayerInfo()];
    //     // user.socket.sendResponse(2, 'temp', payloadTypes.S_SPAWN, { players: userInfo });
    //     super.notifyOthers(user.accountId, 'in', payloadTypes.S_SPAWN, { players: userInfo });
    //     console.log('기존 유저에게 새로 들어온 유저 정보를 전송:', userInfo);
    //   }
    // });
  }

  removeUser(accountId) {
    super.removeUser(accountId);

    super.notifyAll(payloadTypes.S_DESPAWN, { playerIds: accountId });
  }

  //
  movePlayer(accountId, transform) {
    // await townRedis.updatePlayerTransform(transform, accountId);

    super.notifyAll(payloadTypes.S_MOVE, { playerId: accountId, transform });
  }
}

export default Town;
