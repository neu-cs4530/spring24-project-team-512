import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GameResult, GameStatus } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';

import EscapeRoomAreaController from './EscapeRoomAreaController';

describe('EscapeRoomAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function escapeRoomAreaControllerWithProps({
    _id,
    history,
    player1,
    player2,
    undefinedGame,
    status,
    gameInstanceID,
    observers,
  }: {
    _id?: string;
    history?: GameResult[];
    player1?: string;
    player2?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    gameInstanceID?: string;

    observers?: string[];
  }) {
    const id = _id || `INTERACTABLE-ID-${nanoid()}`;
    const instanceID = gameInstanceID || `GAME-INSTANCE-ID-${nanoid()}`;
    const players = [];
    if (player1) players.push(player1);
    if (player2) players.push(player2);
    if (observers) players.push(...observers);
    const ret = new EscapeRoomAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'EscapeRoomArea',
        game: undefinedGame
          ? undefined
          : {
              id: instanceID,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                player1: player1,
                player2: player2,
                moves: [],
                time: 0,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1] Properties at the start of the game', () => {
    describe('board', () => {
      it('returns an empty board if there are no moves yet', () => {
        const controller = escapeRoomAreaControllerWithProps({ status: 'IN_PROGRESS' });
        //Expect correct number of rows
        expect(controller.time).toBe(0);
        expect(controller.player1).toBe(undefined);
        expect(controller.player2).toBe(undefined);
      });
    });
    describe('player1', () => {
      it('returns the player1 player if there is a player1 player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player1: ourPlayer.id });
        expect(controller.player1).toBe(ourPlayer);
      });
      it('returns undefined if there is no player1 player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player1: undefined });
        expect(controller.player1).toBeUndefined();
      });
    });
    describe('player2', () => {
      it('returns the player2 player if there is a player2 player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player2: ourPlayer.id });
        expect(controller.player2).toBe(ourPlayer);
      });
      it('returns undefined if there is no player2 player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player2: undefined });
        expect(controller.player2).toBeUndefined();
      });
    });
    describe('completed', () => {
      it('returns false when neither player has completed the escape room', () => {
        const controller = escapeRoomAreaControllerWithProps({ player2: ourPlayer.id });
        expect(controller.player2).toBe(ourPlayer);
      });
      it('returns undefined if there is no player2 player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player2: undefined });
        expect(controller.player2).toBeUndefined();
      });
    });
    describe('isPlayer', () => {
      it('returns true if we are a player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player1: ourPlayer.id });
        expect(controller.isPlayer).toBe(true);
      });
      it('returns false if we are not a player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player1: undefined });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('isEmpty', () => {
      it('returns true if there are no players', () => {
        const controller = escapeRoomAreaControllerWithProps({ player1: undefined });
        expect(controller.isEmpty()).toBe(true);
      });
      it('returns false if there is a single player', () => {
        const controller = escapeRoomAreaControllerWithProps({ player1: ourPlayer.id });
        expect(controller.isEmpty()).toBe(false);
      });

      it('returns false if there are multiple players', () => {
        const controller = escapeRoomAreaControllerWithProps({
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there are no players but there are observers', () => {
        const controller = escapeRoomAreaControllerWithProps({ observers: [ourPlayer.id] });
        expect(controller.isEmpty()).toBe(false);
      });
    });
    describe('isActive', () => {
      it('returns true if the game is not empty and it is not waiting for players', () => {
        const controller = escapeRoomAreaControllerWithProps({
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('returns true if game is in progress', () => {
        const controller = escapeRoomAreaControllerWithProps({
          player1: undefined,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('returns false if the game is waiting for players', () => {
        const controller = escapeRoomAreaControllerWithProps({
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          status: 'WAITING_FOR_PLAYERS',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
  });
  describe('[T1.3] startGame', () => {
    it('sends a StartGame command to the server', async () => {
      const controller = escapeRoomAreaControllerWithProps({
        player1: ourPlayer.id,
        player2: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {});
      await controller.startGame();
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('Does not catch any errors from the server', async () => {
      const controller = escapeRoomAreaControllerWithProps({
        player1: ourPlayer.id,
        player2: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      const uniqueError = `Test Error ${nanoid()}`;
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        throw new Error(uniqueError);
      });
      await expect(() => controller.startGame()).rejects.toThrowError(uniqueError);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('throws an error if the game is not startable', async () => {
      const controller = escapeRoomAreaControllerWithProps({
        player1: ourPlayer.id,
        player2: otherPlayers[0].id,
        status: 'IN_PROGRESS',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame()).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
    it('throws an error if there is no instanceid', async () => {
      const controller = escapeRoomAreaControllerWithProps({
        player1: ourPlayer.id,
        player2: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame()).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
  });
});
