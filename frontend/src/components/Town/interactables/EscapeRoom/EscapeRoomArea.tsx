import { Button, Container, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import EscapeRoomAreaController from '../../../../classes/interactable/EscapeRoomAreaController';
/**
 * The TicTacToeArea component renders the TicTacToe game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicTacToeAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `X: ${username}` and `O: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - The TicTacToeBoard component, which is passed the current gameAreaController as a prop (@see TicTacToeBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
export default function EscapeRoomArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<EscapeRoomAreaController>(interactableID);
  const townController = useTownController();
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [time, setTime] = useState<number>(gameAreaController.time);
  const [joiningGame, setJoiningGame] = useState(false);
  const [inRoomP1, setEscapeRoomP1] = useState(gameAreaController.player1?.escapeRoom);
  const [inRoomP2, setEscapeRoomP2] = useState(gameAreaController.player2?.escapeRoom);

  const [p1, setPlayer1] = useState<PlayerController | undefined>(gameAreaController.player1);
  const [p2, setPlayer2] = useState<PlayerController | undefined>(gameAreaController.player2);
  const toast = useToast();

  const gameArea = useInteractable<GameAreaInteractable>('gameArea');

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setTime(gameAreaController.time || 0);
      setPlayer1(gameAreaController.player1);
      setPlayer2(gameAreaController.player2);
      setEscapeRoomP1(false);
      setEscapeRoomP2(false);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      const completed = gameAreaController.completed;
      if (!completed) {
        toast({
          title: 'Game Over',
          description: 'Escape Room Failed',
          status: 'info',
        });
      } else {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      }
    };
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  const inGame = gameAreaController.occupants.filter(player => player.escapeRoom === true);
  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS' && inGame.length > 0) {
    gameStatusText = <>Game in progress, current time: {time}</>;
  } else if (gameStatus == 'WAITING_TO_START') {
    const startGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.startGame();
            gameArea?.movePlayer(2065, 1800);
          } catch (err) {
            toast({
              title: 'Error starting game',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Start Game
      </Button>
    );
    gameStatusText = <b>Waiting for players to press start. {startGameButton}</b>;
  } else if (gameStatus == 'WAITING_FOR_PLAYERS' && gameAreaController.player1) {
    const singleGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.singleGame();
            gameArea?.movePlayer(2065, 1800);
          } catch (err) {
            toast({
              title: 'Error starting game',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Start Game
      </Button>
    );
    gameStatusText = <b>Waiting for player to press start. {singleGameButton}</b>;
  } else {
    const joinGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.joinGame();
          } catch (err) {
            toast({
              title: 'Error joining game',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Join New Game
      </Button>
    );
    let gameStatusStr;
    if (gameStatus === 'OVER') gameStatusStr = 'over';
    else if (gameStatus === 'WAITING_FOR_PLAYERS') gameStatusStr = 'waiting for players to join';
    gameStatusText = (
      <b>
        Game {gameStatusStr}. {joinGameButton}
      </b>
    );
  }

  return (
    <Container>
      {gameStatusText}
      <List aria-label='list of players in the game'>
        <ListItem>Player 1: {p1?.userName || '(No player yet!)'}</ListItem>
        <ListItem>Player 2: {p2?.userName || '(No player yet!)'}</ListItem>
      </List>
    </Container>
  );
}
