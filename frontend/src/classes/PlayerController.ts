import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Player as PlayerModel, PlayerLocation, Inventory, Item } from '../types/CoveyTownSocket';
export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
  inventoryUpdated: (newInventory: Inventory) => void;
  escapeRoomStatus: (inRoom: boolean) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  private _inEscapeRoom: boolean;

  private _inventory: Inventory;

  public gameObjects?: PlayerGameObjects;

  private _completed: boolean;

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
    this._inventory = { capacity: 10, length: 0, items: [] };
    this._inEscapeRoom = false;
    this._completed = false;
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
  }

  get location(): PlayerLocation {
    return this._location;
  }

  get escapeRoom(): boolean {
    return this._inEscapeRoom;
  }

  set escapeRoom(inRoom: boolean) {
    this._inEscapeRoom = inRoom;
  }

  get completed(): boolean {
    return this._completed;
  }

  set completed(status: boolean) {
    this._completed = status;
  }

  get inventory(): Inventory {
    return this._inventory;
  }

  set inventory(inventory: Inventory) {
    this._inventory = inventory;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            sprite.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            sprite.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            sprite.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(175);
      } else {
        sprite.body.setVelocity(0, 0);
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
      }
      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  public placeItem(item: Item): void {
    if (this._inventory.items.find(itemi => itemi.name == item.name) === undefined) {
      this._inventory.length += 1;
      this._inventory = {
        items: [...this._inventory.items, item],
        length: (this._inventory.length += 1),
        capacity: 10,
      };
      this.emit('inventoryUpdated', this.inventory);
    }
  }

  // updateInventory() {
  //   const gameController = useInteractableAreaController<EscapeRoomAreaController>('Escape Room 1');
  // }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}
