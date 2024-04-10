import Interactable, { KnownInteractableTypes } from '../Interactable';
export default class EscapeLeaderboard extends Interactable {
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
    return 'escapeLeaderboard';
  }

  private _showInfoBox() {
    const message = 'Escape Room Leaderboard';

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

  //   placeItem(item: Item, playerID: PlayerID): void {
  //     if (
  //       this.townController.getGameAreaController(this).toInteractableAreaModel().type ===
  //       'EscapeRoomArea'
  //     ) {
  //       try {
  //         this.townController.getGameAreaController(this).placeItem(item, playerID);
  //       } catch (error) {
  //         throw Error('Not escape room area');
  //       }
  //     }
  //   }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
