import Item from './item';
import ItemHolder from './itemholder';
import Inventory from './inventory';

class KeyBox extends ItemHolder {
  private _itemsList: Item[];

  constructor(itemsList: Item[], item: Item) {
    super(item);
    this._itemsList = itemsList;
  }

  unlockBox(inventory: Inventory): Item | null {
    // Check if all items in itemsList are in the inventory
    for (const item of this._itemsList) {
      if (!inventory.hasItem(item.getName())) {
        throw new Error('Player is missing one or more items to unlock this'); // If any item is not in the inventory, return null
      }
    }

    // If all items are in the inventory, remove them
    for (const item of this._itemsList) {
      inventory.removeItem(item.getName());
    }

    // Return the item held by the keybox
    return super.retrieveItem();
  }
}
