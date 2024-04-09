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
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import HintAreaInteractable from './HintArea';

export default function NewHintModal(): JSX.Element {
  const coveyTownController = useTownController();

  const hintDisplay = useInteractable<HintAreaInteractable>('hintArea');

  const isOpen = hintDisplay !== undefined;

  const hints: { [key: number]: string[] } = {
    1: [
      'There are 3 statues, the combination for the lockbox is 3 digits.',
      'Pay attention to the legs of the statues',
      'The key to open the door is in the lockbox.',
    ],
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

  const [hintIndices, setHintIndices] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
  });
  const [triggerHintUpdate, setTriggerHintUpdate] = useState(false);

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
      const hintIndex = hintIndices[room];
      return roomHints[hintIndex];
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

  useEffect(() => {
    if (hintDisplay && triggerHintUpdate) {
      const room = hintDisplay.displayHint() | 0;
      if (room in hints) {
        const hintIndex = hintIndices[room];
        const nextHintIndex = (hintIndex + 1) % hints[room].length;
        setHintIndices({ ...hintIndices, [room]: nextHintIndex });
      }
      setTriggerHintUpdate(false);
    }
  }, [hintDisplay, hintIndices, hints, triggerHintUpdate]);

  // When the "get hint" action is triggered, call this function
  function updateHint() {
    setTriggerHintUpdate(true);
  }

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
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={updateHint}>
            Next Hint
          </Button>
          <Button variant='ghost' onClick={closeModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
