import Dungeon from '../../classes/models/dungeon.class.js';
import { gameAssetConstants } from '../../constants/asset.constants.js';
import dc from '../../constants/game.constants.js';
import { payloadTypes } from '../../constants/packet.constants.js';
import { getGameAssets } from '../../init/assets.js';
import MonsterTransformInfo from '../../protobuf/classes/info/monster-transform-info.proto.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

const monsterData = {};
const stageData = {};

export const initDungeonUtil = async () => {
  Promise.all([initMonsterData(), initStageData()]).then(() => {
    console.log('Finished initializing dungeonUtils.');
  }); // DO NOT CATCH, let the init index file handle it.
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
    });
    Object.freeze(stageData);
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
};

export default dungeonUtils;
