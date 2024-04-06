// import { ChakraProvider } from '@chakra-ui/react';
// import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
// import { mock, mockReset } from 'jest-mock-extended';
// import { nanoid } from 'nanoid';
// import { act } from 'react-dom/test-utils';
// import React from 'react';
// import EscapeRoomAreaController from '../../../../classes/interactable/EscapeRoomAreaController';
// import PlayerController from '../../../../classes/PlayerController';
// import TownController, * as TownControllerHooks from '../../../../classes/TownController';
// import TownControllerContext from '../../../../contexts/TownControllerContext';
// import { randomLocation } from '../../../../TestUtils';
// import { EscapeRoomGameState, GameArea, GameStatus } from '../../../../types/CoveyTownSocket';
// import PhaserGameArea from '../GameArea';
// import EscapeRoomArea from './EscapeRoomArea';

// const mockToast = jest.fn();
// jest.mock('@chakra-ui/react', () => {
//   const ui = jest.requireActual('@chakra-ui/react');
//   const mockUseToast = () => mockToast;
//   return {
//     ...ui,
//     useToast: mockUseToast,
//   };
// });
// const mockGameArea = mock<PhaserGameArea>();
// mockGameArea.getData.mockReturnValue('EscapeRoom');
// jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
// const useInteractableAreaControllerSpy = jest.spyOn(
//   TownControllerHooks,
//   'useInteractableAreaController',
// );

// // const boardComponentSpy = jest.spyOn(Esc, 'default');
// // boardComponentSpy.mockReturnValue(<div data-testid='board' />);
// class MockEscapeRoomAreaController extends EscapeRoomAreaController {
//   joinGame = jest.fn();

//   mockIsActive = false;

//   mockIsPlayer = false;

//   mockTime = 0;

//   mockPlayer1: PlayerController | undefined = undefined;

//   mockPlayer2: PlayerController | undefined = undefined;

//   mockStatus: GameStatus = 'WAITING_TO_START';

//   mockIsEmpty = true;

//   mockCompleted = false;

//   public constructor() {
//     super(nanoid(), mock<GameArea<EscapeRoomGameState>>(), mock<TownController>());
//     this.mockClear();
//   }

//   get player1(): PlayerController | undefined {
//     return this.mockPlayer1;
//   }

//   get player2(): PlayerController | undefined {
//     return this.mockPlayer2;
//   }

//   isEmpty(): boolean {
//     return this.mockIsEmpty;
//   }

//   get status(): GameStatus {
//     return this.mockStatus;
//   }

//   get completed(): boolean {
//     return this.mockCompleted;
//   }

//   get isPlayer(): boolean {
//     return this.mockIsPlayer;
//   }

//   get time(): number {
//     return this.mockTime;
//   }

//   public isActive(): boolean {
//     return this.mockIsActive;
//   }

//   public mockClear() {
//     // this.mockBoard = [];
//     // for (let i = 0; i < CONNECT_FOUR_COLS; i++) {
//     //   this.mockBoard.push([]);
//     //   for (let j = 0; j < CONNECT_FOUR_ROWS; j++) {
//     //     this.mockBoard[i].push(undefined);
//     //   }
//     // }
//     // this.makeMove.mockClear();
//   }
// }
// describe('EscapeRoomArea', () => {
//   let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
//   beforeAll(() => {
//     // Spy on console.error and intercept react key warnings to fail test
//     consoleErrorSpy = jest.spyOn(global.console, 'error');
//     consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
//       const stringMessage = message as string;
//       if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
//         throw new Error(stringMessage.replace('%s', optionalParams[0]));
//       } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
//         throw new Error(stringMessage.replace('%s', optionalParams[0]));
//       }
//       // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
//       console.warn(message, ...optionalParams);
//     });
//   });
//   afterAll(() => {
//     consoleErrorSpy.mockRestore();
//   });

//   let ourPlayer: PlayerController;
//   const townController = mock<TownController>();
//   Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
//   let gameAreaController = new MockEscapeRoomAreaController();
//   let joinGameResolve: () => void;
//   let joinGameReject: (err: Error) => void;

