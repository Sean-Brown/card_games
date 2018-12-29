import * as expect from 'expect';
import { ItemCollection } from '../../card_service/base_classes/collections/item_collection';
import { IItem } from '../../card_service/interfaces/iitem';

class BasicItem implements IItem {
    value: number;

    constructor(value: number) {
        this.value = value;
    }

    equalsOther(other: BasicItem) {
        return (this.value === other.value);
    }
}

describe('Test the ItemCollection functionality', function () {
    let collection;
    beforeEach(function () {
        collection = new ItemCollection<BasicItem>([
            new BasicItem(1),
            new BasicItem(2)
        ]);
    });
    it('can find an item\'s index', function () {
        expect(collection.indexOfItem(new BasicItem(1)) !== -1).toBe(true);
        expect(collection.indexOfItem(new BasicItem(3)) === -1).toBe(true);
    });
    it('can add and remove items', function () {
        expect(collection.countItems()).toEqual(2);
        const newItem = new BasicItem(3);
        collection.addItem(newItem);
        expect(collection.countItems()).toEqual(3);
        expect(collection.removeItem(new BasicItem(4))).toBe(false);
        expect(collection.countItems()).toEqual(3);
        expect(collection.removeItem(newItem)).toBe(true);
        expect(collection.countItems()).toEqual(2);
    });
});
