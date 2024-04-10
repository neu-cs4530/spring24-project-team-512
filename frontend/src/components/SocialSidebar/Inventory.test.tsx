import { nanoid } from 'nanoid';
import PlayerController from '../../classes/PlayerController';
import { Inventory, Item, PlayerLocation } from '../../types/CoveyTownSocket';

function createInventoryForTesting(params: {
  items: Item[];
  length: number;
  capacity: number;
}): Inventory {
  const inventory = {
    items: params.items,
    length: params.length,
    capacity: params.capacity,
  };
  return inventory;
}

describe('Inventory', () => {
  const randomLocation = (): PlayerLocation => ({
    moving: Math.random() < 0.5,
    rotation: 'front',
    x: Math.random() * 1000,
    y: Math.random() * 1000,
  });

  let players: PlayerController[] = [];
  beforeEach(() => {
    players = [];
    for (let i = 0; i < 10; i += 1) {
      players.push(
        new PlayerController(
          `testingPlayerID${i}-${nanoid()}`,
          `testingPlayerUser${i}-${nanoid()}}`,
          randomLocation(),
        ),
      );
    }
  });
  it('should be empty upon creation', () => {
    const inventory = createInventoryForTesting({ items: [], length: 0, capacity: 10 });
    expect(inventory.items.length).toBe(0);
    expect(inventory.length).toBe(0);
    expect(inventory.capacity).toBe(10);
  });
  it('should correctly add an item', () => {
    players[0].inventory = createInventoryForTesting({ items: [], length: 0, capacity: 10 });
    expect(players[0].inventory.items.length).toBe(0);
    expect(players[0].inventory.length).toBe(0);
    expect(players[0].inventory.capacity).toBe(10);
    players[0].placeItem({ name: 'item', description: 'item', tile: '' });
    expect(players[0].inventory.items.length).toBe(1);
    expect(players[0].inventory.length).toBe(1);
    expect(players[0].inventory.capacity).toBe(10);
  });
  it('should correctly clear the inventory', () => {
    players[0].inventory = createInventoryForTesting({ items: [], length: 0, capacity: 10 });
    expect(players[0].inventory.items.length).toBe(0);
    expect(players[0].inventory.length).toBe(0);
    expect(players[0].inventory.capacity).toBe(10);
    players[0].placeItem({ name: 'item', description: 'item', tile: '' });
    expect(players[0].inventory.items.length).toBe(1);
    expect(players[0].inventory.length).toBe(1);
    expect(players[0].inventory.capacity).toBe(10);
    players[0].inventory = { items: [], length: 0, capacity: 10 };
    expect(players[0].inventory.items.length).toBe(0);
  });
  it('should not add item if over capacity', () => {
    players[0].inventory = createInventoryForTesting({ items: [], length: 0, capacity: 10 });
    for (let i = 0; i < 15; i++) {
      const item: string = 'item' + i;
      players[0].placeItem({ name: item, description: 'item', tile: '' });
    }
    expect(players[0].inventory.items.length).toBe(10);
    expect(players[0].inventory.length).toBe(10);
    expect(players[0].inventory.capacity).toBe(10);
  });
  it('should not add item if already in inventory', () => {
    players[0].inventory = createInventoryForTesting({ items: [], length: 0, capacity: 10 });
    players[0].placeItem({ name: 'item', description: 'item', tile: '' });
    players[0].placeItem({ name: 'item', description: 'item', tile: '' });
    expect(players[0].inventory.items.length).toBe(1);
    expect(players[0].inventory.length).toBe(1);
    expect(players[0].inventory.capacity).toBe(10);
  });
});
