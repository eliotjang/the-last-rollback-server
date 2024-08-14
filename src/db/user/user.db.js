import pools from '../database.js';
import { USER_QUERIES } from './user.queries.js';
import { toCamelCase } from '../../utils/transform-case.utils.js';
import { getGameAssets } from '../../init/assets.js';

export const userDB = {
  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {string} accountPwd 계정 비밀번호
   * @param {boolean} wantResult true 시, 계정 생성 결과 반환
   * @returns 계정 객체 반환
   */
  addUser: async function (accountId, accountPwd, wantResult) {
    await pools.USER_DB.query(USER_QUERIES.ADD_USER, [accountId, accountPwd]);

    if (wantResult) {
      return await this.getUser(accountId);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns 계정 객체 반환
   */
  getUser: async function (accountId) {
    const [rows] = await pools.USER_DB.query(USER_QUERIES.GET_USER, [accountId]);
    return toCamelCase(rows[0]);
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   */
  updateLogin: async function (accountId) {
    await pools.USER_DB.query(USER_QUERIES.UPDATE_LOGIN, [accountId]);
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} level 설정 레벨
   * @returns 계정 객체 반환
   */
  updateLevel: async function (accountId, level) {
    await pools.USER_DB.query(USER_QUERIES.UPDATE_LEVEL, [level, accountId]);

    return await this.getUser(accountId);
  },
  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시, 계정 객체 반환
   * @returns 계정 객체 반환
   */
  /*
  updateLevel: async function (accountId, wantResult) {
    const { userInfo } = getGameAssets();
    const user = await this.getUser(accountId);

    if (user.userLevel >= userInfo.data[userInfo.data.length - 1].level) {
      console.log('최대 레벨에 도달했습니다.');
      return;
    }

    await pools.USER_DB.query(USER_QUERIES.UPDATE_LEVEL, [accountId]);

    if (wantResult) {
      return await this.getUser(accountId);
    }
  },
  */

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {number} experience 획득 경험치
   * @param {boolean} wantResult true 시, 계정 객체 반환
   * @returns 계정 객체 반환
   */
  updateExp: async function (accountId, experience) {
    /*
    const { userInfo } = getGameAssets();
    let user = await this.getUser(accountId);

    if (user.userLevel >= userInfo.data[userInfo.data.length - 1].level) {
      console.log('최대 레벨에 도달했습니다.');
      return;
    }

    let targetData = userInfo.data.find((data) => data.level === user.userLevel);
    let currentExperience;
    if (user.userExperience === 0) {
      currentExperience = experience;
    }
    currentExperience = user.userExperience + experience;

    while (currentExperience >= targetData.maxExp) {
      currentExperience -= targetData.maxExp;
      user = await this.updateLevel(accountId, true);

      if (user.userLevel >= userInfo.data[userInfo.data.length - 1].level) {
        console.log('최대 레벨에 도달했습니다.');
        return;
      }
      targetData = userInfo.data.find((data) => data.level === user.userLevel);
    }
    await pools.USER_DB.query(USER_QUERIES.UPDATE_EXP, [currentExperience, accountId]);

    if (wantResult) {
      return await this.getUser(accountId);
    }
    */

    await pools.USER_DB.query(USER_QUERIES.UPDATE_EXP, [experience, accountId]);

    return await this.getUser(accountId);
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시, 계정 객체 반환
   * @returns 계정 객체 반환
   */
  updateStageUnlock: async function (accountId, wantResult) {
    const { stageUnlock } = getGameAssets();
    let user = await this.getUser(accountId);

    if (user.stageUnlock >= stageUnlock.data[stageUnlock.data.length - 1].dungeonCode) {
      console.log('최대 스테이지에 도달했습니다.');
      return;
    }

    await pools.USER_DB.query(USER_QUERIES.UPDATE_STAGE_UNLOCK, [accountId]);

    if (wantResult) {
      return await this.getUser(accountId);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시, 계정 객체 반환
   * @returns 계정 객체 반환
   */
  removeUser: async function (accountId, wantResult) {
    const result = await this.getUser(accountId);
    await pools.USER_DB.query(USER_QUERIES.REMOVE_USER, [accountId]);

    if (wantResult) {
      return result;
    }
  },
};
