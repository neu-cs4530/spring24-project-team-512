import { Console } from 'console';
import { createPlayerForTesting } from '../../../TestUtils';
import EscapeRoomGame from './EscapeRoomGame';

describe('EscapeRoomGame', () => {
  let room: EscapeRoomGame;
  beforeEach(() => {
    room = new EscapeRoomGame();
  });

  // describe('[T1.1] _join', () => {
  //   it('should throw an error if the player is already in the game', () => {
  //     const player = createPlayerForTesting();
  //     room.join(player);
  //     expect(() => room.join(player)).toThrowError('Game is currently in progress');
  //     //   const player2 = createPlayerForTesting();
  //     //   room.join(player2);
  //     //   expect(() => room.join(player2)).toThrowError();
  //   });
  //   it('should update status when player joins the game', () => {
  //     const player = createPlayerForTesting();
  //     expect(room.state.status).toBe('WAITING_TO_START');
  //     room.join(player);
  //     expect(room.state.status).toBe('IN_PROGRESS');
  //     //   const player2 = createPlayerForTesting();
  //     //   room.join(player2);
  //     //   expect(() => room.join(player2)).toThrowError();
  //   });

  //   it('should update status when status is not WAITING_TO_START', () => {
  //     const player = createPlayerForTesting();
  //     room.join(player);
  //     expect(room.state.status).toBe('IN_PROGRESS');
  //     const player2 = createPlayerForTesting();
  //     expect(() => room.join(player2)).toThrowError('Game is currently in progress');
  //   });
  // });

  // describe('[T1.3] _leave', () => {
  //   it('should throw an error if the player is not in the game', () => {
  //     const player = createPlayerForTesting();
  //     expect(() => room.leave(player)).toThrowError('player is not currently in game');
  //   });

  //   it('should set time if status is complete', () => {
  //     const player = createPlayerForTesting();
  //     room.join(player);
  //     room.tick();
  //     room.tick();
  //     room.state.status = 'COMPLETED';
  //     room.leave(player);
  //     //   room.result = { gameID: '10', time: 0 };
  //     expect(room.result?.time).toEqual(2);
  //   });

  //   it('should set time to 0 if status is not complete', () => {
  //     const player = createPlayerForTesting();
  //     room.join(player);
  //     room.tick();
  //     room.tick();
  //     room.leave(player);
  //     //   room.result = { gameID: '10', time: 0 };
  //     expect(room.result?.time).toEqual(0);
  //   });

  //   test('when the game is already over before the player leaves, it does not update the state', () => {
  //     const player = createPlayerForTesting();
  //     room.join(player);

  //     expect(room.state.player).toBe(player.id);
  //     room.leave(player);
  //     expect(room.state.status).toBe('WAITING_TO_START');
  //   });
  // });
});
