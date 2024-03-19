import Item from './item'; // Assuming Item class is exported from item.ts

class ItemHolder {
    private item: Item | null;
    private hasBeenOpened: boolean = false;

    constructor(item: Item | null = null) {
        this.item = item;
    }

    setItem(item: Item): void {
        this.item = item;
    }

    getItem(): Item | null {
        return this.item;
    }

    getHasBeenOpened(): boolean {
        return this.hasBeenOpened;
    }

    retrieveItem(): Item | null {
        if(this.hasBeenOpened) {
            throw Error("Lockbox has already been opened.");
        }
        else {
            this.hasBeenOpened = true;
            return this.item;
        }
    }
}

export { ItemHolder as ItemHolder };