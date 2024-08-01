import { pickUpitemType } from '../../constants/dungeon.constants.js';

const pickUpHandler = async ({ socket, accountId, packet }) => {
  // packet == C_DungeonMatch
  const { itemId } = packet;
  switch (itemId) {
    case pickUpitemType.HP_POTION:
      return;
    case pickUpitemType.MP_POTION:
      return;
    case pickUpitemType.MP_POTION:
      return;
    default:
      return null;
  }
};

export default pickUpHandler;
