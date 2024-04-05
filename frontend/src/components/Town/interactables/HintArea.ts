import Interactable, { KnownInteractableTypes } from '../Interactable';
export default class HintArea extends Interactable {
  addedToScene(): void {
    super.addedToScene();
    this.setTintFill(0, 0, 0, 0);
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
}
