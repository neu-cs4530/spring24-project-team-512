import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import EscapeLeaderboardComponent from './EscapeLeaderboardComponent';

export default function NewEscapeLBModal(): JSX.Element {
  const coveyTownController = useTownController();

  const lbDisplay = useInteractable('escapeLeaderboard');

  const isOpen = lbDisplay !== undefined;

  useEffect(() => {
    if (lbDisplay) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, lbDisplay]);

  const closeModal = useCallback(() => {
    if (lbDisplay) {
      coveyTownController.interactEnd(lbDisplay);
    }
  }, [coveyTownController, lbDisplay]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader> Escape Room Leaderboard </ModalHeader>
        <ModalCloseButton />
        <EscapeLeaderboardComponent />
      </ModalContent>
    </Modal>
  );
}