//   function renderEscapeRoomArea() {
//     return render(
//       <ChakraProvider>
//         <TownControllerContext.Provider value={townController}>
//           <EscapeRoomArea interactableID={nanoid()} />
//         </TownControllerContext.Provider>
//       </ChakraProvider>,
//     );
//   }
//   beforeEach(() => {
//     ourPlayer = new PlayerController('player 1', 'player 1', randomLocation());
//     mockGameArea.name = nanoid();
//     mockReset(townController);
//     gameAreaController.mockClear();
//     useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
//     mockToast.mockClear();
//     gameAreaController.joinGame.mockReset();
//     gameAreaController.joinGame.mockImplementation(
//       () =>
//         new Promise<void>((resolve, reject) => {
//           joinGameResolve = resolve;
//           joinGameReject = reject;
//         }),
//     );
//   });
//   describe('[T3.1] Game Update Listeners', () => {
//     it('Registers exactly one listener for gameUpdated and gameEnd events', () => {
//       const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
//       addListenerSpy.mockClear();

//       renderEscapeRoomArea();
//       expect(addListenerSpy).toBeCalledTimes(2);
//       expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
//       expect(addListenerSpy).toHaveBeenCalledWith('gameEnd', expect.any(Function));
//     });
//     it('Does not register a listener on every render', () => {
//       const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
//       const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
//       addListenerSpy.mockClear();
//       removeListenerSpy.mockClear();
//       const renderData = renderEscapeRoomArea();
//       expect(addListenerSpy).toBeCalledTimes(2);
//       addListenerSpy.mockClear();

//       renderData.rerender(
//         <ChakraProvider>
//           <TownControllerContext.Provider value={townController}>
//             <EscapeRoomArea interactableID={nanoid()} />
//           </TownControllerContext.Provider>
//         </ChakraProvider>,
//       );

//       expect(addListenerSpy).not.toBeCalled();
//       expect(removeListenerSpy).not.toBeCalled();
//     });
//     it('Removes all listeners on unmount', () => {
//       const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
//       const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
//       addListenerSpy.mockClear();
//       removeListenerSpy.mockClear();
//       const renderData = renderEscapeRoomArea();
//       expect(addListenerSpy).toBeCalledTimes(2);
//       const addedListeners = addListenerSpy.mock.calls;
//       const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
//       const addedGameEndedListener = addedListeners.find(call => call[0] === 'gameEnd');
//       expect(addedGameEndedListener).toBeDefined();
//       expect(addedGameUpdateListener).toBeDefined();
//       renderData.unmount();
//       expect(removeListenerSpy).toBeCalledTimes(2);
//       const removedListeners = removeListenerSpy.mock.calls;
//       const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
//       const removedGameEndedListener = removedListeners.find(call => call[0] === 'gameEnd');
//       expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
//       expect(removedGameEndedListener).toEqual(addedGameEndedListener);
//     });
//     it('Creates new listeners if the gameAreaController changes', () => {
//       const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
//       const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
//       addListenerSpy.mockClear();
//       removeListenerSpy.mockClear();
//       const renderData = renderEscapeRoomArea();
//       expect(addListenerSpy).toBeCalledTimes(2);

//       gameAreaController = new MockEscapeRoomAreaController();
//       const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
//       const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

//       useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
//       renderData.rerender(
//         <ChakraProvider>
//           <TownControllerContext.Provider value={townController}>
//             <EscapeRoomArea interactableID={nanoid()} />
//           </TownControllerContext.Provider>
//         </ChakraProvider>,
//       );
//       expect(removeListenerSpy).toBeCalledTimes(2);

