import { Box, Heading, ListItem, OrderedList, Tooltip, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  useActiveInteractableAreas,
  useInteractable,
  useInteractableAreaController,
  usePlayers,
} from '../../classes/TownController';
import useTownController from '../../hooks/useTownController';
import PlayerName from './PlayerName';
import { InteractableID, Inventory, Item } from '../../types/CoveyTownSocket';
import EscapeRoomAreaController from '../../classes/interactable/EscapeRoomAreaController';
import GameAreaInteractable from '../Town/interactables/GameArea';

/**
 * Lists the current players in the town, along with the current town's name and ID
 *
 * See relevant hooks: `usePlayersInTown` and `useCoveyAppState`
 *
 */
export default function InventoryDisplay({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  //   const players = usePlayers();

  const townController = useTownController();
  const escapeRoomArea = useActiveInteractableAreas().filter(
    area => area.type === 'EscapeRoomArea',
  )[0];

  const gameArea = useInteractable<GameAreaInteractable>('gameArea');

  const gameAreaController =
    useInteractableAreaController<EscapeRoomAreaController>(interactableID);

  const player = townController.ourPlayer;

  const [inventory, setInventory] = useState<Inventory>(player.inventory);

  useEffect(() => {
    const updateInventory = () => {
      setInventory(player.inventory);
    };
    gameAreaController.addListener('inventoryUpdated', updateInventory);

    return () => {
      gameAreaController.removeListener('inventoryUpdated', updateInventory);
    };
  }, [gameAreaController, player]);

  // const sorted = players.concat([]);
  // sorted.sort((p1, p2) =>
  //   p1.userName.localeCompare(p2.userName, undefined, { numeric: true, sensitivity: 'base' }),
  // );

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
          {inventory.items.map(item => (
            <ListItem key={item.name}>{item.description}</ListItem>
          ))}
        </OrderedList>
      </Box>
    </VStack>
  );
}
