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

  const [p1, setPlayer1] = useState<PlayerController | undefined>(gameAreaController.player1);
  const [p2, setPlayer2] = useState<PlayerController | undefined>(gameAreaController.player2);
  const toast = useToast();

  const gameArea = useInteractable<GameAreaInteractable>('gameArea');

  // const isPlayer1Ready = () => {
  //   const gameState = gameAreaController.toInteractableAreaModel().game?.state;
  //   return gameState?.player1Ready;
  // };

  // const isPlayer2Ready = () => {
  //   const gameState = gameAreaController.toInteractableAreaModel().game?.state;
  //   return gameState?.player2Ready;
  // };

  // const areBothPlayerReady = () => isPlayer1Ready() && isPlayer2Ready();

  useEffect(() => {
    console.log(townController.ourPlayer);
    const updateGameState = () => {
      console.log(gameAreaController);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setTime(gameAreaController.time || 0);
      setPlayer1(gameAreaController.player1);
      setPlayer2(gameAreaController.player2);
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
    // if(areBothPlayerReady()) {
    gameArea?.movePlayer(2065, 1800);
    // }
  } else if (gameStatus == 'WAITING_TO_START') {
    // if (
    //   gameAreaController.player1?.userName === townController.ourPlayer.userName &&
    //   isPlayer1Ready()
    // ) {
    //   gameStatusText = <b>Waiting for player 2 to start the game</b>;
    // } else if (
    //   gameAreaController.player2?.userName === townController.ourPlayer.userName &&
    //   isPlayer2Ready()
    // ) {
    //   gameStatusText = <b>Waiting for player 1 to start the game</b>;
    // } else {
    const startGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.startGame();
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
        Start Two Player Game
      </Button>
    );
    gameStatusText = <b>Press to play multiplayer. {startGameButton}</b>;
    // }
  } else if (
    gameStatus == 'WAITING_FOR_PLAYERS' &&
    gameAreaController.player1?.userName === townController.ourPlayer.userName
  ) {
    const singleGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.singleGame();
            if (
              gameAreaController.toInteractableAreaModel().game?.state.player1Ready &&
              gameAreaController.toInteractableAreaModel().game?.state.player2Ready
            ) {
              gameArea?.movePlayer(2065, 1800);
            }
            if (p1) p1.escapeRoom = true;
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
        Single Player
      </Button>
    );
    const joinGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            if (p1) p1.escapeRoom = true;
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
    gameStatusText = (
      <b>
        Press to play single player, or wait for one more player. {singleGameButton}.
        {joinGameButton}
      </b>
    );
  } else {
    const joinGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            if (p1) p1.escapeRoom = true;
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
    const description = (
      <Button
        onClick={async () => {
          try {
            toast({
              title: 'EscapeRoom Objective',
              description:
                'Room 1: figure out the combination to unlock the lockbox and obtain the key to room 2 \nRoom 2: Find the key in a crevice in the maze, and go to room 3 \n Room3: Find the key using the hints',
              status: 'info',
            });
          } catch (err) {
            toast({
              title: 'Error displaying description',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Objective
      </Button>
    );
    let gameStatusStr;
    if (gameStatus === 'OVER') gameStatusStr = 'over';
    else if (gameStatus === 'WAITING_FOR_PLAYERS') gameStatusStr = 'waiting for players to join';
    gameStatusText = (
      <b>
        Game {gameStatusStr}. {joinGameButton}. {description}
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
