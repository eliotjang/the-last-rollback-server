import { getGameAssets } from '../../init/assets.js';

export class Item {
  constructor(itemModel) {
    const itemInfo = getGameAssets().pickUpItemInfo.itemModels[itemModel];
    this.itemModel = itemModel;
    this.name = itemInfo.itemName;
    this.probability = itemInfo.probability;
  }
}

export class HpPotion extends Item {
  constructor(itemModel) {
    super(itemModel);
    this.hp = getGameAssets().pickUpItemInfo.itemModels[itemModel].hp;
  }
}

export class MpPotion extends Item {
  constructor(itemModel) {
    super(itemModel);
    this.mp = getGameAssets().pickUpItemInfo.itemModels[itemModel].mp;
  }
}

export class MysteryBox extends Item {
  constructor(itemModel) {
    super(itemModel);
  }
}
