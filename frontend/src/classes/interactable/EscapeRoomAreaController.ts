import { EscapeRoomGameState, GameStatus, Item, PlayerID } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

export type EscapeRoomEventTypes = GameEventTypes & {
  gameStart: () => void;
  gameUpdated: () => void;
  gameEnd: () => void;
  playerChange: (newPlayer: PlayerController) => void;
};

export default class EscapeRoomAreaController extends GameAreaController<
  EscapeRoomGameState,
  EscapeRoomEventTypes
> {
  get player1(): PlayerController | undefined {
    const player1 = this._model.game?.state.player1;
    if (player1) {
      return this.occupants.find(eachOccupant => eachOccupant.id === player1);
    }
    return undefined;
  }

  get player2(): PlayerController | undefined {
    const player2 = this._model.game?.state.player2;
    if (player2) {
      return this.occupants.find(eachOccupant => eachOccupant.id === player2);
    }
    return undefined;
  }

  /**
   * Returns true if the game is empty - no players AND no occupants in the area
   *
   */
  isEmpty(): boolean {
    return !this.player1 && !this.player2 && this.occupants.length === 0;
  }

  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  get completed(): boolean | undefined {
    return this.player1?.completed || this.player2?.completed;
  }

  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
  }

  public async singleGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'SingleGame',
    });
  }

  public placeItem(id: PlayerID, item: Item) {
    if (id === this.player1?.id) {
      if (this.player1.id === this._townController.ourPlayer.id) {
        this._townController.ourPlayer.inventory.items.push(item);
        this.emit('inventoryUpdated', this.player1.inventory.items);
      }
      this._model.game?.state.player1Inventory?.items.push(item);
    } else if (id === this.player2?.id) {
      if (this.player2.id === this._townController.ourPlayer.id) {
        this._townController.ourPlayer.inventory.items.push(item);
        this.emit('inventoryUpdated', this.player2.inventory.items);
      }
      this._model.game?.state.player2Inventory?.items.push(item);
    } else {
      throw new Error(PLAYER_NOT_IN_GAME_ERROR);
    }
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  get time(): number {
    return this._model.game?.state.time !== undefined ? this._model.game.state.time : 0;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return !this.isEmpty() || this.status !== 'WAITING_FOR_PLAYERS';
  }
}
