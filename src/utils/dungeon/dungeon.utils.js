import { gameAssetConstants } from '../../constants/asset.constants.js';
import { getGameAssets } from '../../init/assets.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

const monsterData = {};
const stageData = {};

export const initDungeonUtil = async () => {
  let msg = initMonsterData();
  if (msg) {
    throw new CustomError(ErrorCodes.GAME_ASSETS_LOAD_ERROR, `몬스터 데이터 형식 오류: ${err}`);
  }
  msg = initStageData();
  if (msg) {
    throw new CustomError(ErrorCodes.GAME_ASSETS_LOAD_ERROR, `스테이지 데이터 형식 오류: ${err}`);
  }
  console.log('Finished initializing dungeonUtils.');
};

const initMonsterData = () => {
  try {
    getGameAssets()[gameAssetConstants.monsterInfo.NAME].data.forEach((data) => {
      monsterData[data.monsterModel] = {
        ...data,
      };
    });
    Object.freeze(monsterData);
    // console.log(monsterData);
  } catch (err) {
    return err;
  }
};

const initStageData = () => {
  try {
    getGameAssets()[gameAssetConstants.stage.NAME].data.forEach((data) => {
      if (!stageData[data.stage]) {
        stageData[data.stage] = {};
      }
      if (!stageData[data.stage][data.round]) {
        stageData[data.stage][data.round] = {};
      }
      stageData[data.stage][data.round].monsterUnlock = data.monsterUnlock;
      stageData[data.stage][data.round].spawnCount = data.spawnCount;
    });
    Object.freeze(stageData);
  } catch (err) {
    return err;
  }
};

const dungeonUtils = {
  /**
   *
   * @param {number} dungeonCode
   * @param {number} round
   * @returns array of type MonsterStatus
   */
  fetchDungeonInfo: (dungeonCode, round) => {
    const roundData = stageData[dungeonCode][round];

    const monsters = [];
    let index = 0;
    for (let i = 0; i < roundData.monsterUnlock.length; i++) {
      for (let j = 0; j < roundData.spawnCount[i]; j++) {
        monsters.push({
          monsterIdx: index++,
          ...monsterData[roundData.monsterUnlock[i]],
          monsterTransform: {
            // 임시
            posX: 43.5,
            posY: 1.72,
            poxZ: 119.63,
            rot: 0,
          },
        });
      }
    }

    return {
      dungeonCode,
      monsters,
    };
  },
};

export default dungeonUtils;
