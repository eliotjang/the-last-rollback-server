import { pickUpitemType } from '../../constants/dungeon.constants.js';
import { getGameAssets } from '../../init/assets.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { dungeonSessions } from '../../session/sessions.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

// monsterKill시 실행
const pickUpHandler = async (accountId) => {
  // 아이템을 획득하였는지 검사
  //const itemId = getItem(); //Json파일에 있는 확률로 아이템을 얻는 함수(얻은 아이템이 어떤 아이템인지 return)
  const dungeonSession = getDungeonSessionByUserId(accountId);
  const pickUpItems = dungeonSession.getPickUpItems();
  const pickUpItem = getItem(dungeonSession);

  const item = pickUpItems.find((data) => data.itemName === pickUpItem);
  console.log('####', item);

  switch (item.itemIdx) {
    // 아이템을 획득했을 때 플레이어 정보를 변경
    case pickUpitemType.HP_POTION:
      break;
    case pickUpitemType.MP_POTION:
      break;
    case pickUpitemType.ITEM_BOX:
      //dungeonSession.addItemBox;
      break;
    default:
      console.log('아이템을 획득하지 못하였습니다.');
      return null;

    //S_PickUp
    //아이템에 따라 변경 된 플레이어 정보를 패킷에 담아 모든 플레이어에게 통지
  }
};

export default pickUpHandler;

function getItem(dungeonSession) {
  const itemNames = dungeonSession.getItemNames();
  const itemProbability = dungeonSession.getItemProbability();

  const randomNumber = Math.floor(Math.random() * 100 + 1);

  let result = '꽝';
  let accumulationNumber = 0;

  for (let i = 0; i < itemNames.length; i++) {
    accumulationNumber += itemProbability[i];
    if (accumulationNumber >= randomNumber) {
      result = itemNames[i];
      break;
    }
  }
  return result;
}
