import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import React from 'react';
import EscapeRoomAreaController from '../../../../classes/interactable/EscapeRoomAreaController';
import PlayerController from '../../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { randomLocation } from '../../../../TestUtils';
import { EscapeRoomGameState, GameArea, GameStatus } from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import EscapeRoomArea from './EscapeRoomArea';
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('EscapeRoom');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);
// const boardComponentSpy = jest.spyOn(Esc, 'default');
// boardComponentSpy.mockReturnValue(<div data-testid='board' />);
class MockEscapeRoomAreaController extends EscapeRoomAreaController {
  joinGame = jest.fn();

  mockIsActive = false;

  mockIsPlayer = false;

  mockTime = 0;

  mockPlayer1: PlayerController | undefined = undefined;

  mockPlayer2: PlayerController | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockIsEmpty = true;

  mockCompleted = false;

  public constructor() {
    super(nanoid(), mock<GameArea<EscapeRoomGameState>>(), mock<TownController>());
    this.mockClear();
  }

  get player1(): PlayerController | undefined {
    return this.mockPlayer1;
  }

  get player2(): PlayerController | undefined {
    return this.mockPlayer2;
  }

  isEmpty(): boolean {
    return this.mockIsEmpty;
  }

  get status(): GameStatus {
    return this.mockStatus;
  }

  get completed(): boolean {
    return this.mockCompleted;
  }

  public async startGame(): Promise<void> {
    //do nothing;
  }

  public async singleGame(): Promise<void> {
    //do nothing;
  }

  get isPlayer(): boolean {
    return this.mockIsPlayer;
  }

  get time(): number {
    return this.mockTime;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  public mockClear() {
    // this.mockBoard = [];
    // for (let i = 0; i < CONNECT_FOUR_COLS; i++) {
    //   this.mockBoard.push([]);
    //   for (let j = 0; j < CONNECT_FOUR_ROWS; j++) {
    //     this.mockBoard[i].push(undefined);
    //   }
    // }
    // this.makeMove.mockClear();
  }
}
describe('EscapeRoomArea', () => {
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  const gameAreaController = new MockEscapeRoomAreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;
  function renderEscapeRoomArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <EscapeRoomArea interactableID={nanoid()} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }
  beforeEach(() => {
    ourPlayer = new PlayerController('player 1', 'player 1', randomLocation());
    mockGameArea.name = nanoid();
    mockReset(townController);
    gameAreaController.mockClear();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.joinGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          joinGameResolve = resolve;
          joinGameReject = reject;
        }),
    );
  });
  describe('[T3.1] Game Update Listeners', () => {});
  describe('[T3.2] Join game button', () => {
    it('Is shown if the game status is OVER', () => {
      gameAreaController.mockStatus = 'OVER';
      gameAreaController.mockPlayer1 = undefined;
      gameAreaController.mockPlayer2 = new PlayerController(
        'player 2',
        'player 2',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderEscapeRoomArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
  });
  describe('[T3.3] Players in game text', () => {
    it('Displays the username of the 1st player if there is one', () => {
      gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockIsPlayer = false;
      renderEscapeRoomArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Player 1: ${gameAreaController.mockPlayer1?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays the username of the 2nd player if there is one', () => {
      gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockIsPlayer = false;
      renderEscapeRoomArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Player 2: ${gameAreaController.mockPlayer2?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays "Player 2: (No player yet!) if there is no 2nd player', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer2 = undefined;
      renderEscapeRoomArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 2: (No player yet!)`)).toBeInTheDocument();
    });
    it('Displays "Player1: (No player yet!) if there is no 1st player', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = undefined;
      renderEscapeRoomArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 1: (No player yet!)`)).toBeInTheDocument();
    });
    it('Updates the 1st player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = undefined;
      renderEscapeRoomArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 1: (No player yet!)`)).toBeInTheDocument();
      gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Player 1: ${gameAreaController.mockPlayer1?.userName}`),
      ).toBeInTheDocument();
    });
    it('Updates the 2nd player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer2 = undefined;
      renderEscapeRoomArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 2: (No player yet!)`)).toBeInTheDocument();
      gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Player 2: ${gameAreaController.mockPlayer2?.userName}`),
      ).toBeInTheDocument();
    });
  });
  describe('[T3.4] Game status text', () => {
    it('Displays the correct text when the game is over', () => {
      gameAreaController.mockStatus = 'OVER';
      renderEscapeRoomArea();
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
  });
});
