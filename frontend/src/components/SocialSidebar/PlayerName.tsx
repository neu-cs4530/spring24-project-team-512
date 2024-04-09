import React from 'react';
import PlayerController from '../../classes/PlayerController';

type PlayerNameProps = {
  player: PlayerController;
};

import Image from 'next/image';

const DisplayUsername = (player: PlayerController) => {
  if (player.completed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {player.userName}
        <div style={{ width: '25px', height: '25px' }}>
          <Image src='/assets/escaperoombadge.png' width={25} height={25} alt='Escape Room Badge' />
        </div>
      </div>
    );
  } else {
    return player.userName;
  }
};

export default function PlayerName({ player }: PlayerNameProps): JSX.Element {
  return <>{DisplayUsername(player)}</>;
}
