import Item from './item';
import { ItemHolder } from './itemholder';

class CodeBox extends ItemHolder {
    private code: number;

    constructor(code: number, item: Item) {
        super(item);
        this.code = code;
    }

    unlockBox(code: number): Item | null {
        if (code === this.code) {
            return super.retrieveItem();
        } else {
            throw new Error('Incorrect code');
        }
    }
}