//       expect(addListenerSpy2).toBeCalledTimes(2);
//       expect(removeListenerSpy2).not.toBeCalled();
//     });
//   });
//   describe('[T3.2] Join game button', () => {
//     it('Is not shown if the game status is IN_PROGRESS', () => {
//       gameAreaController.mockStatus = 'IN_PROGRESS';
//       gameAreaController.mockPlayer1 = new PlayerController(
//         'player 1',
//         'player 1',
//         randomLocation(),
//       );
//       gameAreaController.mockPlayer2 = new PlayerController(
//         'player 2',
//         'player 2',
//         randomLocation(),
//       );
//       gameAreaController.mockIsPlayer = true;
//       renderEscapeRoomArea();
//       expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
//     });
//     it('Is not shown if the game status is WAITING_TO_START', () => {
//       gameAreaController.mockStatus = 'WAITING_TO_START';
//       gameAreaController.mockPlayer1 = ourPlayer;
//       gameAreaController.mockIsPlayer = true;
//       renderEscapeRoomArea();
//       expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
//     });
//     it('Is shown if the game status is OVER', () => {
//       gameAreaController.mockStatus = 'OVER';
//       gameAreaController.mockPlayer1 = undefined;
//       gameAreaController.mockPlayer2 = new PlayerController(
//         'player 2',
//         'player 2',
//         randomLocation(),
//       );
//       gameAreaController.mockIsPlayer = false;
//       renderEscapeRoomArea();
//       expect(screen.queryByText('Join New Game')).toBeInTheDocument();
//     });
//     describe('When clicked', () => {
//       it('Calls the gameAreaController.joinGame method', () => {
//         gameAreaController.mockStatus = 'WAITING_TO_START';
//         gameAreaController.mockIsPlayer = false;
//         renderEscapeRoomArea();
//         const button = screen.getByText('Join New Game');
//         fireEvent.click(button);
//         expect(gameAreaController.joinGame).toBeCalled();
//       });
//       it('Displays a toast with the error message if the joinGame method throws an error', async () => {
//         gameAreaController.mockStatus = 'WAITING_TO_START';
//         gameAreaController.mockIsPlayer = false;
//         renderEscapeRoomArea();
//         const button = screen.getByText('Join New Game');
//         fireEvent.click(button);
//         expect(gameAreaController.joinGame).toBeCalled();
//         const errorMessage = `Testing error message ${nanoid()}`;
//         act(() => {
//           joinGameReject(new Error(errorMessage));
//         });
//         await waitFor(() => {
//           expect(mockToast).toBeCalledWith(
//             expect.objectContaining({
//               description: `Error: ${errorMessage}`,
//               status: 'error',
//             }),
//           );
//         });
//       });
//       it('Is disabled and set to loading while the player is joining the game', async () => {
//         gameAreaController.mockStatus = 'WAITING_TO_START';
//         gameAreaController.mockIsPlayer = false;
//         renderEscapeRoomArea();
//         const button = screen.getByText('Join New Game');
//         fireEvent.click(button);
//         expect(gameAreaController.joinGame).toBeCalled();

