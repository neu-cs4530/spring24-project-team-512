import _ from 'lodash';

import {
  EscapeRoomArea,
  RoomInstanceID,
  RoomResult,
  EscapeRoomState,
  InteractableID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  ESCAPE_ROOM_AREA_TYPE,
} from './InteractableAreaController';

export type GameEventTypes = BaseInteractableEventMap & {
  roomStart: () => void;
  roomUpdated: () => void;
  roomEnd: () => void;
  playerChange: (newPlayer: PlayerController) => void;
};

export default abstract class EscapeRoomAreaController<
  State extends EscapeRoomState,
  EventTypes extends GameEventTypes,
> extends InteractableAreaController<EventTypes, EscapeRoomArea<State>> {
  protected _instanceID?: RoomInstanceID;

  protected _townController: TownController;

  protected _model: EscapeRoomArea<State>;

  protected _player: PlayerController | undefined;

  constructor(
    id: InteractableID,
    escapeRoomArea: EscapeRoomArea<State>,
    townController: TownController,
  ) {
    super(id);
    this._model = escapeRoomArea;
    this._townController = townController;

    const room = escapeRoomArea.room;
    if (room && room.player) this._player = this._townController.getPlayer(room.player);
  }

  get history(): RoomResult[] {
    return this._model.history;
  }

  get player(): PlayerController | undefined {
    return this._player;
  }

  public get friendlyName(): string {
    return this.id;
  }

  get type(): string {
    return ESCAPE_ROOM_AREA_TYPE;
  }

  public async joinRoom() {
    const { roomID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinRoom',
    });
    this._instanceID = roomID;
  }

  /**
   * Sends a request to the server to leave the current game in the game area.
   */
  public async leaveRoom() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveRoom',
        roomID: instanceID,
      });
    }
  }

  protected _updateFrom(newModel: EscapeRoomArea<State>): void {
    const roomEnding =
      this._model.room?.state.status === 'IN_PROGRESS' &&
      newModel.room?.state.status === 'WAITING_TO_START';
    let newPlayer: PlayerController | undefined;
    if (newModel.room?.player !== undefined) {
      newPlayer = this._townController.getPlayer(newModel.room.player) ?? undefined;
    }
    if (!newPlayer && this._player !== undefined) {
      this._player = undefined;
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playerChange', undefined);
    }
    this._model = newModel;
    //TODO - Bounty for figuring out how to make the types work here
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('roomUpdated');
    this._instanceID = newModel.room?.id ?? this._instanceID;
    if (roomEnding) {
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('roomEnd');
    }
  }

  toInteractableAreaModel(): EscapeRoomArea<State> {
    return this._model;
  }
}
