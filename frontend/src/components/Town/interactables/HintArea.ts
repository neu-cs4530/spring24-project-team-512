import Interactable, { KnownInteractableTypes } from '../Interactable';
export default class HintArea extends Interactable {
  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
  }

  getType(): KnownInteractableTypes {
    return 'hintArea';
  }

  displayHint(): number {
    if (this._scene.inRoom1()) {
      return 1;
    }
    if (this._scene.inRoom2()) {
      return 2;
    }
    if (this._scene.inRoom3()) {
      return 3;
    }
    return 0;
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

  //   overlapExit(): void {
  //     this._infoTextBox?.setVisible(false);
  //   }
}
