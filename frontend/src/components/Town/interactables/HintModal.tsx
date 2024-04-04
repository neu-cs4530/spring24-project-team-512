import {
  Button,
  Modal,
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

export default function NewHintModal(): JSX.Element {
  const coveyTownController = useTownController();

  const hintDisplay = useInteractable<HintAreaInteractable>('hintArea');

  // const gameAreaController =
  //   useInteractableAreaController<EscapeRoomAreaController>(interactableID);

  const isOpen = hintDisplay !== undefined;

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

  function displayHint(): React.ReactNode {
    let room: number;
    if (hintDisplay !== undefined) {
      room = hintDisplay?.displayHint() | 0;
    } else {
      room = 0;
    }
    if (room === 1) {
      return 'Count the legs';
    }
    if (room === 2) {
      return 'exit is near the top of the screen';
    }
    if (room === 3) {
      return 'dig up grave 2';
    }
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
        <ModalHeader> {displayHint()} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
          }}>
          <ModalFooter>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
