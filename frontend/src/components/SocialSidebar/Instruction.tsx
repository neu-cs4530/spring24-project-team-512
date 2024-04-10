import { Heading, VStack, UnorderedList, ListItem } from '@chakra-ui/react';
import React from 'react';

export default function Instruction(): JSX.Element {
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
        <ListItem>- Press space bar to interact or to view hint</ListItem>
      </UnorderedList>
    </VStack>
  );
}
