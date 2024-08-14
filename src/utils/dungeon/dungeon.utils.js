import Dungeon from '../../classes/sessions/dungeon.class.js';
import { gameAssetConstants } from '../../constants/asset.constants.js';
import dc from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { getGameAssets } from '../../init/assets.js';
import MonsterTransformInfo from '../../protobuf/classes/info/monster-transform-info.proto.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

const monsterData = {};
const stageData = {};
const itemData = {};
const mysteryBoxData = {};

export const initDungeonUtil = async () => {
  Promise.all([initMonsterData(), initStageData(), initItemData(), initMysteryBoxData()]).then(
    () => {
      console.log('Finished initializing dungeonUtils.');
    },
  ); // DO NOT CATCH, let the init index file handle it.
};

const initMonsterData = async () => {
  try {
    getGameAssets()[gameAssetConstants.monsterInfo.NAME].data.forEach((data) => {
      monsterData[data.monsterModel] = {
        ...data,
      };
    });
    Object.freeze(monsterData);
    // console.log(monsterData);
  } catch (err) {
    throw new CustomError(ErrorCodes.GAME_ASSETS_LOAD_ERROR, `Failed to load monster data: ${err}`);
  }
};

const initStageData = async () => {
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
      stageData[data.stage][data.round].itemUnlock = data.itemUnlock;

      getGameAssets()[gameAssetConstants.pickUpItemInfo.NAME].data.forEach((data1) => {
        stageData[data.stage][data.round].totalWeight += data1.weight;
      });
    });
    Object.freeze(stageData);
  } catch (err) {
    throw new CustomError(ErrorCodes.GAME_ASSETS_LOAD_ERROR, `Failed to load stage data: ${err}`);
  }
};

const initItemData = async () => {
  try {
    getGameAssets()[gameAssetConstants.pickUpItemInfo.NAME].data.forEach((data) => {
      itemData[data.itemModel] = {
        ...data,
      };
    });
    Object.freeze(itemData);
  } catch (err) {
    throw new CustomError(ErrorCodes.GAME_ASSETS_LOAD_ERROR, `Failed to load stage data: ${err}`);
  }
};

const initMysteryBoxData = async () => {
  try {
    getGameAssets()[gameAssetConstants.mysteryBoxInfo.NAME].data.forEach((data) => {
      mysteryBoxData[data.id] = {
        ...data,
      };
    });
  } catch (err) {
    throw new CustomError(ErrorCodes.GAME_ASSETS_LOAD_ERROR, `Failed to load stage data: ${err}`);
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
    if (roundData === null || typeof roundData === 'undefined') {
      // 마지막 라운드
      return null;
    }

    const monsters = [];
    let index = 0;
    for (let i = 0; i < roundData.monsterUnlock.length; i++) {
      for (let j = 0; j < roundData.spawnCount[i]; j++) {
        const monsterTransform = new MonsterTransformInfo(dungeonCode);
        monsters.push({
          monsterIdx: index++,
          ...monsterData[roundData.monsterUnlock[i]],
          monsterTransform: monsterTransform.getTransform(),
        });
      }
    }

    return {
      dungeonCode,
      monsters,
    };
  },

  fetchRandomItem: (dungeonCode, round) => {
    const roundData = stageData[dungeonCode][round];
    if (roundData === null || typeof roundData === 'undefined') {
      return null;
    }

    const random = Math.random();
    let result = null;
    let sum = 0;
    for (let i = 0; i < roundData.itemUnlock.length; i++) {
      const percentage = itemData[roundData.itemUnlock[i]].weight / roundData.totalWeight;
      sum += percentage;
      if (sum >= random) {
        result = itemData[roundData.itemUnlock[i]];
        break;
      }
    }
    return result;
  },

  openMysteryBox: (boxCount) => {
    let result = [];
    let totalWeight = mysteryBoxData.reduce((acc, cur) => acc + cur.weight, 0);
    let sum = 0;
    for (let i = 0; i < boxCount; i++) {
      for (const key in mysteryBoxData) {
        const random = Math.random();
        const percentage = mysteryBoxData[key].weight / totalWeight;
        sum += percentage;
        if (sum >= random) {
          result.push(mysteryBoxData[key].gold);
          break;
        }
      }
    }
    return result;
  },
};

export default dungeonUtils;
