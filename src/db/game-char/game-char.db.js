import { toCamelCase } from '../../utils/transform-case.utils.js';
import pools from '../database.js';
import { GAME_CHAR_QUERIES } from './game-char.queries.js';

const TRANSFORM_FIELD = {
  POS_X: 'posX',
  POS_Y: 'posY',
  POS_Z: 'posZ',
  ROT: 'rot',
};

export const gameCharDB = {
  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {string} nickname 캐릭터 닉네임
   * @param {number} charClass 캐릭터 클래스
   * @param {object} transform 캐릭터 좌표
   * @param {boolean} wantResult true 시, playerInfo 객체 반환
   * @returns playerInfo 객체 반환
   */
  addPlayer: async function (accountId, nickname, charClass, transform, wantResult) {
    await pools.GAME_CHAR_DB.query(GAME_CHAR_QUERIES.ADD_GAME_CHAR, [
      accountId,
      nickname,
      charClass,
      JSON.stringify(transform),
    ]);

    if (wantResult) {
      return await this.getGameChar(accountId);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @returns playerInfo 객체 반환
   */
  getGameChar: async function (accountId) {
    const [rows] = await pools.GAME_CHAR_DB.query(GAME_CHAR_QUERIES.GET_GAME_CHAR, [accountId]);

    if (rows[0]) {
      const transform = {};
      for (const key in TRANSFORM_FIELD) {
        transform[TRANSFORM_FIELD[key]] = rows[0].transform[TRANSFORM_FIELD[key]];
      }
      rows[0].transform = transform;
      return toCamelCase(rows[0]);
    }
  },

  /**
   *
   * @param {string} nickname 캐릭터 닉네임
   * @returns playerInfo 객체 반환
   */
  getGameCharByNickname: async function (nickname) {
    const [rows] = await pools.GAME_CHAR_DB.query(GAME_CHAR_QUERIES.GET_GAME_CHAR_BY_NICK_NAME, [
      nickname,
    ]);

    if (rows[0]) {
      const transform = {};
      for (const key in TRANSFORM_FIELD) {
        transform[TRANSFORM_FIELD[key]] = rows[0].transform[TRANSFORM_FIELD[key]];
      }
      rows[0].transform = transform;
      return toCamelCase(rows[0]);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {object} transform 캐릭터 좌표
   * @param {boolean} wantResult true 시, playerInfo 객체 반환
   * @returns playerInfo 객체 반환
   */
  updateTransform: async function (accountId, transform, wantResult) {
    await pools.GAME_CHAR_DB.query(GAME_CHAR_QUERIES.UPDATE_TRANSFORM, [
      JSON.stringify(transform),
      accountId,
    ]);

    if (wantResult) {
      return await this.getGameChar(accountId);
    }
  },

  /**
   *
   * @param {string} accountId 계정 아이디
   * @param {boolean} wantResult true 시, playerInfo 객체 반환
   * @returns playerInfo 객체 반환
   */
  removeGameChar: async function (accountId, wantResult) {
    const result = await this.getGameChar(accountId);
    await pools.GAME_CHAR_DB.query(GAME_CHAR_QUERIES.REMOVE_GAME_CHAR, [accountId]);

    if (wantResult) {
      return result;
    }
  },
};
