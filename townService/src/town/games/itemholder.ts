import Item from './item'; // Assuming Item class is exported from item.ts

export default class ItemHolder {
  private _item: Item | null;

  private _hasBeenOpened = false;

  constructor(item: Item | null = null) {
    this._item = item;
  }

  setItem(item: Item): void {
    this._item = item;
  }

  getItem(): Item | null {
    return this._item;
  }

  getHasBeenOpened(): boolean {
    return this._hasBeenOpened;
  }

  retrieveItem(): Item | null {
    if (this._hasBeenOpened) {
      throw Error('Lockbox has already been opened.');
    } else {
      this._hasBeenOpened = true;
      return this._item;
    }
  }
}
