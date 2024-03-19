import { nanoid } from 'nanoid';
import Player from '../lib/Player';

import {
  RoomInstance,
  RoomInstanceID,
  RoomResult,
  EscapeRoomState,
  PlayerID,
} from '../types/CoveyTownSocket';

/**
 * This class is the class for the esacpe room. It is responsible for managing the
 * state of the escape room. @see EscapeRoomArea
 */
export default class EscapeRoom<StateType extends EscapeRoomState> {
  private _state: StateType;

  public readonly id: RoomInstanceID;

  protected _result?: RoomResult;

  protected _player?: PlayerID;

  private _time: number;

  /**
   * Creates a new Game instance.
   * @param initialState State to initialize the game with.
   * @param emitAreaChanged A callback to invoke when the state of the game changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as RoomInstanceID;
    this._state = initialState;
    this._time = 0;
  }

  public get state() {
    return this._state;
  }

  public set state(newState: StateType) {
    this._state = newState;
  }

  private _tick() {
    this._time += 1;
  }

  private _join(player: Player): void {
    if (this._player !== undefined && this._state.status === 'WAITING_TO_START') {
      throw Error('Game is currently in progress');
    }
    if (this._player === player.id) {
      throw Error('palyer is currently in game');
    }
    this._state.status = 'IN_PROGRESS';
    this._player = player.id;
  }

  private _leave(player: Player): void {
    if (this._player !== player.id) {
      throw Error('palyer is not currently in game');
    }
    if (this._state.status === 'COMPLETED') {
      if (this._result !== undefined) {
        this._result.time = this._time;
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this._result !== undefined) {
        this._result.time = 0;
      }
    }
    this._state.status = 'WAITING_TO_START';
  }

  /**
   * Attempt to join a game.
   * @param player The player to join the game.
   * @throws Error if the player can not join the game
   */
  public join(player: Player): void {
    this._join(player);
    this._player = player.id;
  }

  /**
   * Attempt to leave a game.
   * @param player The player to leave the game.
   * @throws Error if the player can not leave the game
   */
  public leave(player: Player): void {
    this._leave(player);
    this._player = undefined;
  }

  public toModel(): RoomInstance<StateType> {
    return {
      state: this._state,
      id: this.id,
      player: this._player || '',
      result: this._result,
    };
  }
}
