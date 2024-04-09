import React from 'react';
import PlayerController from '../../classes/PlayerController';

type PlayerNameProps = {
  player: PlayerController;
};

const DisplayUsername = (player: PlayerController) => {
  {
    if (player.completed) {
      return player.userName + '(Completed Escape Room!)';
    } else {
      return player.userName;
    }
  }
};
export default function PlayerName({ player }: PlayerNameProps): JSX.Element {
  return <>{DisplayUsername(player)}</>;
}
