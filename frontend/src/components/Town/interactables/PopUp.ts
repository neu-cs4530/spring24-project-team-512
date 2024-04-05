import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';
export default class PopUpArea extends Interactable {
  private _infoTextBox?: Phaser.GameObjects.Text;

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }

  getType(): KnownInteractableTypes {
    return 'popUp';
  }

  private _showInfoBox() {
    let message = '';
    if (this.name === 'riddle displayer') {
      message =
        'In halls of history, where relics sleep, \n Beneath glass cases, secrets keep. \n Legs of creatures, ancient and grand,  \n In fossils and bones, they silently stand. \n\n Press spacebar for a hint!';
    }
    if (this.name === 'Room3Key') {
      message = 'You found the room 3 key!';
    }
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(this.scene.scale.width / 2, this.scene.scale.height / 2, message, {
          color: '#000000',
          backgroundColor: '#FFFFFF',
        })
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    this._showInfoBox();
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
