import { pickUpItemType } from '../../constants/dungeon.constants.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';

const DUNGEON_CODE = 1;

const pickUpHandler = async (accountId, round) => {
  const dungeonSession = getDungeonSessionByUserId(accountId);
  const item = dungeonUtils.fetchRandomItem(DUNGEON_CODE, round);

  switch (item.itemModel) {
    case pickUpItemType.HP_POTION:
      dungeonSession.addHpPotion(accountId, item.hp);
      break;
    case pickUpItemType.MP_POTION:
      dungeonSession.addMpPotion(accountId, item.mp);
      break;
    case pickUpItemType.ITEM_BOX:
      dungeonSession.addMysteryBox(accountId, 1);
      break;
    default:
      console.log('아이템 미획득');
  }
};

export default pickUpHandler;
