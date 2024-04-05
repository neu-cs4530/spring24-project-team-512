import { Heading, StackDivider, VStack, UnorderedList, ListItem } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';
import useTownController from '../../hooks/useTownController';

export default function Instruction(): JSX.Element {
  // const coveyTownController = useTownController();
  // const [inEscapeRoom, setInEscapeRoom] = useState(false);
  // useEffect(()=>{
  //   setInEscapeRoom(coveyTownController.ourPlayer.escapeRoom)
  // }, [coveyTownController.ourPlayer.escapeRoom])
  return (
    <VStack
      align='left'
      spacing={2}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      borderRadius='4px'>
      <Heading fontSize='xl' as='h1'>
        Game Instruction
      </Heading>
      <UnorderedList>
        <ListItem>- Use Arrow keys to move</ListItem>
        {/* {inEscapeRoom ? ( */}
        <ListItem>- Press space bar to interact or to view hint</ListItem>
        {/* ) : ""} */}
      </UnorderedList>
    </VStack>
  );
}
