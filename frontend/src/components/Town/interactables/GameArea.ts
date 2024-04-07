import { useInteractableAreaController } from '../../../classes/TownController';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class GameArea extends Interactable {
  private _isInteracting = false;

  private _renderTexture?: Phaser.GameObjects.RenderTexture;

  addedToScene() {
    super.addedToScene();

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
    const gameType = this.townController.getGameAreaController(this).toInteractableAreaModel().type;
    if (gameType === 'EscapeRoomArea') {
      return;
    }
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  movePlayer(x1: number, y1: number): void {
    this._scene.moveOurPlayerTo({ x: x1, y: y1 });
  }

  escapeRoomStart(x1: number, y1: number): void {
    this._scene.escapeRoomStart({ x: x1, y: y1 });
  }

  interact(): void {
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'gameArea';
  }
}
