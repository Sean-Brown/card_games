import * as expect from 'expect';
import { CribbageStrings, Cribbage } from '../implementations/cribbage';
import { CribbagePlayer } from '../implementations/cribbage_player';
import { CribbageHand } from '../implementations/cribbage_hand';
import {
    Players,
    Sequence,
    removeLastTwoChars,
} from '../base_classes/card_game';
import { BaseCard, Suit, Value } from '../base_classes/items/card';
import { BaseHand } from '../base_classes/collections/hand';
import { ItemCollection } from '../base_classes/collections/item_collection';
import ErrorStrings = CribbageStrings.ErrorStrings;
import {
    aceOfClubs,
    aceOfDiamonds,
    aceOfHearts,
    aceOfSpades,
    eightOfClubs,
    eightOfDiamonds,
    eightOfHearts,
    eightOfSpades,
    fiveOfClubs,
    fiveOfHearts,
    fiveOfSpades,
    fourOfClubs,
    fourOfDiamonds,
    fourOfHearts,
    fourOfSpades,
    jackOfDiamonds,
    jackOfHearts,
    jackOfSpades,
    kingOfClubs,
    kingOfDiamonds,
    kingOfHearts,
    kingOfSpades,
    nineOfClubs,
    nineOfDiamonds,
    nineOfHearts,
    queenOfClubs,
    queenOfDiamonds,
    queenOfHearts,
    queenOfSpades,
    sevenOfClubs,
    sevenOfDiamonds,
    sevenOfHearts,
    sevenOfSpades,
    sixOfClubs,
    sixOfDiamonds,
    sixOfHearts,
    sixOfSpades,
    tenOfClubs,
    tenOfDiamonds,
    tenOfHearts,
    tenOfSpades,
    threeOfClubs,
    threeOfDiamonds,
    threeOfSpades,
    twoOfClubs,
    twoOfDiamonds,
    twoOfHearts,
} from './StandardCards';

