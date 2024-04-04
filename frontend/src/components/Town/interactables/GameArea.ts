import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class GameArea extends Interactable {
  private _isInteracting = false;

  private _renderTexture?: Phaser.GameObjects.RenderTexture;

  addedToScene() {
    super.addedToScene();
    // const gameType = this.townController.getGameAreaController(this).toInteractableAreaModel().type;
    // if (gameType === 'EscapeRoomArea') {
    //   this._renderTexture = this.scene.add.renderTexture(
    //     0,
    //     0,
    //     this.scene.scale.width + 1000,
    //     this.scene.scale.height + 1000,
    //   );
    //   this._renderTexture.setOrigin(0, 0);
    //   this._renderTexture?.setScrollFactor(0, 0);
    // }
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }

  overlapExit(): void {
    // const gameType = this.townController.getGameAreaController(this).toInteractableAreaModel().type;
    // this._renderTexture?.clear();

    if (this.townController.ourPlayer.escapeRoom == true) {
      return;
    }
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  // overlap(): void {
  //   const gameType = this.townController.getGameAreaController(this).toInteractableAreaModel().type;
  //   if (gameType === 'EscapeRoomArea') {
  //     this._renderTexture?.clear();
  //     this._renderTexture?.fill(0x000000);
  //     // if (player.inventory.items.find(item => item.name === 'flashlight') !== undefined) {
  //     if (this._renderTexture) {
  //       this._scene.eraseMask(this._renderTexture);
  //     }
  //     // }
  //   }
  // }

  movePlayer(x1: number, y1: number): void {
    this._scene.moveOurPlayerTo({ x: x1, y: y1 });
  }

  placeTile(tile: number, x1: number, y1: number): void {
    this._scene.map.putTileAt(tile, x1, y1);
  }
  // placeTile(x1: number, y1: number): void {
  //   this._scene.map.putTileAt({ x: x1, y: y1 });
  // }

  // placeItem(item: Item, playerID: PlayerID): void {
  //   if (
  //     this.townController.getGameAreaController(this).toInteractableAreaModel().type ===
  //     'EscapeRoomArea'
  //   ) {
  //     try {
  //       this.townController.getGameAreaController(this).placeItem(item, playerID);
  //     } catch (error) {
  //       throw Error('Not escape room area');
  //     }
  //   }
  // }

  interact(): void {
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'gameArea';
  }
}