//         expect(button).toBeDisabled();
//         expect(within(button).queryByText('Loading...')).toBeInTheDocument(); //Check that the loading text is displayed
//         act(() => {
//           joinGameResolve();
//         });
//         await waitFor(() => expect(button).toBeEnabled());
//         expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
//       });
//       it('Adds the display of the button when a game becomes possible to join', () => {
//         gameAreaController.mockStatus = 'WAITING_TO_START';
//         gameAreaController.mockIsPlayer = true;
//         gameAreaController.mockPlayer1 = new PlayerController(
//           'player 1',
//           'player 1',
//           randomLocation(),
//         );
//         renderEscapeRoomArea();
//         expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
//         act(() => {
//           gameAreaController.mockStatus = 'OVER';
//           gameAreaController.mockIsPlayer = false;
//           gameAreaController.emit('gameUpdated');
//         });
//         expect(screen.queryByText('Join New Game')).toBeInTheDocument();
//       });
//       it('Removes the button after the player has joined the game', () => {
//         gameAreaController.mockStatus = 'WAITING_TO_START';
//         gameAreaController.mockIsPlayer = false;
//         gameAreaController.mockPlayer1 = undefined;
//         gameAreaController.mockPlayer2 = new PlayerController(
//           'player 2',
//           'player 2',
//           randomLocation(),
//         );
//         renderEscapeRoomArea();
//         expect(screen.queryByText('Join New Game')).toBeInTheDocument();
//         act(() => {
//           gameAreaController.mockStatus = 'IN_PROGRESS';
//           gameAreaController.mockPlayer1 = ourPlayer;
//           gameAreaController.emit('gameUpdated');
//         });
//         expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
//       });
//     });
//   });
//   describe('[T3.3] Players in game text', () => {
//     it('Displays the username of the 1st player if there is one', () => {
//       gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
//       gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
//       gameAreaController.mockIsPlayer = false;
//       renderEscapeRoomArea();
//       const listOfPlayers = screen.getByLabelText('list of players in the game');
//       expect(
//         within(listOfPlayers).getByText(`Player 1: ${gameAreaController.mockPlayer1?.userName}`),
//       ).toBeInTheDocument();
//     });
//     it('Displays the username of the 2nd player if there is one', () => {
//       gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
//       gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
//       gameAreaController.mockIsPlayer = false;
//       renderEscapeRoomArea();
//       const listOfPlayers = screen.getByLabelText('list of players in the game');
//       expect(
//         within(listOfPlayers).getByText(`Player 2: ${gameAreaController.mockPlayer2?.userName}`),
//       ).toBeInTheDocument();
//     });
//     it('Displays "Player 2: (No player yet!) if there is no 2nd player', () => {
//       gameAreaController.mockStatus = 'IN_PROGRESS';
//       gameAreaController.mockIsPlayer = false;
//       gameAreaController.mockPlayer2 = undefined;
//       renderEscapeRoomArea();
//       const listOfPlayers = screen.getByLabelText('list of players in the game');
//       expect(within(listOfPlayers).getByText(`Player 2: (No player yet!)`)).toBeInTheDocument();
//     });
//     it('Displays "Player1: (No player yet!) if there is no 1st player', () => {
//       gameAreaController.mockStatus = 'IN_PROGRESS';
//       gameAreaController.mockIsPlayer = false;
//       gameAreaController.mockPlayer1 = undefined;
//       renderEscapeRoomArea();
//       const listOfPlayers = screen.getByLabelText('list of players in the game');
//       expect(within(listOfPlayers).getByText(`Player 1: (No player yet!)`)).toBeInTheDocument();
//     });
//     it('Updates the 1st player when the game is updated', () => {
//       gameAreaController.mockStatus = 'IN_PROGRESS';
//       gameAreaController.mockIsPlayer = false;
//       gameAreaController.mockPlayer1 = undefined;
//       renderEscapeRoomArea();
//       const listOfPlayers = screen.getByLabelText('list of players in the game');
//       expect(within(listOfPlayers).getByText(`Player 1: (No player yet!)`)).toBeInTheDocument();
//       gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
//       act(() => {
//         gameAreaController.emit('gameUpdated');
//       });
//       expect(
//         within(listOfPlayers).getByText(`Player 1: ${gameAreaController.mockPlayer1?.userName}`),
//       ).toBeInTheDocument();
//     });
//     it('Updates the 2nd player when the game is updated', () => {
//       gameAreaController.mockStatus = 'IN_PROGRESS';
//       gameAreaController.mockIsPlayer = false;
//       gameAreaController.mockPlayer2 = undefined;
//       renderEscapeRoomArea();
//       const listOfPlayers = screen.getByLabelText('list of players in the game');
//       expect(within(listOfPlayers).getByText(`Player 2: (No player yet!)`)).toBeInTheDocument();
//       gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
//       act(() => {
//         gameAreaController.emit('gameUpdated');
//       });
//       expect(
//         within(listOfPlayers).getByText(`Player 2: ${gameAreaController.mockPlayer2?.userName}`),
//       ).toBeInTheDocument();
//     });
//   });
//   describe('[T3.4] Game status text', () => {
//     it('Displays the correct text when the game is waiting to start', () => {
//       gameAreaController.mockStatus = 'WAITING_TO_START';
//       renderEscapeRoomArea();
//       expect(screen.getByText('not yet started', { exact: false })).toBeInTheDocument();
//     });
//     it('Displays the correct text when the game is in progress', () => {
//       gameAreaController.mockStatus = 'IN_PROGRESS';
//       renderEscapeRoomArea();
//       expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
//     });
//     it('Displays the correct text when the game is over', () => {
//       gameAreaController.mockStatus = 'OVER';
//       renderEscapeRoomArea();
//       expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
//     });
//     describe('When a game is in progress', () => {
//       beforeEach(() => {
//         gameAreaController.mockStatus = 'IN_PROGRESS';
//         gameAreaController.mockTime = 20;
//         gameAreaController.mockPlayer1 = ourPlayer;
//         gameAreaController.mockPlayer2 = new PlayerController(
//           'player 2',
//           'player 2',
//           randomLocation(),
//         );
//         gameAreaController.mockIsPlayer = true;
//       });
//       it('Displays a message "Game in progress, current time: "', () => {
//         renderEscapeRoomArea();
//         expect(
//           screen.getByText('Game in progress, current time: 20', { exact: false }),
//         ).toBeInTheDocument();
//       });
//       it('Updates the time when the game is updated', () => {
//         renderEscapeRoomArea();
//         expect(
//           screen.getByText(`Game in progress, current time: 20`, { exact: false }),
//         ).toBeInTheDocument();
//         act(() => {
//           gameAreaController.mockTime = 30;
//           gameAreaController.emit('gameUpdated');
//         });
//         expect(
//           screen.getByText(`Game in progress, current time: 30`, { exact: false }),
//         ).toBeInTheDocument();
//       });
//       it('Updates the game status when the game is updated', () => {
//         gameAreaController.mockStatus = 'WAITING_TO_START';
//         renderEscapeRoomArea();
//         expect(screen.getByText('not yet started', { exact: false })).toBeInTheDocument();
//         act(() => {
//           gameAreaController.mockStatus = 'IN_PROGRESS';
//           gameAreaController.mockTime = 1;
//           gameAreaController.emit('gameUpdated');
//         });
//         expect(
//           screen.getByText('Game in progress, current time: 1', { exact: false }),
//         ).toBeInTheDocument();
//         act(() => {
//           gameAreaController.mockStatus = 'OVER';
//           gameAreaController.emit('gameUpdated');
//         });
//         expect(screen.getByText('over', { exact: false })).toBeInTheDocument();
//       });
//     });
//     describe('When the game ends', () => {
//       it('Displays a toast with the winner', () => {
//         gameAreaController.mockStatus = 'IN_PROGRESS';
//         gameAreaController.mockIsPlayer = true;
//         gameAreaController.mockPlayer1 = ourPlayer;
//         gameAreaController.mockPlayer2 = new PlayerController(
//           'player 2',
//           'player 2',
//           randomLocation(),
//         );
//         renderEscapeRoomArea();
//         gameAreaController.mockCompleted = true;
//         act(() => {
//           gameAreaController.emit('gameEnd');
//         });
//         expect(mockToast).toBeCalledWith(
//           expect.objectContaining({
//             description: `You won!`,
//           }),
//         );
//       });
//       it('Displays a toast with the failed description', () => {
//         gameAreaController.mockStatus = 'IN_PROGRESS';
//         gameAreaController.mockIsPlayer = true;
//         gameAreaController.mockPlayer1 = ourPlayer;
//         gameAreaController.mockPlayer2 = new PlayerController(
//           'player 2',
//           'player 2',
//           randomLocation(),
//         );
//         renderEscapeRoomArea();
//         gameAreaController.mockCompleted = false;
//         act(() => {
//           gameAreaController.emit('gameEnd');
//         });
//         expect(mockToast).toBeCalledWith(
//           expect.objectContaining({
//             description: `Escape Room Failed`,
//           }),
//         );
//       });
//     });
//   });
// });
