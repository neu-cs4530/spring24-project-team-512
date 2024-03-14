class Item {
    private name: string;
    private description: string;
    private tile: string;

    constructor(name: string, description: string, tile: string) {
        this.name = name;
        this.description = description;
        this.tile = tile
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
    }

}

export default Item;