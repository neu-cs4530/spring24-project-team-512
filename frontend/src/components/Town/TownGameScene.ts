/* eslint-disable prettier/prettier */
import assert from 'assert';
import Phaser from 'phaser';
import PlayerController, { MOVEMENT_SPEED } from '../../classes/PlayerController';
import TownController from '../../classes/TownController';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import Interactable from './Interactable';
import ConversationArea from './interactables/ConversationArea';
import GameArea from './interactables/GameArea';
import Transporter from './interactables/Transporter';
import ViewingArea from './interactables/ViewingArea';
import PopUp from './interactables/PopUp';
import KeyBox from './interactables/KeyBox';
import HintArea from './interactables/HintArea';
import EscapeLeaderboard from './interactables/EscapeLeaderboard';
import { addTime } from './EscapeRoomDB';

// Still not sure what the right type is here... "Interactable" doesn't do it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interactableTypeForObjectType(type: string): any {
  if (type === 'ConversationArea') {
    return ConversationArea;
  } else if (type === 'Transporter') {
    return Transporter;
  } else if (type === 'PopUp') {
    return PopUp;
  } else if (type === 'ViewingArea') {
    return ViewingArea;
  } else if (type === 'GameArea') {
    return GameArea;
  } else if (type === 'KeyBox') {
    return KeyBox;
  } else if (type === 'HintArea') {
    return HintArea;
  } else if (type === 'EscapeLeaderboard') {
    return EscapeLeaderboard;
  } else {
    throw new Error(`Unknown object type: ${type}`);
  }
}

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
export default class TownGameScene extends Phaser.Scene {
  private _pendingOverlapExits = new Map<Interactable, () => void>();

  addOverlapExit(interactable: Interactable, callback: () => void) {
    this._pendingOverlapExits.set(interactable, callback);
  }

  private _players: PlayerController[] = [];

  private _interactables: Interactable[] = [];

  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  public _renderTexture?: Phaser.GameObjects.RenderTexture;

  private _aiCharacter?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private _shovelSprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private _previouslyCapturedKeys: number[] = [];

  private _lastLocation?: PlayerLocation;

  private _ready = false;

  private _paused = false;

  public coveyTownController: TownController;

  private _onGameReadyListeners: Callback[] = [];

  private _mDown?: Phaser.Input.Keyboard.Key;

  private _fDown?: Phaser.Input.Keyboard.Key;

  private _xDown?: Phaser.Input.Keyboard.Key;

  private _realTime: number;

  private _timer?: Phaser.Time.TimerEvent;

  private _timerText?: Phaser.GameObjects.Text;

  /**
   * Layers that the player can collide with.
   */
  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _gameIsReady = new Promise<void>(resolve => {
    if (this._ready) {
      resolve();
    } else {
      this._onGameReadyListeners.push(resolve);
    }
  });

  public get gameIsReady() {
    return this._gameIsReady;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
  }

  private _resourcePathPrefix: string;

  constructor(coveyTownController: TownController, resourcePathPrefix = '') {
    super('TownGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.coveyTownController = coveyTownController;
    this._players = this.coveyTownController.players;
    this._realTime = 0;
  }

  updateTime() {
    // Update timer text with elapsed time
    this._realTime += (this._timer === undefined ? 0 : this._timer.getElapsed() / 1000);
    this._timerText?.setText(this._realTime?.toFixed(2));
  }

  preload() {
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.image(
      '22_Museum_32x32',
      this._resourcePathPrefix + '/assets/tilesets/22_Museum_32x32.png',
    );
    this.load.image(
      '5_Classroom_and_library_32x32',
      this._resourcePathPrefix + '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );

    this.load.image('Graveyard', this._resourcePathPrefix + '/assets/tilesets/Graveyard.png');
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      '1_Generic_32x32',
      this._resourcePathPrefix + '/assets/tilesets/1_Generic_32x32.png',
    );
    // this.load.json('Graveyard', this._resourcePathPrefix + '/assets/tilesets/Graveyard.json');
    this.load.image(
      '13_Conference_Hall_32x32',
      this._resourcePathPrefix + '/assets/tilesets/13_Conference_Hall_32x32.png',
    );
    this.load.image(
      '14_Basement_32x32',
      this._resourcePathPrefix + '/assets/tilesets/14_Basement_32x32.png',
    );
    this.load.image(
      '16_Grocery_store_32x32',
      this._resourcePathPrefix + '/assets/tilesets/16_Grocery_store_32x32.png',
    );
    this.load.image('mask', this._resourcePathPrefix + '/assets/mask1.png');

    this.load.tilemapTiledJSON('map', this._resourcePathPrefix + '/assets/tilemaps/indoors.json');

    // this.load.image('opponent', 'assets/character-sprite.png');

    this.load.image('shovel', this._resourcePathPrefix + '/assets/shovel.png');

    this.load.atlas(
      'atlas',
      this._resourcePathPrefix + '/assets/atlas/atlas.png',
      this._resourcePathPrefix + '/assets/atlas/atlas.json',
    );
  }

  updatePlayers(players: PlayerController[]) {
    //Make sure that each player has sprites
    players.map(eachPlayer => this.createPlayerSprites(eachPlayer));

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );

    disconnectedPlayers.forEach(disconnectedPlayer => {
      if (disconnectedPlayer.gameObjects) {
        const { sprite, label } = disconnectedPlayer.gameObjects;
        if (sprite && label) {
          sprite.destroy();
          label.destroy();
        }
      }
    });
    // Remove disconnected players from list
    this._players = players;
  }

