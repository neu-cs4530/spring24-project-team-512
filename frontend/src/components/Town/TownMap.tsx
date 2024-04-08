import React from 'react';
import Phaser from 'phaser';
import { useEffect } from 'react';
import useTownController from '../../hooks/useTownController';
import SocialSidebar from '../SocialSidebar/SocialSidebar';
import NewConversationModal from './interactables/NewCoversationModal';
import NewKeyBoxModal from './interactables/NewKeyBoxModal';
import NewHintModal from './interactables/HintModal';
import TownGameScene from './TownGameScene';
import GameAreaWrapper from './interactables/GamesArea';
import useChatContext from '../VideoCall/VideoFrontend/hooks/useChatContext/useChatContext';
import ChatWindow from '../VideoCall/VideoFrontend/components/ChatWindow/ChatWindow';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Instruction from '../SocialSidebar/Instruction';
import InventoryDisplay from '../SocialSidebar/Inventory';
import { useActiveInteractableAreas, useInteractable } from '../../classes/TownController';
import GameAreaInteractable from './interactables/GameArea';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chatWindowContainer: {
      'pointerEvents': 'auto',
      'background': '#FFFFFF',
      'zIndex': 1000,
      'display': 'flex',
      'flexDirection': 'column',
      'borderLeft': '1px solid #E4E7E9',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
      'position': 'fixed',
      'bottom': 0,
      'left': 0,
      'top': 0,
      'max-width': '250px',
    },
    hide: {
      display: 'none',
    },
  }),
);

export default function TownMap(): JSX.Element {
  const coveyTownController = useTownController();
  const { isChatWindowOpen } = useChatContext();
  const classes = useStyles();

  const gameArea = useInteractable<GameAreaInteractable>('gameArea');

  const DisplayInventory = () => {
    if (
      useActiveInteractableAreas().find(
        area => area.toInteractableAreaModel().type === 'EscapeRoomArea',
      ) !== undefined
    ) {
      console.log(gameArea);
      // console.log('game area id', gameArea.id);

      return <InventoryDisplay interactableID={'Escape Room 1'} />;
    } else {
      return;
    }
  };
  function DisplaySideBar(): React.ReactNode {
    if (coveyTownController.ourPlayer.escapeRoom === false) {
      return <SocialSidebar />;
    } else {
      return;
    }
  }
  function DisplayInstruction(): React.ReactNode {
    if (coveyTownController.ourPlayer.escapeRoom === true) {
      return <Instruction />;
    } else {
      return;
    }
  }
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      parent: 'map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      scale: {
        expandParent: false,
        mode: Phaser.Scale.ScaleModes.WIDTH_CONTROLS_HEIGHT,
        autoRound: true,
      },
      width: 800,
      height: 600,
      fps: { target: 30 },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    const newGameScene = new TownGameScene(coveyTownController);
    game.scene.add('coveyBoard', newGameScene, true);
    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    coveyTownController.addListener('pause', pauseListener);
    coveyTownController.addListener('unPause', unPauseListener);

    return () => {
      coveyTownController.removeListener('pause', pauseListener);
      coveyTownController.removeListener('unPause', unPauseListener);
      game.destroy(true);
    };
  }, [coveyTownController]);

  return (
    <div id='app-container'>
      <NewConversationModal />
      <NewKeyBoxModal />
      <NewHintModal />
      <GameAreaWrapper />
      <aside className={clsx(classes.chatWindowContainer, { [classes.hide]: !isChatWindowOpen })}>
        <ChatWindow />
      </aside>

      <div id='map-container' />
      <div id='social-container'>
        {DisplayInstruction()}
        {DisplayInventory()}
        {DisplaySideBar()}
      </div>
    </div>
  );
}
