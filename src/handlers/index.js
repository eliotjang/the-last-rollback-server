import { payloadTypes } from '../constants/packet.constants.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import locationUpdateHandler from './game/locationUpdate.handler.js';
import enterTownHandler from './town/enter-town.handler.js';
import loginAccountHandler from './account/login-account.handler.js';
import signupAccountHandler from './account/signup-account.handler.js';
import monsterMoveHandler from './dungeon/monster-move.handler.js';
import dungeonMatchHandler from './dungeon/dungeon-match.handler.js';
import chattingHandler from './game/chatting.handler.js';
import dayRoundReadyHandler from './dungeon/day-round-ready.handler.js';
import attackMonsterHandler from './dungeon/attack-monster.handler.js';
import attackedMonsterHandler from './dungeon/attacked-monster.handler.js';
import attackPlayerHandler from './dungeon/attack-player.handler.js';
import animationMonsterHandler from './dungeon/animation-monster.handler.js';
import animationPlayerHandler from './dungeon/animation-player.handler.js';
import sceneReadyHandler from './dungeon/scene-ready.handler.js';
import towerHpUpdateHandler from './dungeon/tower.handler.js';
// import defensiveStructureHandler from './dungeon/defensive-structure.handler.js';
// import attackDefensiveStructureHandler from './dungeon/attack-defensive-structure.handler.js';
import structureHandler from './dungeon/structure.handler.js';
import structureAttackedMonsterHandler from './dungeon/structure-attacked.handler.js';
import animationStructureHandler from './dungeon/animation-structure.handler.js';

const handlers = {
  [payloadTypes.C_ENTER]: enterTownHandler,
  [payloadTypes.C_SIGN_UP]: signupAccountHandler,
  [payloadTypes.C_LOG_IN]: loginAccountHandler,
  [payloadTypes.C_MOVE]: locationUpdateHandler,
  [payloadTypes.C_MONSTER_MOVE]: monsterMoveHandler,
  [payloadTypes.C_DUNGEON_MATCH]: dungeonMatchHandler,
  [payloadTypes.C_CHAT]: chattingHandler,
  [payloadTypes.C_DAY_ROUND_READY]: dayRoundReadyHandler,
  [payloadTypes.C_PLAYER_ATTACK]: attackMonsterHandler,
  [payloadTypes.C_MONSTER_ATTACKED]: attackedMonsterHandler,
  [payloadTypes.C_MONSTER_ATTACK]: attackPlayerHandler,
  [payloadTypes.C_ANIMATION_MONSTER]: animationMonsterHandler,
  [payloadTypes.C_ANIMATION_PLAYER]: animationPlayerHandler,
  [payloadTypes.C_DUNGEON_SCENE_READY]: sceneReadyHandler,
  [payloadTypes.C_TOWER_ATTACKED]: towerHpUpdateHandler,
  // [payloadTypes.C_DEFENSIVE_STRUCTURE]: defensiveStructureHandler,
  // [payloadTypes.C_ATTACK_DEFENSIVE_STRUCTURE]: attackDefensiveStructureHandler,
  [payloadTypes.C_STRUCTURE]: structureHandler,
  [payloadTypes.C_STRUCTURE_ATTACKED]: structureAttackedMonsterHandler,
  [payloadTypes.C_ANIMATION_STRUCTURE]: animationStructureHandler,
};

export const getHandlerByPayloadType = (payloadType) => {
  if (!handlers[payloadType]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${payloadType}`,
    );
  }
  return handlers[payloadType];
};
