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

  hasItem(itemName: string): boolean {
    return this._items.items.some(item => item.name === itemName);
  }
}
