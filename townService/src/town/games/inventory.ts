import Item from './item'; // Assuming Item class is exported from item.ts

export default class Inventory {
  private _items: Item[];

  private _capacity: number;

  constructor(capacity: number) {
    this._capacity = capacity;
    this._items = [];
  }

  addItem(item: Item): void {
    if (this._items.length < this._capacity) {
      this._items.push(item);
      // console.log(`${item.getName()} added to inventory.`);
    } else {
      throw Error('Inventory is full. Cannot add item.');
    }
  }

  removeItem(itemName: string): void {
    const index = this._items.findIndex(item => item.getName() === itemName);
    if (index !== -1) {
      const removedItem = this._items.splice(index, 1)[0];
      // console.log(`${removedItem.getName()} removed from inventory.`);
    } else {
      throw Error(`Item '${itemName}' not found in inventory.`);
    }
  }

  hasItem(itemName: string): boolean {
    return this._items.some(item => item.getName() === itemName);
  }
}
