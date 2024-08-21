import { pickUpItemType } from '../../constants/game.constants.js';
import { getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import dungeonUtils from '../../utils/dungeon/dungeon.utils.js';

const pickUpHandler = async (accountId, dungeonCode, round) => {
  const dungeonSession = getDungeonSessionByUserId(accountId);
  const item = dungeonUtils.fetchRandomItem(dungeonCode, round);

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
  }
};

export default pickUpHandler;
