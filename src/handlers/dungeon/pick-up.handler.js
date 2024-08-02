import { pickUpitemType } from '../../constants/dungeon.constants.js';
import { getGameAssets } from '../../init/assets.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

// monsterKill시 실행
const pickUpHandler = async ({ socket, accountId, packet }) => {
  // 아이템을 획득하였는지 검사
  //const itemId = getItem(); //Json파일에 있는 확률로 아이템을 얻는 함수(얻은 아이템이 어떤 아이템인지 return)

  //const dungeonSession = getDungeonSessionByUserId(accountId);
  //dungeonSession.itemPickUp(accountId, itemId);
  if (!itemId) {
    //item을 얻었을 때만 실행 dungeonSession으로 옮길 예정 itempickUp(itemId)
    switch (itemId) {
      // 아이템을 획득했을 때 플레이어 정보를 변경
      case pickUpitemType.HP_POTION:
        break;
      case pickUpitemType.MP_POTION:
        break;
      case pickUpitemType.ITEM_BOX:
        break;
      default:
        return null;
    }

    //S_PickUp
    //아이템에 따라 변경 된 플레이어 정보를 패킷에 담아 모든 플레이어에게 통지
  }
};

export default pickUpHandler;

function getItem() {
  // 확률 계산은 매번 할 필요 없을듯함 (몬스터 정보 저장할 때 같이 저장) pickUpInfo()함수로 따로 뺄 예정
  const pickUpItemInfo = getGameAssets();
  const items = pickUpItemInfo.data.map((item) => ({
    itemIdx: item.itemIdx,
    itemName: item.itemName,
    HP: item.HP,
    MP: item.MP,
    BOX: item.BOX,
    probability: item.probability,
  }));

  const randomNumber = Math.floor(Math.random() * 100 + 1);

  const itemNames = pickUpItemInfo.data.map((item) => item.itemName);
  itemNames.push('꽝');
  const itemProbability = pickUpItemInfo.data.map((item) => item.probability);
  const totalProbability = itemProbability.reduce((sum, cur) => sum + cur, 0);
  const lastProbability = 100 - totalProbability;

  if (totalProbability >= 100) {
    throw new CustomError(ErrorCodes.PROBABILITY_ERROR, '확률의 합이 100이 넘습니다.');
  }

  itemProbability.push(lastProbability);

  let result = '꽝';
  let accumulationNumber = 0;

  for (let i = 0; i < item.length; i++) {
    accumulationNumber += itemProbability[i];
    if (accumulationNumber >= randomNumber) {
      result = item[i];
      break;
    }
  }

  const item = items.find((item) => item.itemName === result);
  return item;
}
