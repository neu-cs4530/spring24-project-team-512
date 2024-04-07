import { Box, Heading, ListItem, OrderedList, Tooltip, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { usePlayers } from '../../classes/TownController';
import useTownController from '../../hooks/useTownController';
import PlayerName from './PlayerName';
import { Item } from '../../types/CoveyTownSocket';

/**
 * Lists the current players in the town, along with the current town's name and ID
 *
 * See relevant hooks: `usePlayersInTown` and `useCoveyAppState`
 *
 */
export default function Inventory(): JSX.Element {
  //   const players = usePlayers();
  const townController = useTownController();

  const player = townController.ourPlayer;
  /*
  const [inventory, setInventory] = useState<Item[] | undefined>(player.inventory.items);

  useEffect(() => {
    const updateInventory = () => {
      setInventory(player.inventory.items);
    };
    townController.addListener('inventoryUpdated', updateInventory);

    return () => {
      townController.removeListener('inventoryUpdated', updateInventory);
    };
  }, [townController, player.inventory.items]);
*/
  //   const sorted = players.concat([]);
  //   sorted.sort((p1, p2) =>
  //     p1.userName.localeCompare(p2.userName, undefined, { numeric: true, sensitivity: 'base' }),
  //   );

  return (
    <VStack
      align='left'
      spacing={2}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      borderRadius='4px'>
      <Box>
        <Heading as='h2' fontSize='l'>
          Player Inventory:
        </Heading>
        <OrderedList>
          {player.inventory?.items.map(item => (
            <ListItem key={item.name}>{item.description}</ListItem>
          ))}
        </OrderedList>
      </Box>
    </VStack>
  );
}
