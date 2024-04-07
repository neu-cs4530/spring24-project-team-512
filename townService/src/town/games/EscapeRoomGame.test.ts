import { Console } from 'console';
import {
  BOARD_POSITION_NOT_VALID_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';

import EscapeRoomGame from './EscapeRoomGame';

const logger = new Console(process.stdout, process.stderr);
/**
 * A helper function to apply a pattern of moves to a game.
 * The pattern is a 2-d array of Y, R or _.
 * Y and R indicate that a move should be made by the player2 or player1 player respectively.
 * _ indicates that no move should be made.
 * The pattern is applied from the bottom left to the top right, going across the rows
 *
 * Note that there are valid game boards that *can not* be created by this function, as it does not
 * search for all possible orderings of applying the moves. It might get stuck in a situation where
 * it can't make a move, because it hasn't made the move that would allow it to make the next move.
 *
 * If it fails, it will print to the console the pattern and the moves that were made, and throw an error.
 *
 * @param game Game to apply the pattern to
 * @param pattern Board pattern to apply
 * @param player1ID ID of the player1 player
 * @param player2ID ID of the player2 player
 * @param firstColor The color of the first player to make a move
 */
describe('EscapeRoomGame', () => {
  let game: EscapeRoomGame;
  beforeEach(() => {
    game = new EscapeRoomGame();
  });
  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the player is not in the game and the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    // Tests above are provided
    describe('if the player is not in the game and the game is not full', () => {
      describe('if the player was not the player2 in the last game', () => {
        it('should add the player as player1 if player1 is empty', () => {
          const player1 = createPlayerForTesting();
          game.join(player1);
          expect(game.state.player1).toBe(player1.id);
          expect(game.state.player2).toBeUndefined();
          expect(game.state.player1Ready).toBeFalsy();
          expect(game.state.player2Ready).toBeFalsy();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        it('should add the player as player2 if player1 is present', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
          game.join(player2);
          expect(game.state.player1).toBe(player1.id);
          expect(game.state.player2).toBe(player2.id);
          expect(game.state.player1Ready).toBeFalsy();
          expect(game.state.player2Ready).toBeFalsy();
          expect(game.state.status).toBe('WAITING_TO_START');
        });
      });

      it('should set the status to WAITING_TO_START if both players are present', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        expect(game.state.status).toBe('WAITING_TO_START');
        expect(game.state.player1Ready).toBeFalsy();
        expect(game.state.player2Ready).toBeFalsy();
      });
    });
  });
  describe('[T1.2] _startGame', () => {
    test('if the status is not WAITING_TO_START, it throws an error', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.startGame(player)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if the player is not in the game, it throws an error', () => {
      game.join(createPlayerForTesting());
      game.join(createPlayerForTesting());
      expect(() => game.startGame(createPlayerForTesting())).toThrowError(
        PLAYER_NOT_IN_GAME_MESSAGE,
      );
    });
    describe('if the player is in the game', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      beforeEach(() => {
        game.join(player1);
        game.join(player2);
      });
      test('if the player is player1, it sets player1Ready to true', () => {
        game.startGame(player1);
        expect(game.state.player1Ready).toBe(true);
        expect(game.state.player2Ready).toBeFalsy();
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if the player is player2, it sets player2Ready to true', () => {
        game.startGame(player2);
        expect(game.state.player1Ready).toBeFalsy();
        expect(game.state.player2Ready).toBe(true);
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if both players are ready, it sets the status to IN_PROGRESS', () => {
        game.startGame(player1);
        game.startGame(player2);
        expect(game.state.player1Ready).toBe(true);
        expect(game.state.player2Ready).toBe(true);
        expect(game.state.status).toBe('IN_PROGRESS');
      });
      test('if a player already reported ready, it does not change the status or throw an error', () => {
        game.startGame(player1);
        game.startGame(player1);
        expect(game.state.player1Ready).toBe(true);
        expect(game.state.player2Ready).toBeFalsy();
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if there are not any players from a prior game, it always sets the first player to player1 when the game starts', () => {
        // create conditions where the first player *would* be player2
        game.startGame(player1);
        game.startGame(player2);
        game.leave(player1);
        expect(game.state.status).toBe('OVER');

        const secondGame = new EscapeRoomGame();
        secondGame.join(player1);
        expect(secondGame.state.player1).toBe(player1.id);
        const newplayer2 = createPlayerForTesting();
        secondGame.join(newplayer2);
        expect(secondGame.state.player2).toBe(newplayer2.id);
        secondGame.leave(player1);

        // Now, there are no longer players from the last game.
        const newplayer1 = createPlayerForTesting();
        secondGame.join(newplayer1);
        secondGame.startGame(newplayer2);
        secondGame.startGame(newplayer1);
      });
      test('if there are players from a prior game, it sets the first player to the player who was not first in the last game', () => {
        game.startGame(player1);
        game.startGame(player2);
        game.leave(player1);

        const secondGame = new EscapeRoomGame();
        const newplayer1 = createPlayerForTesting();
        secondGame.join(newplayer1);
        secondGame.join(player2);
        secondGame.startGame(newplayer1);
        secondGame.startGame(player2);
      });
    });
  });
  describe('[T1.3] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      const player = createPlayerForTesting();
      expect(() => game.leave(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress', () => {
        test('if the player is player1, it sets the time to be 0', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          game.startGame(player1);
          game.startGame(player2);
          game.leave(player1);
          expect(game.state.time).toEqual(0);
          expect(game.state.status).toBe('OVER');
        });
        test('if the player is player2, it sets the time to be 0', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          game.startGame(player1);
          game.startGame(player2);
          game.leave(player2);
          expect(game.state.time).toEqual(0);
          expect(game.state.status).toBe('OVER');
        });
      });
      test('when the game is already over before the player leaves, it does not update the state', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.startGame(player1);
        game.startGame(player2);
        expect(game.state.player2).toBe(player2.id);
        expect(game.state.player1).toBe(player1.id);
        game.leave(player1);
        expect(game.state.status).toBe('OVER');
        const stateBeforeLeaving = { ...game.state };
        game.leave(player2);
        expect(game.state).toEqual(stateBeforeLeaving);
      });
      describe('when the game is waiting to start, with status WAITING_TO_START', () => {
        test('if the player is player1, it sets player1 to undefined and status to WAITING_FOR_PLAYERS', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          expect(game.state.player1Ready).toBeFalsy();
          game.join(player2);
          game.startGame(player1);
          expect(game.state.player1Ready).toBeTruthy();
          game.leave(player1);
          expect(game.state.player1Ready).toBeFalsy();
          expect(game.state.player1).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is player2, it sets player2 to undefined and status to WAITING_FOR_PLAYERS', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.player2Ready).toBeFalsy();
          game.startGame(player2);
          expect(game.state.player2Ready).toBeTruthy();
          game.leave(player2);
          expect(game.state.player2Ready).toBeFalsy();
          expect(game.state.player2).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is player1, and the "preferplayer1 player2" player joins, it should add the player as player1', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);

          expect(game.state.player1).toBe(player1.id); // First player should be player1
          expect(game.state.player2).toBe(player2.id); // Second player should be player2
          expect(game.state.player1Ready).toBeFalsy();
          expect(game.state.player2Ready).toBeFalsy();
          expect(game.state.status).toBe('WAITING_TO_START');

          // Now, make a new game with the state of the last one
          const secondGame = new EscapeRoomGame();
          expect(secondGame.state.player1).toBeUndefined();
          expect(secondGame.state.player2).toBeUndefined();

          const newplayer1 = createPlayerForTesting();
          secondGame.join(newplayer1);
          expect(secondGame.state.player1).toBe(newplayer1.id);
          const newplayer2 = createPlayerForTesting();
          secondGame.join(newplayer2);
          expect(secondGame.state.player2).toBe(newplayer2.id);
          secondGame.leave(newplayer1);
          secondGame.join(player2);
          expect(secondGame.state.player1).toBe(player2.id);
          expect(secondGame.state.player2).toBe(newplayer2.id);
        });
      });
      describe('when the game is waiting for players, in state WAITING_FOR_PLAYERS', () => {
        test('if the player is player1, it sets player1 to undefined, player1Ready to false and status remains WAITING_FOR_PLAYERS', () => {
          const player1 = createPlayerForTesting();
          game.join(player1);
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
          game.leave(player1);
          expect(game.state.player1).toBeUndefined();
          expect(game.state.player1Ready).toBeFalsy();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
      });
    });
  });
});
