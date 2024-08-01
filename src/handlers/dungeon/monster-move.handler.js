import { payloadTypes } from '../../constants/packet.constants.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const monsters = []; // 임시 생성

const monsterMoveHandler = async ({ socket, accountId, packet }) => {
  const { monsterIdx, transform } = packet;
  // console.log(monsterIdx, transform);
  // S_EnterDungeon에서 생성한 스테이지의 monsterIndex인지 확인하는 검증 코드 작성
  // S_EnterDungeon에서 미리 몬스터 세션 생성 필요
  const dungeonSession = getDungeonSessionByUserId(accountId);

  if (!dungeonSession) {
    throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '던전 세션을 찾을 수 없습니다.');
  }

  //const dungeonInfo
  //const stage = dungeonInfo.dungeonCode

  // 몬스터 세션에서 해당 몬스터의 정보를 받아옴

  // const monster = dungeonInfo.MonsterStatus.find((idx) => idx === monsterIdx);

  // if (!monster) {
  //   throw new CustomError(ErrorCodes.MONSTER_NOT_FOUND, '몬스터를 찾을 수 없습니다.');
  // }

  /**
   * 해당 몬스터 정보와 위치를 S_Monster_Move 패킷 통지
   * 호스트를 제외한 battleSession안에 있는 유저에게 전달
   */
  const payloadType = payloadTypes.S_MONSTER_MOVE;
  const payload = {
    monsterIdx,
    transform,
  };
  dungeonSession.moveMonster(accountId, payloadType, payload);
};

export default monsterMoveHandler;