  getNewMovementDirection() {
    if (this._cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this._cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this._cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this._cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  moveAI() {
    // Randomly choose a direction to move
    // const wall1 = this.map.findObject(
    //   'Objects',
    //   obj => obj.name === 'Room2 wall 1',
    // ) as Phaser.Types.Tilemaps.TiledObject;
    // const wall2 = this.map.findObject(
    //   'Objects',
    //   obj => obj.name === 'Room2 wall 2',
    // ) as Phaser.Types.Tilemaps.TiledObject;

    if (this._aiCharacter && this._aiCharacter.x >= 1550) {
      this._aiCharacter.setVelocityX(-MOVEMENT_SPEED / 2); // Move left
      this._aiCharacter.anims.play('misa-left-walk, true');
      this._aiCharacter.setTexture('atlas', 'misa-left');
    }
    if (this._aiCharacter && this._aiCharacter.x <= 1050) {
      this._aiCharacter.setVelocityX(MOVEMENT_SPEED / 2); // Move right
      this._aiCharacter.anims.play('misa-right-walk, true');
      this._aiCharacter.setTexture('atlas', 'misa-right');
    }
  }

  inRoom1(): boolean {
    this._shovelSprite?.setVisible(true);
    const room1 = this.map.findObject(
      'Objects',
      obj => obj.name === 'Room1',
    ) as Phaser.Types.Tilemaps.TiledObject;
    if (room1.x && room1.y && room1.height && room1.width) {
      if (
        this.coveyTownController.ourPlayer.location.x < room1.x + room1.width &&
        this.coveyTownController.ourPlayer.location.x > room1.x &&
        this.coveyTownController.ourPlayer.location.y > room1.y &&
        this.coveyTownController.ourPlayer.location.y < room1.y + room1.height
      ) {
        return true;
      }
      return false;
    }
    return false;
  }

  inRoom2(): boolean {
    const room2 = this.map.findObject(
      'Objects',
      obj => obj.name === 'Room2',
    ) as Phaser.Types.Tilemaps.TiledObject;
    if (room2.x && room2.y && room2.height && room2.width) {
      if (
        this.coveyTownController.ourPlayer.location.x < room2.x + room2.width &&
        this.coveyTownController.ourPlayer.location.x > room2.x &&
        this.coveyTownController.ourPlayer.location.y > room2.y &&
        this.coveyTownController.ourPlayer.location.y < room2.y + room2.height
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  inRoom3(): boolean {
    const room3 = this.map.findObject(
      'Objects',
      obj => obj.name === 'Room3',
    ) as Phaser.Types.Tilemaps.TiledObject;
    if (room3.x && room3.y && room3.height && room3.width) {
      if (
        this.coveyTownController.ourPlayer.location.x < room3.x + room3.width &&
        this.coveyTownController.ourPlayer.location.x > room3.x &&
        this.coveyTownController.ourPlayer.location.y > room3.y &&
        this.coveyTownController.ourPlayer.location.y < room3.y + room3.height
      ) {
        return true;
      }
      return false;
    }
    return false;
  }

  inRoomReturn() {
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;

    const roomReturn = this.map.findObject(
      'Objects',
      obj => obj.name === 'Room Return',
    ) as Phaser.Types.Tilemaps.TiledObject;
    if (gameObjects && roomReturn.x && roomReturn.y && roomReturn.height && roomReturn.width) {
      if (
        this.coveyTownController.ourPlayer.location.x < roomReturn.x + roomReturn.width + 50 &&
        this.coveyTownController.ourPlayer.location.x > roomReturn.x - 50 &&
        this.coveyTownController.ourPlayer.location.y > roomReturn.y - 50 &&
        this.coveyTownController.ourPlayer.location.y < roomReturn.y + roomReturn.height + 50
      ) {

        this.coveyTownController.ourPlayer.escapeRoom = false;
        this.coveyTownController.ourPlayer.emit('escapeRoomStatus', this.coveyTownController.ourPlayer.escapeRoom)

        this._timer?.destroy();
        this._timerText?.destroy();

        if (this.coveyTownController.ourPlayer.inventory.items.find(item => item.name === 'Basement Key')) {
          this.coveyTownController.ourPlayer.completed = true;
          addTime(this.coveyTownController.ourPlayer.userName, this._realTime);
        }

        this.coveyTownController.ourPlayer.inventory = { items: [], length: 0, capacity: 10 };

        this.coveyTownController.ourPlayer.emit('inventoryUpdated', this.coveyTownController.ourPlayer.inventory);

        const gameAreaController = this.coveyTownController.gameAreas.find(area => area.id === 'Escape Room 1');
        gameAreaController?.leaveGame();
      }
    }
  }

  // eraseMask(renderTexture: Phaser.GameObjects.RenderTexture) {
  //   const cam = this.cameras.main;
  //   if (
  //     this.coveyTownController.ourPlayer.inventory.items.find(
  //       item => item.name === 'flashlight',
  //     ) !== undefined
  //   ) {
  //     renderTexture.erase(
  //       'mask',
  //       this.coveyTownController.ourPlayer.location.x - 80 - cam.scrollX,
  //       this.coveyTownController.ourPlayer.location.y - 80 - cam.scrollY,
  //     );
  //   }
  // }
  inEscapeRoom(): boolean {
    return this.inRoom1() || this.inRoom2() || this.inRoom3();
  }

  moveOurPlayerTo(destination: Partial<PlayerLocation>, override?: boolean) {
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (gameObjects) {
      if (
        (this.inRoom1() &&
          this.coveyTownController.ourPlayer.inventory.items.find(
            item => item.name === 'Room 2 Key',
          ) === undefined &&
          override === undefined) ||
        (this.inRoom2() &&
          this.coveyTownController.ourPlayer.inventory.items.find(
            item => item.name === 'Room 3 Key',
          ) === undefined &&
          override === undefined) ||
        (this.inRoom3() &&
          this.coveyTownController.ourPlayer.inventory.items.find(
            item => item.name === 'Basement Key',
          ) === undefined &&
          override === undefined)
      ) {
        return;
      }
    }
    // if (
    //   player.location.x < room2.x + room2.width &&
    //   player.location.x > room2.x &&
    //   player.location.y > room2.y &&
    //   player.location.y < room2.y + room2.height
    // ) {

    if (!gameObjects) {
      throw new Error('Unable to move player without game objects created first');
    }
    if (!this._lastLocation) {
      this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
    }
    if (destination.x !== undefined) {
      gameObjects.sprite.x = destination.x;
      this._lastLocation.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.sprite.y = destination.y;
      this._lastLocation.y = destination.y;
    }
    if (destination.moving !== undefined) {
      this._lastLocation.moving = destination.moving;
    }
    if (destination.rotation !== undefined) {
      this._lastLocation.rotation = destination.rotation;
    }
    this.coveyTownController.emitMovement(this._lastLocation);
  }

  escapeRoomStart(destination: Partial<PlayerLocation>) {
    for (const player of this._players) {
      // if (!this._lastLocation) {
      //   this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
      // }
      if (player.escapeRoom) {
        if (destination.x !== undefined && destination.y !== undefined) {
          // gameObjects.sprite.x = destination.x;

          player.location.x = destination.x;
          player.location.y = destination.y;
        }
      }
    }
  }

  update() {
    if (this.inEscapeRoom() && this._timer === undefined) {
      this._timerText = this.add.text(700, 25, '0', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(30);
      
      // Create timer event
      this._timer = this.time.addEvent({
          delay: 10,
          callback: this.updateTime,
          callbackScope: this,
          loop: true
      });
    }

    // Check if player is colliding with shovelsprite 
    if (this._shovelSprite) {
      const shovel = this._shovelSprite;
      if (
        (this.coveyTownController.ourPlayer.location.x < shovel.x + shovel.width + 20 &&
        this.coveyTownController.ourPlayer.location.x > shovel.x &&
        this.coveyTownController.ourPlayer.location.y > shovel.y &&
        this.coveyTownController.ourPlayer.location.y < shovel.y + shovel.height + 20)
      ) {
        // If our player touches the shovel, push it to their inventory and remove the sprite
        this.coveyTownController.ourPlayer.placeItem({
          name: 'Shovel',
          description: 'Shovel',
          tile: '',
        });
        this._shovelSprite.setVisible(false);
        this._shovelSprite.destroy();
        const gameAreaController = this.coveyTownController.gameAreas.find(
          eachArea => eachArea.id == 'Escape Room 1');
        // Use phaser to remove the shovel tile
        //this.map.removeTileAt(shovel.x, shovel.y, true, true, 2);
        gameAreaController?.emit(
          'inventoryUpdated',
          this.coveyTownController.ourPlayer.inventory,
        );
      }
    }

    if (this._paused) {
      
      if (this._xDown?.isDown && this.inEscapeRoom()) {
        this.moveOurPlayerTo({ rotation: 'front', moving: false, x: 3464, y: 800 });
      }
      this.moveAI();
      for (const player of this._players) {
        if (
          this._aiCharacter &&
          Math.abs(player.location.x - this._aiCharacter.x) <= 80 &&
          Math.abs(player.location.y - this._aiCharacter.y) <= 80
        ) {
          this._aiCharacter.setVisible(true);
        }
        if (
          this._aiCharacter &&
          Math.abs(player.location.x - this._aiCharacter.x) <= 5 &&
          Math.abs(player.location.y - this._aiCharacter.y) <= 45
        ) {
          this.moveOurPlayerTo({ rotation: 'front', moving: false, x: 2040, y: 1370 });
        }
      }
      return;
    }

    if (this.inEscapeRoom()) {
      this.coveyTownController.ourPlayer.escapeRoom = true;
      this.coveyTownController.ourPlayer.emit('escapeRoomStatus', this.coveyTownController.ourPlayer.escapeRoom)
    }
    //moves the opponent around room 2
    this.moveAI();
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (gameObjects && this._cursors) {
      const prevVelocity = gameObjects.sprite.body.velocity.clone();
      const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);
      //Update the location for the labels of all of the other players
      //option to escape room
      if (this._xDown?.isDown && this.inEscapeRoom()) {
        this._renderTexture?.clear();
        this.moveOurPlayerTo({ rotation: 'front', moving: false, x: 3464, y: 800 }, true);
      }
      for (const player of this._players) {
        if (player.gameObjects?.label && player.gameObjects?.sprite.body) {
          player.gameObjects.label.setX(player.gameObjects.sprite.body.x);
          player.gameObjects.label.setY(player.gameObjects.sprite.body.y - 20);

          //  Draw the spotlight on the player
          const cam = this.cameras.main;

          const room2 = this.map.findObject(
            'Objects',
            obj => obj.name === 'Room2',
          ) as Phaser.Types.Tilemaps.TiledObject;
          const room3Key = this.map.findObject(
            'Objects',
            obj => obj.name === 'Room3Key',
          ) as Phaser.Types.Tilemaps.TiledObject;

          if (room3Key.x && room3Key.y && room3Key.height && room3Key.width) {
            if (
              this.coveyTownController.ourPlayer.location.x < room3Key.x + room3Key.width &&
              this.coveyTownController.ourPlayer.location.x > room3Key.x &&
              this.coveyTownController.ourPlayer.location.y > room3Key.y &&
              this.coveyTownController.ourPlayer.location.y < room3Key.y + room3Key.height
            ) {
       
              this.coveyTownController.ourPlayer.placeItem({
                name: 'Room 3 Key',
                description: 'Room 3 Key',
                tile: '',
              });

              this.coveyTownController.ourPlayer.emit(
                'inventoryUpdated',
                this.coveyTownController.ourPlayer.inventory,
              );
            }
          }

          
          const grave1 = this.map.findObject(
            'Objects',
            obj => obj.name === 'Grave1',
          ) as Phaser.Types.Tilemaps.TiledObject;
          const grave2 = this.map.findObject(
            'Objects',
            obj => obj.name === 'Grave2',
          ) as Phaser.Types.Tilemaps.TiledObject;
          const grave3 = this.map.findObject(
            'Objects',
            obj => obj.name === 'Grave3',
          ) as Phaser.Types.Tilemaps.TiledObject;
          const grave4 = this.map.findObject(
            'Objects',
            obj => obj.name === 'Grave4',
          ) as Phaser.Types.Tilemaps.TiledObject;

          // If the player is standing on on a grave, has the shovel, and presses F, they dig
          // If they dig on grave4, they get the room4key

          if (grave4.x && grave4.y && grave4.height && grave4.width) {
            if (
              this.coveyTownController.ourPlayer.location.x < grave4.x + grave4.width &&
              this.coveyTownController.ourPlayer.location.x > grave4.x &&
              this.coveyTownController.ourPlayer.location.y > grave4.y &&
              this.coveyTownController.ourPlayer.location.y < grave4.y + grave4.height
            ) {
              if (
                this._fDown?.isDown &&
                this.coveyTownController.ourPlayer.inventory.items.find(
                  item => item.name === 'Shovel',
                ) !== undefined
              ) {
                const gameAreaController = this.coveyTownController.gameAreas.find(
                  eachArea => eachArea.id == 'Escape Room 1',
                );
                this.coveyTownController.ourPlayer.placeItem({
                  name: 'Basement Key',
                  description: 'Basement Key',
                  tile: '',
                });

                gameAreaController?.emit(
                  'inventoryUpdated',
                  this.coveyTownController.ourPlayer.inventory,
                );

            // Create a new text object at the player's location
            const toast = this.add.text(
              this.coveyTownController.ourPlayer.location.x,
              this.coveyTownController.ourPlayer.location.y,
              'You dug up a key!',
              { fontSize: '16px', color: '#fff' }
            );

            // Create a new tween that fades out the text object over 2 seconds
            this.tweens.add({
              targets: toast,
              alpha: 0,
              duration: 2000,
              onComplete: () => toast.destroy(), // Destroy the text object when the tween completes
            });
              }
            }
          }

          // Do the same for the other graves, but the message tells them they didnt find anything
          for (const grave of [grave1, grave2, grave3]) {
            if (grave.x && grave.y && grave.height && grave.width) {
              if (
                this.coveyTownController.ourPlayer.location.x < grave.x + grave.width &&
                this.coveyTownController.ourPlayer.location.x > grave.x &&
                this.coveyTownController.ourPlayer.location.y > grave.y &&
                this.coveyTownController.ourPlayer.location.y < grave.y + grave.height
              ) {
                if (this._fDown?.isDown) {
                  const toast = this.add.text(
                    this.coveyTownController.ourPlayer.location.x,
                    this.coveyTownController.ourPlayer.location.y,
                    'You didn\'t find anything.',
                    { fontSize: '16px', color: '#fff' }
                  );

                  this.tweens.add({
                    targets: toast,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => toast.destroy(),
                  });
                }
              }
            }
          }


          if (player.inventory.items.find(item => item.name === 'basement key') !== undefined) {
            player.completed = true;
          }
          if (room2.x && room2.y && this.inRoom2()) {
            this._aiCharacter?.setVisible(false);
            // this.map.removeTileAt(player.location.x, player.location.y, true, true, 'Above Player');

            // this._collidingLayers[2].tileAt(player.location.x, player.location.y, null);
            //  Clear the
            this._renderTexture?.clear();

            // //  Fill it in black
            this._renderTexture?.fill(
              0x000000,
              1,
              room2.x - cam.scrollX,
              room2.y - cam.scrollY - 200,
              this.scale.width,
              this.scale.height + 1000,
            );
            if (
              player.inventory.items.find(item => item.name === 'Shrinker') !== undefined &&
              this._mDown?.isDown
            ) {
              this.coveyTownController.ourPlayer.gameObjects?.sprite.setDisplaySize(10, 10);
            }
            if (this._mDown?.isUp) {
              this.coveyTownController.ourPlayer.gameObjects?.sprite.setDisplaySize(40, 50);
            }

            // Clear the graphics object if needed
            //  Erase the 'mask' texture from it based on the player position
            //  We - 107, because the mask image is 213px wide, so this puts it on the middle of the player
            //  We then minus the scrollX/Y values, because the RenderTexture is pinned to the screen and doesn't scroll
            // if (player.inventory.items.find(item => item.name === 'flashlight') !== undefined) {
            this._renderTexture?.erase(
              'mask',
              player.location.x - 80 - cam.scrollX,
              player.location.y - 80 - cam.scrollY,
            );
            // }
          }
          if (
            this._aiCharacter &&
            Math.abs(player.location.y - this._aiCharacter.y) <= 80 &&
            Math.abs(player.location.x - this._aiCharacter.x) <= 80
          ) {
            this._aiCharacter.setVisible(true);
          }
          if (
            this._aiCharacter &&
            Math.abs(player.location.x - this._aiCharacter.x) <= 5 &&
            Math.abs(player.location.y - this._aiCharacter.y) <= 45
          ) {
            this.moveOurPlayerTo({ rotation: 'front', moving: false, x: 2040, y: 1370 });
          }

          if (this.inRoom3()) {
            this._renderTexture?.clear();
          }
        }
        this.inRoomReturn();
      }
      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-left-walk', true);
          break;
        case 'right':
          body.setVelocityX(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-right-walk', true);
          break;
        case 'front':
          body.setVelocityY(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-front-walk', true);
          break;
        case 'back':
          body.setVelocityY(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-back-walk', true);
          break;
        default:
          // Not moving
          gameObjects.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-left');
          } else if (prevVelocity.x > 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-right');
          } else if (prevVelocity.y < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-back');
          } else if (prevVelocity.y > 0) gameObjects.sprite.setTexture('atlas', 'misa-front');
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      gameObjects.sprite.body.velocity.normalize().scale(MOVEMENT_SPEED);

      const isMoving = primaryDirection !== undefined;
      gameObjects.label.setX(body.x);
      gameObjects.label.setY(body.y - 20);
      const x = gameObjects.sprite.getBounds().centerX;
      const y = gameObjects.sprite.getBounds().centerY;
      //Move the sprite
      if (
        !this._lastLocation ||
        (isMoving && this._lastLocation.rotation !== primaryDirection) ||
        this._lastLocation.moving !== isMoving
      ) {
        if (!this._lastLocation) {
          this._lastLocation = {
            x,
            y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this._lastLocation.x = x;
        this._lastLocation.y = y;
        this._lastLocation.rotation = primaryDirection || this._lastLocation.rotation || 'front';
        this._lastLocation.moving = isMoving;
        this._pendingOverlapExits.forEach((cb, interactable) => {
          if (
            !Phaser.Geom.Rectangle.Overlaps(
              interactable.getBounds(),
              gameObjects.sprite.getBounds(),
            )
          ) {
            this._pendingOverlapExits.delete(interactable);
            cb();
          }
        });
        this.coveyTownController.emitMovement(this._lastLocation);
      }
    }
  }

  private _map?: Phaser.Tilemaps.Tilemap;

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  getInteractables(): Interactable[] {
    const typedObjects = this.map.filterObjects('Objects', obj => obj.type !== '');
    assert(typedObjects);
    const gameObjects = this.map.createFromObjects(
      'Objects',
      typedObjects.map(obj => ({
        id: obj.id,
        classType: interactableTypeForObjectType(obj.type),
      })),
    );

    return gameObjects as Interactable[];
  }

  create() {

    this._map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
         tileset image in Phaser's cache (i.e. the name you used in preload)
         */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      'Graveyard',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32',
    ].map(v => {
      const ret = this.map.addTilesetImage(v);
      assert(ret);
      return ret;
    });

    this._collidingLayers = [];
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer('Below Player', tileset, 0, 0);
    assert(belowLayer);
    belowLayer.setDepth(-10);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = this.map.createLayer('On The Walls', tileset, 0, 0);
    assert(wallsLayer);
    assert(onTheWallsLayer);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = this.map.createLayer('World', tileset, 0, 0);
    assert(worldLayer);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = this.map.createLayer('Above Player', tileset, 0, 0);
    assert(aboveLayer);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = this.map.createLayer('Very Above Player', tileset, 0, 0);
    assert(veryAboveLayer);
    /* By default, everything gets depth sorted on the screen in the order we created things.
         Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
         it a depth. Higher depths will sit on top of lower depth objects.
         */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);
    //add M and F for flashlight and mushrooms
    this._mDown = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this._fDown = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this._xDown = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    //add the spawn point for the opponent in room 2
    const oppSpawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Opp Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });
    assert(this.input.keyboard);
    this._cursorKeys = this.input.keyboard.createCursorKeys();
    this._cursors.push(this._cursorKeys);
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.H,
          down: Phaser.Input.Keyboard.KeyCodes.J,
          left: Phaser.Input.Keyboard.KeyCodes.K,
          right: Phaser.Input.Keyboard.KeyCodes.L,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24)
      .setDepth(6);
    const label = this.add
      .text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
        font: '18px monospace',
        color: '#000000',
        // padding: {x: 20, y: 10},
        backgroundColor: '#ffffff',
      })
      .setDepth(6);
    this.coveyTownController.ourPlayer.gameObjects = {
      sprite,
      label,
      locationManagedByGameScene: true,
    };

    this._shovelSprite = this.physics.add
      .sprite(278, 1984, 'shovel')
      .setSize(30, 30)
      .setOffset(0, 0)
      .setDepth(6);

    this._aiCharacter = this.physics.add
      .sprite(oppSpawnPoint.x, oppSpawnPoint.y, 'atlas', 'misa-left')
      .setSize(30, 40)
      .setOffset(0, 24)
      .setDepth(6);

    this._interactables = this.getInteractables();

    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this._collidingLayers.push(worldLayer);
    this._collidingLayers.push(wallsLayer);
    this._collidingLayers.push(aboveLayer);
    this._collidingLayers.push(onTheWallsLayer);
    this._collidingLayers.forEach(layer => {
      this.physics.add.collider(sprite, layer);
    });
    this._collidingLayers.forEach(layer => {
      if (this._aiCharacter) {
        this.physics.add.collider(this._aiCharacter, layer);
      }
      if (this._shovelSprite) {
        this.physics.add.collider(this._shovelSprite, layer);
      }
    });


    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.coveyTownController.ourPlayer.gameObjects.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this._renderTexture = this.add.renderTexture(0, 0, this.scale.width, this.scale.height);
    //  Make sure it doesn't scroll with the camera
    this._renderTexture.setOrigin(0, 0);
    this._renderTexture.setScrollFactor(0, 0);
    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);
    this._ready = true;
    this.updatePlayers(this.coveyTownController.players);
    // Call any listeners that are waiting for the game to be initialized
    this._onGameReadyListeners.forEach(listener => listener());
    this._onGameReadyListeners = [];
    this.coveyTownController.addListener('playersChanged', players => this.updatePlayers(players));
  }

  createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, 'atlas', 'misa-front')
        .setSize(30, 40)
        .setOffset(0, 24);
      const label = this.add.text(
        player.location.x,
        player.location.y - 20,
        player === this.coveyTownController.ourPlayer ? '(You)' : player.userName,
        {
          font: '18px monospace',
          color: '#000000',
          // padding: {x: 20, y: 10},
          backgroundColor: '#ffffff',
        },
      );
      player.gameObjects = {
        sprite,
        label,
        locationManagedByGameScene: false,
      };
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }

  pause() {
    if (!this._paused) {
      this._paused = true;
      const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
      if (gameObjects) {
        gameObjects.sprite.anims.stop();
        const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
      }
      assert(this.input.keyboard);
      this._previouslyCapturedKeys = this.input.keyboard.getCaptures();
      this.input.keyboard.clearCaptures();
    }
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      if (this.input && this.input.keyboard) {
        this.input.keyboard.addCapture(this._previouslyCapturedKeys);
      }
      this._previouslyCapturedKeys = [];
    }
  }
}