describe('Test a Cribbage game between two players', function() {
    let game, playerOne, playerTwo;
    beforeEach(function() {
        playerOne = new CribbagePlayer('Alice', new CribbageHand([]));
        playerTwo = new CribbagePlayer('Bob', new CribbageHand([]));
        game = new Cribbage(
            new Players<CribbagePlayer>([playerOne, playerTwo])
        );
        game.initializeGame();
    });
    it("doesn't allow duplicate players", function() {
        expect(function() {
            game.addPlayer(playerOne);
        }).toThrow(ErrorStrings.PLAYER_ALREADY_IN_GAME);
    });
    it('cuts a random dealer', function() {
        let sameDealerEveryTime = true;
        let lastDealer = null;
        for (let ix = 0; ix < 1000; ix++) {
            game.cutForDealer();
            if (lastDealer === null) {
                lastDealer = game.dealer;
            } else if (!lastDealer.equalsOther(game.dealer)) {
                sameDealerEveryTime = false;
                break;
            }
        }
        expect(sameDealerEveryTime).toBe(false);
    });
    it('sets the next dealer correctly', function() {
        game.dealer = playerOne;
        game.nextPlayerInSequence = playerTwo;
        game.setNextDealer();
        expect(game.dealer.equalsOther(playerTwo)).toBe(true);
        expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
        game.setNextDealer();
        expect(game.dealer.equalsOther(playerOne)).toBe(true);
        expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
        game.setNextDealer();
        expect(game.dealer.equalsOther(playerTwo)).toBe(true);
        expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
    });
    it('sets the next player in the sequence correctly', function() {
        expect(game.nextPlayerInOrder(playerOne).equalsOther(playerTwo)).toBe(
            true
        );
        expect(game.nextPlayerInOrder(playerTwo).equalsOther(playerOne)).toBe(
            true
        );
    });
    it('deals the right number of cards and assigns a dealer', function() {
        expect(game.dealer).toBe(null);
        expect(game.players.itemAt(0).numCards()).toEqual(0);
        expect(game.players.itemAt(1).numCards()).toEqual(0);
        game.cutForDealer();
        expect(game.dealer).toBeTruthy();
        expect(game.nextPlayerInSequence).toBeTruthy();
        game.deal();
        expect(game.players.itemAt(0).numCards()).toEqual(6);
        expect(game.players.itemAt(1).numCards()).toEqual(6);
    });
    function copyHand(cards: Array<BaseCard>) {
        const copy = [];
        for (let index = 0; index < cards.length; index++) {
            const card = cards[index];
            copy.push(new BaseCard(card.suit, card.value));
        }
        return new BaseHand(copy);
    }

    function handsAreDistinct(handOne: BaseHand, handTwo: BaseHand) {
        let areDistinct = false;
        for (let h1Ix = 0; h1Ix < handOne.countItems(); h1Ix++) {
            const cardOne = handOne.itemAt(h1Ix);
            let hasMatch = false;
            for (let h2Ix = 0; h2Ix < handTwo.countItems(); h2Ix++) {
                const cardTwo = handTwo.itemAt(h2Ix);
                if (cardOne.equalsOther(cardTwo)) {
                    hasMatch = true;
                    break;
                }
            }
            if (!hasMatch) {
                areDistinct = true;
                break;
            }
        }
        return areDistinct;
    }

    it('deals random cards each time', function() {
        game.cutForDealer();
        game.deal();
        const handOne = copyHand(game.players.itemAt(0).hand.items);
        const handTwo = copyHand(game.players.itemAt(1).hand.items);
        game.deal();
        const handOneAgain = copyHand(game.players.itemAt(0).hand.items);
        const handTwoAgain = copyHand(game.players.itemAt(1).hand.items);
        expect(handsAreDistinct(handOne, handOneAgain)).toBe(true);
        expect(handsAreDistinct(handTwo, handTwoAgain)).toBe(true);
    });
    it('waits for the kitty to be full before letting players play', function() {
        expect(function() {
            game.playCard(playerTwo.name);
        }).toThrow(ErrorStrings.KITTY_NOT_READY);
    });
    it("doesn't let a player throw the same card twice", function() {
        game.cutForDealer();
        game.deal();
        // get the first players first card
        const firstPlayer = game.players.itemAt(0);
        const firstCard = playerOne.hand.itemAt(0);
        expect(function() {
            game.giveToKitty(
                firstPlayer.name,
                new ItemCollection([firstCard, firstCard])
            );
        }).toThrow(ErrorStrings.DUPLICATE_CARD_THROWN_TO_KITTY);
    });
    it('removes a player from play if they play their last card', function() {
        playerOne.hand = new CribbageHand([
            aceOfClubs,
            aceOfDiamonds,
            aceOfHearts,
            aceOfSpades,
            twoOfDiamonds,
            threeOfSpades,
        ]);
        playerTwo.hand = new CribbageHand([
            jackOfSpades,
            queenOfClubs,
            queenOfHearts,
            queenOfSpades,
            kingOfHearts,
            kingOfSpades,
        ]);
        game.dealer = playerOne;
        game.nextPlayerInSequence = playerTwo;
        game.giveToKitty(
            playerOne.name,
            new ItemCollection<BaseCard>([twoOfDiamonds, threeOfSpades])
        );
        game.giveToKitty(
            playerTwo.name,
            new ItemCollection<BaseCard>([jackOfSpades, queenOfClubs])
        );
        game.cut = new BaseCard(Suit.Spades, Value.King);
        game.playersInPlay.addItems(game.players.items);
        game.playCard(playerTwo.name, queenOfHearts);
        game.playCard(playerOne.name, aceOfClubs);
        game.playCard(playerTwo.name, queenOfSpades);
        game.playCard(playerOne.name, aceOfSpades);
        game.go(playerTwo.name);
        game.playCard(playerOne.name, aceOfDiamonds);
        game.playCard(playerOne.name, aceOfHearts);
        expect(game.playersInPlay.countItems()).toEqual(1);
        expect(game.playersInPlay.indexOfItem(playerTwo)).toBe(0); // nobody should be left
        expect(game.count).toEqual(0); // expect the game to have reset the sequence
    });
    describe('Test with fixed hands, starting at 0 points', function() {
        beforeEach(function() {
            playerOne.hand = new CribbageHand([
                sevenOfSpades,
                sevenOfDiamonds,
                eightOfHearts,
                eightOfSpades,
                nineOfDiamonds,
                tenOfClubs,
            ]);
            playerTwo.hand = new CribbageHand([
                nineOfHearts,
                tenOfDiamonds,
                jackOfSpades,
                queenOfHearts,
                kingOfClubs,
                kingOfHearts,
            ]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([nineOfDiamonds, tenOfClubs])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([kingOfClubs, kingOfHearts])
            );
            game.cut = kingOfSpades;
            game.playersInPlay.addItems(game.players.items);
        });
        it('takes cards from the players hands when they give to the kitty', function() {
            expect(playerOne.hand.size()).toEqual(4);
            expect(playerTwo.hand.size()).toEqual(4);
            expect(game.kitty.size()).toEqual(4);
        });
        it("doesn't let a player play a card they don't have", function() {
            expect(function() {
                game.playCard(playerTwo.name, tenOfClubs);
            }).toThrow(
                `${
                    ErrorStrings.FMT_PLAYER_DOESNT_HAVE_CARD
                } the ${tenOfClubs.toString()}!`
            );
        });
        it('ensures players play in order', function() {
            expect(function() {
                game.playCard(playerOne.name, sevenOfSpades);
            }).toThrow(ErrorStrings.FMT_NOT_NEXT_PLAYER + playerTwo.name);
        });
        it('knows how to count points in round 2', function() {
            expect(playerOne.countPoints(game.cut)).toEqual(12);
            expect(playerTwo.countPoints(game.cut)).toEqual(6);
            expect(game.kitty.countPoints(game.cut, true)).toEqual(6);
        });
        describe('Test playing cards', function() {
            beforeEach(function() {
                game.playCard(playerTwo.name, queenOfHearts);
                game.playCard(playerOne.name, eightOfSpades);
                game.playCard(playerTwo.name, nineOfHearts);
            });
            it('does not allow exceeding 31', function() {
                expect(function() {
                    game.playCard(playerOne.name, sevenOfSpades);
                }).toThrow(ErrorStrings.EXCEEDS_31);
            });
            it('adds to the sequence', function() {
                expect(game.sequence.cards.countItems()).toEqual(3);
            });
            it('knows when the game is over', function() {
                game.teams.findTeam(playerOne).addPoints(playerOne, 119);
                expect(
                    playerOne.hand.takeCard(
                        new BaseCard(Suit.Spades, Value.Ace)
                    )
                ).toBe(true);
            });
        });
    });
    describe('Test an entire round of play', function() {
        beforeEach(function() {});
        it('knows how to play one round', function() {
            playerOne.hand = new CribbageHand([
                sevenOfSpades,
                sevenOfDiamonds,
                eightOfHearts,
                eightOfSpades,
                nineOfDiamonds,
                tenOfClubs,
            ]);
            playerTwo.hand = new CribbageHand([
                nineOfHearts,
                tenOfDiamonds,
                jackOfSpades,
                queenOfHearts,
                kingOfClubs,
                kingOfHearts,
            ]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([sevenOfDiamonds, eightOfHearts])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([kingOfClubs, kingOfHearts])
            );
            game.cut = new BaseCard(Suit.Spades, Value.King);
            game.playersInPlay.addItems(game.players.items);
            game.playCard(playerTwo.name, nineOfHearts);
            game.playCard(playerOne.name, nineOfDiamonds);
            expect(game.getTeam(0).countPoints()).toEqual(2); // Pair of nines
            game.playCard(playerTwo.name, jackOfSpades);
            game.go(playerOne.name);
            game.go(playerTwo.name);
            expect(game.getTeam(1).countPoints()).toEqual(1); // Point for the go
            expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
            game.playCard(playerOne.name, tenOfClubs);
            game.playCard(playerTwo.name, tenOfDiamonds);
            expect(game.getTeam(1).countPoints()).toEqual(3); // Two more points for a pair
            game.playCard(playerOne.name, eightOfSpades);
            game.go(playerTwo.name);
            game.go(playerOne.name);
            expect(game.getTeam(0).countPoints()).toEqual(3); // Point for a go
            expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
            game.playCard(playerTwo.name, queenOfHearts);
            game.playCard(playerOne.name, sevenOfSpades);
            // The round is over
            expect(game.getTeam(0).countPoints()).toEqual(
                4 /* round of play */ + 6 /* their hand */ + 8 /* their kitty */
            );
            expect(game.getTeam(1).countPoints()).toEqual(
                3 /* round of play */ + 6 /* their hand */
            );
            expect(game.dealer.equalsOther(playerTwo)).toBe(true);
        });
        it('knows how to play one round', function() {
            playerOne.hand = new CribbageHand([
                aceOfClubs,
                aceOfHearts,
                twoOfDiamonds,
                nineOfDiamonds,
                tenOfClubs,
                queenOfDiamonds,
            ]);
            playerTwo.hand = new CribbageHand([
                threeOfClubs,
                fourOfSpades,
                sixOfSpades,
                sevenOfClubs,
                jackOfHearts,
                kingOfSpades,
            ]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([nineOfDiamonds, tenOfClubs])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([jackOfHearts, kingOfSpades])
            );
            game.cut = new BaseCard(Suit.Spades, Value.Two);
            game.playersInPlay.addItems(game.players.items);
            game.playCard(playerTwo.name, threeOfClubs);
            game.playCard(playerOne.name, queenOfDiamonds);
            game.playCard(playerTwo.name, sixOfSpades);
            game.playCard(playerOne.name, twoOfDiamonds);
            game.playCard(playerTwo.name, sevenOfClubs);
            game.playCard(playerOne.name, aceOfHearts);
            game.go(playerTwo.name);
            expect.spyOn(game, 'roundOverResetState');
            game.playCard(playerOne.name, aceOfClubs);
            expect(game.roundOverResetState).toNotHaveBeenCalled();
        });
        it('knows how to play one round', function() {
            playerOne.hand = new CribbageHand([
                fourOfSpades,
                fiveOfHearts,
                sixOfDiamonds,
                sixOfHearts,
                eightOfHearts,
                tenOfHearts,
            ]);
            playerTwo.hand = new CribbageHand([
                twoOfHearts,
                threeOfDiamonds,
                fourOfClubs,
                fiveOfClubs,
                jackOfHearts,
                kingOfDiamonds,
            ]);
            game.dealer = playerTwo;
            game.nextPlayerInSequence = playerOne;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([eightOfHearts, tenOfHearts])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([jackOfHearts, kingOfDiamonds])
            );
            game.cut = fourOfDiamonds;
            game.playersInPlay.addItems(game.players.items);
            game.playCard(playerOne.name, fourOfSpades);
            game.playCard(playerTwo.name, fourOfClubs);
            expect(game.findTeam(playerTwo).countPoints()).toEqual(2); // pair for 2 points
            game.playCard(playerOne.name, sixOfDiamonds);
            game.playCard(playerTwo.name, fiveOfClubs);
            expect(game.findTeam(playerTwo).countPoints()).toEqual(5); // previous 2 + run of 3 makes 5 points
            game.playCard(playerOne.name, fiveOfHearts);
            expect(game.findTeam(playerOne).countPoints()).toEqual(2); // pair of 5s
            game.playCard(playerTwo.name, threeOfDiamonds);
            game.go(playerOne.name);
            game.playCard(playerTwo.name, twoOfHearts);
            expect(game.findTeam(playerTwo).countPoints()).toEqual(6); // 5 previous +1 for a go
            expect.spyOn(game, 'roundOverResetState');
            game.playCard(playerOne.name, sixOfHearts);
            expect(game.roundOverResetState).toHaveBeenCalled();
        });
        it('counts correctly', function() {
            // Expose a bug where the flush isn't counted correctly
            playerOne.hand = new CribbageHand([
                twoOfHearts,
                fiveOfHearts,
                eightOfHearts,
                kingOfHearts,
                aceOfClubs,
                threeOfClubs,
            ]);
            playerTwo.hand = new CribbageHand([
                sixOfSpades,
                sevenOfDiamonds,
                sevenOfHearts,
                kingOfSpades,
                kingOfClubs,
                tenOfSpades,
            ]);
            game.dealer = playerTwo;
            game.nextPlayerInSequence = playerOne;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([aceOfClubs, threeOfClubs])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([kingOfClubs, tenOfSpades])
            );
            game.cut = sixOfHearts;
            game.playersInPlay.addItems(game.players.items);
            game.playCard(playerOne.name, eightOfHearts);
            game.playCard(playerTwo.name, sevenOfHearts);
            game.playCard(playerOne.name, kingOfHearts);
            game.playCard(playerTwo.name, sixOfSpades);
            game.playCard(playerOne.name, twoOfHearts);
            game.playCard(playerTwo.name, kingOfSpades);
            game.playCard(playerOne.name, fiveOfHearts);
            game.playCard(playerTwo.name, sevenOfDiamonds);
            // Player one should have: 9 points (15 for 4 + flush of 5 = 9)
            expect(game.teams.findTeam(playerOne).countPoints()).toEqual(9);
        });
    });
    describe("Test player playing cards after other player says 'go'", function() {
        beforeEach(function() {
            playerOne.hand = new CribbageHand([
                aceOfClubs,
                twoOfDiamonds,
                sixOfClubs,
                eightOfClubs,
                tenOfClubs,
                queenOfHearts,
            ]);
            playerTwo.hand = new CribbageHand([
                threeOfSpades,
                fiveOfHearts,
                eightOfSpades,
                queenOfSpades,
                kingOfSpades,
                kingOfClubs,
            ]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.cut = queenOfClubs;
            game.playersInPlay.addItems(game.players.items);
        });
        it('sets the next player correctly', function() {
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([tenOfClubs, queenOfHearts])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([kingOfSpades, kingOfClubs])
            );
            game.playCard(playerTwo.name, threeOfSpades);
            game.playCard(playerOne.name, eightOfClubs);
            game.playCard(playerTwo.name, queenOfSpades);
            game.playCard(playerOne.name, sixOfClubs);
            game.go(playerTwo.name);
            game.playCard(playerOne.name, twoOfDiamonds);
            expect(function() {
                game.playCard(playerOne.name, aceOfClubs);
            }).toNotThrow(
                `${ErrorStrings.FMT_NOT_NEXT_PLAYER} + ${game.nextPlayerInSequence.name}`
            );
        });
        it('gives the correct player the point', function() {
            game.dealer = playerTwo;
            game.nextPlayerInSequence = playerOne;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([tenOfClubs, queenOfHearts])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([kingOfSpades, kingOfClubs])
            );
            playerOne.hand.removeItem(eightOfClubs);
            playerOne.hand.addItems([aceOfDiamonds]);
            game.playCard(playerOne.name, aceOfClubs);
            game.playCard(playerTwo.name, eightOfSpades);
            game.playCard(playerOne.name, aceOfDiamonds);
            game.playCard(playerTwo.name, fiveOfHearts);
            game.playCard(playerOne.name, sixOfClubs);
            game.playCard(playerTwo.name, threeOfSpades);
            game.playCard(playerOne.name, twoOfDiamonds);
            game.go(playerTwo.name);
            expect(game.getTeam(0).countPoints()).toEqual(1); // One point for the go
        });
        it('sets the next player correctly when a player gets a go and has no more cards but the opponent does', function() {
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([tenOfClubs, queenOfHearts])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([threeOfSpades, fiveOfHearts])
            );
            playerOne.hand.removeItem(sixOfClubs);
            playerOne.hand.removeItem(eightOfClubs);
            playerOne.hand.addItems([aceOfDiamonds, twoOfClubs]);
            game.playCard(playerTwo.name, eightOfSpades);
            game.playCard(playerOne.name, twoOfDiamonds);
            game.playCard(playerTwo.name, queenOfSpades);
            game.playCard(playerOne.name, twoOfClubs);
            game.go(playerTwo.name);
            game.playCard(playerOne.name, aceOfDiamonds);
            game.playCard(playerOne.name, aceOfClubs);
            expect(game.count).toEqual(0); // The round should restart because there will be no players left in play
            expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
        });
        it('sets the next player correctly after one scores 31', function() {
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([twoOfDiamonds, sixOfClubs])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([threeOfSpades, eightOfSpades])
            );
            game.playCard(playerTwo.name, queenOfSpades);
            game.playCard(playerOne.name, queenOfHearts);
            game.playCard(playerTwo.name, kingOfSpades);
            game.playCard(playerOne.name, aceOfClubs);
            expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
        });
        it('sets the next player correctly after a go', function() {
            playerOne.hand = new CribbageHand([
                twoOfClubs,
                threeOfSpades,
                fiveOfClubs,
                sixOfClubs,
                sevenOfClubs,
                sevenOfDiamonds,
            ]);
            playerTwo.hand = new CribbageHand([
                twoOfDiamonds,
                eightOfClubs,
                eightOfDiamonds,
                jackOfSpades,
                jackOfHearts,
                queenOfHearts,
            ]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([twoOfClubs, threeOfSpades])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([twoOfDiamonds, queenOfHearts])
            );
            game.playCard(playerTwo.name, eightOfClubs);
            game.playCard(playerOne.name, sevenOfClubs);
            game.playCard(playerTwo.name, eightOfDiamonds);
            game.playCard(playerOne.name, sixOfClubs);
            game.go(playerTwo.name);
            game.go(playerOne.name);
            expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
            game.playCard(playerTwo.name, jackOfSpades);
            game.playCard(playerOne.name, fiveOfClubs);
            game.playCard(playerTwo.name, jackOfHearts);
            game.go(playerOne.name);
            // Player two is out of cards and player one has one card left, expect them to be the next player to play
            expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
        });
        it('gives the player 15 for two AND a point for the last card', function() {
            playerOne.hand = new CribbageHand([
                nineOfClubs,
                eightOfDiamonds,
                tenOfHearts,
                jackOfDiamonds,
                aceOfSpades,
                fourOfSpades,
            ]);
            playerTwo.hand = new CribbageHand([
                nineOfHearts,
                kingOfDiamonds,
                tenOfDiamonds,
                fiveOfClubs,
                sevenOfHearts,
                queenOfSpades,
            ]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(
                playerOne.name,
                new ItemCollection<BaseCard>([aceOfSpades, fourOfSpades])
            );
            game.giveToKitty(
                playerTwo.name,
                new ItemCollection<BaseCard>([sevenOfHearts, queenOfSpades])
            );
            game.cut = eightOfSpades;
            game.playCard(playerTwo.name, nineOfHearts);
            game.playCard(playerOne.name, nineOfClubs); // 2
            game.playCard(playerTwo.name, kingOfDiamonds);
            game.go(playerOne.name);
            game.go(playerTwo.name); // 1
            game.playCard(playerOne.name, eightOfDiamonds);
            game.playCard(playerTwo.name, tenOfDiamonds);
            game.playCard(playerOne.name, tenOfHearts); // 4
            game.go(playerTwo.name);
            game.go(playerOne.name); // 5
            game.playCard(playerTwo.name, fiveOfClubs);
            game.playCard(playerOne.name, jackOfDiamonds); // 8 (15 for 2, last card for 1)
            // Player one should have  points -- exposes bug where only the 15 is given but not the last card
            // Double run of 4 = 10, run of play = 8, kitty = 4, expected = 10 + 8 + 4 = 22
            const expected = 22;
            expect(game.findTeam(playerOne).countPoints()).toEqual(expected);
        });
    });
    describe('Test the run-of-play', function() {
        class SeqVal {
            sequence: Sequence;
            expectedValue: number;

            constructor(sequence: Sequence, expectedValue: number) {
                this.sequence = sequence;
                this.expectedValue = expectedValue;
            }

            toString() {
                let text = '';
                for (
                    let index = 0;
                    index < this.sequence.cards.countItems();
                    index++
                ) {
                    text += this.sequence.cards.itemAt(index).toString() + ', ';
                }
                if (text.length > 0) {
                    // Remove the last comma + space
                    text = removeLastTwoChars(text);
                }
                return text;
            }

            countPoints() {
                return this.sequence.countPoints();
            }

            static makeSequence(cards: Array<BaseCard>): Sequence {
                const seq = new Sequence();
                seq.addCards(cards);
                return seq;
            }

            static getAllPermutations(sequence: Sequence): Array<Sequence> {
                const permutations: Array<Array<BaseCard>> = [];

                function permute(input: Array<BaseCard>, memo?: any) {
                    const _memo = memo || [];
                    for (let i = 0; i < input.length; i++) {
                        const cur = input.splice(i, 1);
                        if (input.length === 0) {
                            permutations.push(_memo.concat(cur));
                        }
                        permute(input.slice(), _memo.concat(cur));
                        input.splice(i, 0, cur[0]);
                    }
                    return permutations;
                }

                permute(sequence.cards.items);
                const ret = [];
                for (let ix = 0; ix < permutations.length; ix++) {
                    const newSeq = new Sequence();
                    newSeq.addCards(permutations[ix]);
                    ret.push(newSeq);
                }
                return ret;
            }
        }
        describe('Test counting points in the run-of-play', function() {
            describe('knows how to count runs', function() {
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            sixOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            jackOfSpades,
                            sixOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfClubs,
                            jackOfSpades,
                            sixOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of zero', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfClubs,
                            sixOfHearts,
                            jackOfSpades,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(0);
                });
                it('is a run of four', function() {
                    expect(
                        SeqVal.makeSequence([
                            sixOfHearts,
                            eightOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(4);
                });
                it('is a run of four', function() {
                    expect(
                        SeqVal.makeSequence([
                            jackOfSpades,
                            sixOfHearts,
                            eightOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(4);
                });
                it('is a run of four', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfHearts,
                            jackOfSpades,
                            sixOfHearts,
                            eightOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(4);
                });
                it('is a run of four', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfHearts,
                            fourOfSpades,
                            jackOfSpades,
                            sixOfHearts,
                            eightOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(4);
                });
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfHearts,
                            fourOfSpades,
                            eightOfHearts,
                            jackOfSpades,
                            sixOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of zero', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfHearts,
                            fourOfSpades,
                            sixOfHearts,
                            eightOfHearts,
                            jackOfSpades,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(0);
                });
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfHearts,
                            fourOfSpades,
                            eightOfHearts,
                            jackOfSpades,
                            sixOfHearts,
                            fiveOfHearts,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of five', function() {
                    expect(
                        SeqVal.makeSequence([
                            fiveOfHearts,
                            sevenOfHearts,
                            fourOfHearts,
                            sixOfHearts,
                            eightOfHearts,
                        ]).countPoints()
                    ).toEqual(5);
                });
                it('is a run of five', function() {
                    expect(
                        SeqVal.makeSequence([
                            jackOfSpades,
                            fiveOfHearts,
                            sevenOfHearts,
                            fourOfHearts,
                            sixOfHearts,
                            eightOfHearts,
                        ]).countPoints()
                    ).toEqual(5);
                });
                it('is a run of five', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfClubs,
                            jackOfSpades,
                            fiveOfHearts,
                            sevenOfHearts,
                            fourOfHearts,
                            sixOfHearts,
                            eightOfHearts,
                        ]).countPoints()
                    ).toEqual(5);
                });
                it('is a run of five', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfDiamonds,
                            fourOfClubs,
                            jackOfSpades,
                            fiveOfHearts,
                            sevenOfHearts,
                            fourOfHearts,
                            sixOfHearts,
                            eightOfHearts,
                        ]).countPoints()
                    ).toEqual(5);
                });
                it('is a run of four', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfDiamonds,
                            fourOfClubs,
                            eightOfHearts,
                            jackOfSpades,
                            sevenOfHearts,
                            fiveOfHearts,
                            fourOfHearts,
                            sixOfHearts,
                        ]).countPoints()
                    ).toEqual(4);
                });
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfDiamonds,
                            fourOfClubs,
                            eightOfHearts,
                            sevenOfHearts,
                            jackOfSpades,
                            fiveOfHearts,
                            fourOfHearts,
                            sixOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of zero', function() {
                    expect(
                        SeqVal.makeSequence([
                            fourOfDiamonds,
                            fourOfClubs,
                            fiveOfHearts,
                            sevenOfHearts,
                            jackOfSpades,
                            fourOfHearts,
                            sixOfHearts,
                            eightOfHearts,
                        ]).countPoints()
                    ).toEqual(0);
                });
                it('is a run of three', function() {
                    expect(
                        SeqVal.makeSequence([
                            sixOfHearts,
                            fourOfClubs,
                            eightOfHearts,
                            sevenOfClubs,
                            sixOfDiamonds,
                        ]).countPoints()
                    ).toEqual(3);
                });
                it('is a run of three, twice!', function() {
                    expect(
                        SeqVal.makeSequence([
                            sevenOfSpades,
                            fiveOfHearts,
                            sixOfDiamonds,
                        ]).countPoints()
                    ).toEqual(3);
                    expect(
                        SeqVal.makeSequence([
                            sevenOfSpades,
                            fiveOfHearts,
                            sixOfDiamonds,
                            fiveOfSpades,
                            sevenOfHearts,
                        ]).countPoints()
                    ).toEqual(3);
                });
            });
            it('knows how to count of-a-kinds', function() {
                const pair = new SeqVal(
                    SeqVal.makeSequence([sevenOfSpades, sevenOfHearts]),
                    2
                );
                const threeOfAKind = new SeqVal(
                    SeqVal.makeSequence([
                        sevenOfSpades,
                        sevenOfHearts,
                        sevenOfClubs,
                    ]),
                    6
                );
                const fourOfAKind = new SeqVal(
                    SeqVal.makeSequence([
                        sevenOfSpades,
                        sevenOfHearts,
                        sevenOfClubs,
                        sevenOfDiamonds,
                    ]),
                    12
                );
                expect(pair.countPoints()).toEqual(pair.expectedValue);
                expect(threeOfAKind.countPoints()).toEqual(
                    threeOfAKind.expectedValue
                );
                expect(fourOfAKind.countPoints()).toEqual(
                    fourOfAKind.expectedValue
                );
            });
        });
    });
});
