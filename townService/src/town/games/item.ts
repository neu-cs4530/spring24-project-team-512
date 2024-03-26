class Item {
  private _name: string;

  private _description: string;

  private _tile: string;

  constructor(name: string, description: string, tile: string) {
    this._name = name;
    this._description = description;
    this._tile = tile;
  }

  getName(): string {
    return this._name;
  }

  getDescription(): string {
    return this._description;
  }
}

export default Item;
