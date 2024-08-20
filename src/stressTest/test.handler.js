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
import { addUser } from '../session/user.session.js';
import { Player } from '../classes/models/player.class.js';

const testHandler = async ({ socket, userId, packet }) => {
  // TEST
  try {
    const { accountId, accountPwd } = packet;

    const user = await addUser(socket, accountId);

    const player = new Player(accountId, accountId, 1006, 1, 0);
    user.player = player;

    enterTownHandler({ socket, accountId });
    return;
  } catch (error) {
    handleError(socket, error);
  }
};

export default testHandler;
