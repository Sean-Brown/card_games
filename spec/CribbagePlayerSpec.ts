import * as expect from 'expect';
import { CribbageHand } from '../../card_service/implementations/cribbage_hand';
import { CribbagePlayer } from '../../card_service/implementations/cribbage_player';
import { aceOfSpades, fourOfClubs, jackOfDiamonds, kingOfHearts } from './StandardCards';

describe('Test the Cribbage Player\'s functionality', function () {
    let player;
    let duplicateCard;
    beforeEach(function () {
        duplicateCard = aceOfSpades;
        player = new CribbagePlayer('Bob', new CribbageHand([
            duplicateCard,
            fourOfClubs,
            jackOfDiamonds,
            kingOfHearts
        ]));
    });
    it('tracks the cards it has played', function () {
        expect(player.playCard(duplicateCard)).toBe(true);
        expect(player.played.countItems()).toEqual(1);
        expect(player.played.items[0].equalsOther(duplicateCard)).toBe(true);
    });
    it('can reset its hand', function () {
        expect(player.hand.countItems()).toEqual(4);
        expect(player.playCard(duplicateCard)).toBe(true);
        expect(player.played.countItems()).toEqual(1);
        player.resetCards();
        expect(player.hand.countItems()).toEqual(0);
        expect(player.played.countItems()).toEqual(0);
    });
});
