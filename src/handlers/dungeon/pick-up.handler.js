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

  const foundItem = pickUpItems.find((data) => data.itemName === pickUpItem);
  const item = foundItem ? foundItem.itemIdx : undefined;

  console.log(item);

  switch (item) {
    // 아이템을 획득했을 때 플레이어 정보를 변경
    case pickUpitemType.HP_POTION:
      dungeonSession.recoveredHp(accountId, item.HP);
      return;
    case pickUpitemType.MP_POTION:
      dungeonSession.recoveredMp(accountId, item.MP);
      return;
    case pickUpitemType.ITEM_BOX:
      dungeonSession.addItemBox(accountId, item.BOX, false);
      return;
    default:
      console.log('아이템을 획득하지 못하였습니다.');
      return null;
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
