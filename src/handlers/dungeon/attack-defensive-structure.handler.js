// import { sessionTypes } from '../../constants/session.constants.js';
// import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';

// const attackDefensiveStructureHandler = ({ socket, accountId, packet }) => {
//   const { monsterIdx, attackType, defenseIdx } = packet;

//   console.log(monsterIdx, attackType, defenseIdx);

//   const dungeonSession = getDungeonSessionByUserId(accountId);
//   if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
//     throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
//   }

//   dungeonSession.attackDefensiveStructure(accountId, monsterIdx, attackType, defenseIdx);
// };

// export default attackDefensiveStructureHandler;
