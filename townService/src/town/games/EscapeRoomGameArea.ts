import GameArea from './GameArea';
import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import EscapeRoomGame from './EscapeRoomGame';
import {
  EscapeRoomGameState,
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';

/**
 * A EscapeRoomGameArea is a GameArea that hosts a EscapeRoomGame.
 * @see EscapeRoomGame
 * @see GameArea
 */
export default class EscapeRoomGameArea extends GameArea<EscapeRoomGame> {
  protected getType(): InteractableType {
    return 'EscapeRoomArea';
  }

  private _stateUpdated(updatedState: GameInstance<EscapeRoomGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { player1, player2 } = updatedState.state;
        if (player1 && player2) {
          this._history.push({
            gameID,
            scores: { '': 0 },
            time: this._game?.state?.time,
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // if (command.type === 'GameMove') {
    //   const game = this._game;
    //   if (!game) {
    //     throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    //   }
    //   if (this._game?.id !== command.gameID) {
    //     throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    //   }
    //   assert(
    //     command.move.gamePiece === 'X' || command.move.gamePiece === 'O',
    //     'Invalid game piece',
    //   );
    //   game.applyMove({
    //     gameID: command.gameID,
    //     playerID: player.id,
    //     move: command.move,
    //   });
    //   this._stateUpdated(game.toModel());
    //   return undefined as InteractableCommandReturnType<CommandType>;
    // }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new EscapeRoomGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'StartGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.startGame(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SingleGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.singleGame(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
