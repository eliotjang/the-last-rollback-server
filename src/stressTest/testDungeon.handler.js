import { payloadTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes, SuccessCode } from '../utils/error/errorCodes.js';
import { handleError } from '../utils/error/errorHandler.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';
//import lodash, { transform } from 'lodash';
import { gameCharDB } from '../db/game-char/game-char.db.js';
import { userDB } from '../db/user/user.db.js';
import enterTownHandler from '../handlers/town/enter-town.handler.js';
import { addUser, getUserById } from '../session/user.session.js';
import { Player } from '../classes/models/player.class.js';
import { getDungeonSessionByUserSocket } from '../session/dungeon.session.js';

const testDungeonHandler = async ({ socket, userId, packet }) => {
  // TEST
  try {
    const { accountId } = packet;

    const dungeonSession = getDungeonSessionByUserSocket(socket);
    const testUser = getUserById(accountId);
    dungeonSession.addUser(testUser);
    const playerInfos = [];
    const playerStatus = [];

    for (let i = 0; i < dungeonSession.users.length; i++) {
      const user = dungeonSession.users[i];
      const player = new Player(accountId, accountId, 1006, 1, 0);
      user.player = player;

      dungeonSession.addPlayer(user.accountId, user.player);
      const info = dungeonSession.getPlayer(user.accountId).playerInfo;
      const stat = dungeonSession.getPlayer(user.accountId).playerStatus;
      playerInfos.push({ ...info });
      playerStatus.push({
        playerLevel: stat.playerLevel,
        playerName: info.nickname,
        playerFullHp: stat.baseStatInfo.maxHp,
        playerFullMp: stat.baseStatInfo.maxMp,
        playerCurHp: stat.playerHp,
        playerCurMp: stat.playerMp,
        atk: stat.baseStatInfo.atk,
        def: stat.baseStatInfo.def,
        specialAtk: stat.baseStatInfo.specialAtk,
        speed: stat.baseStatInfo.speed,
        attackRange: stat.baseStatInfo.attackRange,
        coolTime: stat.baseStatInfo.coolTime,
      });
    }

    const data = { dungeonInfo, playerInfo: playerInfos, players: playerStatus };
    user.socket.sendResponse(
      SuccessCode.Success,
      '던전에 입장합니다.',
      payloadTypes.S_ENTER_DUNGEON,
      data,
    );
    return;
  } catch (error) {
    handleError(socket, error);
  }
};

export default testDungeonHandler;
