import { Inventory, Item } from '../../types/CoveyTownSocket';

export default class InventoryImpl {
  private _items: Inventory;

  private _capacity: number;

  constructor(capacity: number) {
    this._capacity = capacity;
    this._items = { capacity, length: 0, items: [] };
  }

  addItem(item: Item): void {
    if (this._items.length < this._capacity) {
      this._items.items.push(item);
      // console.log(`${item.getName()} added to inventory.`);
    } else {
      throw Error('Inventory is full. Cannot add item.');
    }
  }

  removeItem(itemName: string): void {
    const index = this._items.items.findIndex(item => item.name === itemName);
    if (index !== -1) {
      const removedItem = this._items.items.splice(index, 1)[0];
      // console.log(`${removedItem.getName()} removed from inventory.`);
    } else {
      throw Error(`Item '${itemName}' not found in inventory.`);
    }
  }

  hasItem(itemName: string): boolean {
    return this._items.items.some(item => item.name === itemName);
  }
}
