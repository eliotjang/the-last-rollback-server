// import { sessionTypes } from '../../constants/session.constants.js';
// import { getGameAssets } from '../../init/assets.js';
// import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
// import { ErrorCodes } from '../../utils/error/errorCodes.js';

// let defenseIdx = 0;

// const defensiveStructureHandler = ({ socket, accountId, packet }) => {
//   const { defenseModel } = packet;
//   const { defensiveStructure } = getGameAssets();

//   const data = defensiveStructure.data.find((element) => element.defenseModel === defenseModel);

//   const dungeonSession = getDungeonSessionByUserId(accountId);
//   if (!dungeonSession || dungeonSession.type !== sessionTypes.DUNGEON) {
//     throw new CustomError(ErrorCodes.GAME_NOT_FOUND, 'Dungeon Session을 찾을 수 없습니다.');
//   }

//   dungeonSession.buyDefenseStructure(accountId, data, defenseIdx++);
// };

// export default defensiveStructureHandler;
