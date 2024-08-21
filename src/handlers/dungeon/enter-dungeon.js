import { payloadTypes } from '../../constants/packet.constants.js';
import { SuccessCode } from '../../utils/error/errorCodes.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';
import { Base } from '../../classes/models/structure.class.js';

export const enterDungeonSession = async (dungeonSession, dungeonCode) => {
  const base = new Base(dungeonCode);
  dungeonSession.addStructure(base);

  const dungeonInfo = dungeonUtils.fetchDungeonInfo(dungeonCode, 1);
  dungeonSession.setMonsters(dungeonCode, dungeonInfo.monsters);

  const players = [];

  for (let i = 0; i < dungeonSession.users.length; i++) {
    const user = dungeonSession.users[i];
    dungeonSession.addPlayer(user.accountId, user.player);
    const player = dungeonSession.getPlayer(user.accountId);
    players.push(player);
  }

  const data = { dungeonInfo, players };

  for (const user of dungeonSession.users) {
    user.socket.sendResponse(
      SuccessCode.Success,
      '던전에 입장합니다.',
      payloadTypes.S_ENTER_DUNGEON,
      data,
    );
  }
};
