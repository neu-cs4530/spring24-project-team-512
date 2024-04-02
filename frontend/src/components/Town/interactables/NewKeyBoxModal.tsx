import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import EscapeRoomAreaController from '../../../classes/interactable/EscapeRoomAreaController';
import useTownController from '../../../hooks/useTownController';
import GameAreaInteractable from './GameArea';

export default function NewKeyBoxModal(): JSX.Element {
  const coveyTownController = useTownController();

  const keyBoxDisplay = useInteractable('keyBox');
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');

  // const gameAreaController =
  //   useInteractableAreaController<EscapeRoomAreaController>(interactableID);
  const [topic, setTopic] = useState<string>('');

  const isOpen = keyBoxDisplay !== undefined;

  useEffect(() => {
    if (keyBoxDisplay) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, keyBoxDisplay]);

  const closeModal = useCallback(() => {
    if (keyBoxDisplay) {
      coveyTownController.interactEnd(keyBoxDisplay);
    }
  }, [coveyTownController, keyBoxDisplay]);

  const toast = useToast();

  const enterCombination = useCallback(async () => {
    if (keyBoxDisplay) {
      if (topic === '240') {
        coveyTownController.ourPlayer.placeItem({
          name: 'key',
          description: 'key for room 2',
          tile: '',
        });
        coveyTownController.ourPlayer.placeItem({
          name: 'flashlight',
          description: 'key for room 2',
          tile: '',
        });
        // gameArea?.placeTile(1940, 1440);
        try {
          toast({
            title: 'That is correct!',
            status: 'success',
          });
          setTopic('');
          coveyTownController.unPause();
          closeModal();
        } catch (err) {
          if (err instanceof Error) {
            toast({
              title: 'That is Wrong!',
              description: err.toString(),
              status: 'error',
            });
          } else {
            console.trace(err);
            toast({
              title: 'Unexpected Error',
              status: 'error',
            });
          }
        }
      } else {
        try {
          toast({
            title: 'That is incorrect!',
            status: 'success',
          });
          setTopic('');
          coveyTownController.unPause();
          closeModal();
        } catch (err) {
          if (err instanceof Error) {
            toast({
              title: 'That is Wrong!',
              description: err.toString(),
              status: 'error',
            });
          } else {
            console.trace(err);
            toast({
              title: 'Unexpected Error',
              status: 'error',
            });
          }
        }
      }
    }
  }, [topic, setTopic, coveyTownController, keyBoxDisplay, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader> KeyBox </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            enterCombination();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='topic'>Combination</FormLabel>
              <Input
                id='topic'
                placeholder='Enter the correct combination'
                name='topic'
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={enterCombination}>
              Enter
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}