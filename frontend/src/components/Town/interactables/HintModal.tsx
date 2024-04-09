import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import HintAreaInteractable from './HintArea';
import { get } from 'lodash';

export default function NewHintModal(): JSX.Element {
  const coveyTownController = useTownController();

  const hintDisplay = useInteractable<HintAreaInteractable>('hintArea');

  // const gameAreaController =
  //   useInteractableAreaController<EscapeRoomAreaController>(interactableID);

  const isOpen = hintDisplay !== undefined;

  const hints = {
    1: ['Count the Legs', 'The key to open the door is in the lockbox.'],
    2: [
      'Dont forget about your shrinking power!',
      'Youll need a key to unlock the exit door.',
      'The key is near the right edge of the room.',
      'Avoid any clones of yourself at all cost...',
    ],
    3: [
      'Youll a need a tool to find the key',
      'The key is hidden within the dirt.',
      'The man who once held the key was blind.',
    ],
  };

  useEffect(() => {
    if (hintDisplay) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, hintDisplay]);

  const closeModal = useCallback(() => {
    if (hintDisplay) {
      coveyTownController.interactEnd(hintDisplay);
    }
  }, [coveyTownController, hintDisplay]);

  function getHint(room: number) {
    if (room in hints) {
      const roomHints = hints[room as keyof typeof hints];
      const randomHintIndex = Math.floor(Math.random() * roomHints.length);
      return roomHints[randomHintIndex];
    }
    return '';
  }
  function displayHint(): React.ReactNode {
    let room: number;
    if (hintDisplay !== undefined) {
      room = hintDisplay?.displayHint() | 0;
    } else {
      room = 0;
    }
    return getHint(room);
  }

  //   const displayHint = useCallback(async () => {
  //     if (hintDisplay) {
  //       if (topic === '240') {
  //         coveyTownController.ourPlayer.placeItem({
  //           name: 'key',
  //           description: 'key for room 2',
  //           tile: '',
  //         });
  //         coveyTownController.ourPlayer.placeItem({
  //           name: 'flashlight',
  //           description: 'flashlight',
  //           tile: '',
  //         });
  //         // gameArea?.placeTile(1940, 1440);
  //         try {
  //           toast({
  //             title: 'That is correct!',
  //             status: 'success',
  //           });
  //           setTopic('');
  //           coveyTownController.unPause();
  //           closeModal();
  //         } catch (err) {
  //           if (err instanceof Error) {
  //             toast({
  //               title: 'That is Wrong!',
  //               description: err.toString(),
  //               status: 'error',
  //             });
  //           } else {
  //             console.trace(err);
  //             toast({
  //               title: 'Unexpected Error',
  //               status: 'error',
  //             });
  //           }
  //         }
  //       } else {
  //         try {
  //           toast({
  //             title: 'That is incorrect!',
  //             status: 'success',
  //           });
  //           setTopic('');
  //           coveyTownController.unPause();
  //           closeModal();
  //         } catch (err) {
  //           if (err instanceof Error) {
  //             toast({
  //               title: 'That is Wrong!',
  //               description: err.toString(),
  //               status: 'error',
  //             });
  //           } else {
  //             console.trace(err);
  //             toast({
  //               title: 'Unexpected Error',
  //               status: 'error',
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }, [topic, setTopic, coveyTownController, hintDisplay, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Hint</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{displayHint()}</ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
