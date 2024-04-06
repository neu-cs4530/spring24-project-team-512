import Player from '../../lib/Player';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

import { EscapeRoomGameState, EscapeRoomMove, GameMove } from '../../types/CoveyTownSocket';

import Game from './Game';

/**
 * This class is the class for the esacpe room. It is responsible for managing the
 * state of the escape room. @see EscapeRoomArea
 */
export default class EscapeRoomGame extends Game<EscapeRoomGameState, EscapeRoomMove> {
  // private _playerOne?: PlayerID;

  // private _playerTwo?: PlayerID;

  private _time: number;

  /**
   * Creates a new EscapeRoomGame.
   */
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_FOR_PLAYERS',
      time: 0,
    });
    this._time = 0;
  }

  public get time(): number {
    return this._time;
  }

  /**
   * Indicates that a player is ready to start the game.
   *
   * Updates the game state to indicate that the player is ready to start the game.
   *
   * If both players are ready, the game will start.
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
   *
   * @param player The player who is ready to start the game
   */
  public startGame(player: Player): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.player1 === player.id) {
      this.state.player1Ready = true;
    }
    if (this.state.player2 === player.id) {
      this.state.player2Ready = true;
    }

    this.state = {
      ...this.state,
      status:
        this.state.player1Ready && this.state.player2Ready ? 'IN_PROGRESS' : 'WAITING_TO_START',
    };
  }

  public singleGame(player: Player): void {
    if (this.state.player1 !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.player1 === player.id) {
      this.state.player1Ready = true;
    }
    this.state = {
      ...this.state,
      status: this.state.player1Ready ? 'IN_PROGRESS' : 'WAITING_TO_START',
    };
  }

  /**
   * Joins a player to the game.
   * - If both players are now assigned, updates the game status to WAITING_TO_START.
   *
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
   *
   * @param player the player to join the game
   */
  protected _join(player: Player): void {
    if (this.state.player1 === player.id || this.state.player2 === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        player1: player.id,
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        player2: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.player1 && this.state.player2) {
      this.state.status = 'WAITING_TO_START';
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   *
   * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and sets the winner to the other player.
   *
   * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.status === 'OVER') {
      return;
    }
    const removePlayer = (playerID: string) => {
      if (this.state.player1 === playerID) {
        this.state = {
          ...this.state,
          player1: undefined,
          player1Ready: false,
        };
      }
      if (this.state.player2 === playerID) {
        this.state = {
          ...this.state,
          player2: undefined,
          player2Ready: false,
        };
      } else {
        throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
      }
    };
    removePlayer(player.id);
    switch (this.state.status) {
      case 'WAITING_TO_START':
      case 'WAITING_FOR_PLAYERS':
        // no-ops: nothing needs to happen here
        this.state.status = 'WAITING_FOR_PLAYERS';
        break;
      case 'IN_PROGRESS':
        this.state = {
          ...this.state,
          status: 'OVER',
        };
        break;
      default:
        // This behavior can be undefined :)
        throw new Error(`Unexpected game status: ${this.state.status}`);
    }
  }

  /**
  * Apply move idea.
  
  * EscapeRoomGame class takes a EscapeRoomGameSchema as an argument.
  * 
  * EscapeRoomGameSchema has variable amount of EscapeRoomGameRooms. 
  * 
  * Each EscapeRoomGameRoom outlines the inventory items needed to get to the next room.
  * 
  * The applyMove method will parse the inventory to see if it contains the items and accepts the move if it does. (opens next door)
  * 
  * Need support for opening locks. Should opening locks be a game move? I think anything can be a game move.
  */

  public applyMove(move: GameMove<EscapeRoomMove>): void {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.playerID !== this.state.player1 && move.playerID !== this.state.player2) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
  }
}
