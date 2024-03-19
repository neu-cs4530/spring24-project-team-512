import Item from './item'; // Assuming Item class is exported from item.ts

export class Inventory {
    private items: Item[];
    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.items = [];
    }

    addItem(item: Item): void {
        if (this.items.length < this.capacity) {
            this.items.push(item);
            //console.log(`${item.getName()} added to inventory.`);
        } else {
            throw Error("Inventory is full. Cannot add item.");
        }
    }

    removeItem(itemName: string): void {
        const index = this.items.findIndex(item => item.getName() === itemName);
        if (index !== -1) {
            const removedItem = this.items.splice(index, 1)[0];
            //console.log(`${removedItem.getName()} removed from inventory.`);
        } else {
            throw Error(`Item '${itemName}' not found in inventory.`);
        }
    }

    hasItem(itemName: string): boolean {
        return this.items.some(item => item.getName() === itemName);
    }


}