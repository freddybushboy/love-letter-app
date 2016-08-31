import { Card } from './card';
import { Player } from './player';
import { Move } from './move';
import { CardService } from './card.service';
import { PlayerService } from './player.service';
import { MoveService } from './move.service';


export class Game {
  deck: Card[] = [];
  players: Player[] = [];
  log: string[] = [];
  removedCards: Card[] = [];
  cardList = this.cardService.getCardList();
  activePlayer: Player;
  playedCardTarget: Player;
  playedCard: Card;
  playedCardCorrectGuess: string;
  playedCardIncorrectGuess: string;
  winner: Player;
  choosePlayer = null;
  chooseCard = null;
  playerSelection = [];
  averageCardValue:number = 0;

  constructor(private cardService: CardService, private playerService: PlayerService, private moveService: MoveService) {
    this.draw = this.draw.bind(this);
    this.playCard = this.playCard.bind(this);
  }

  /**
   * Get list of remaining cards.
   */
  private getRemainingCards() {
    let cardList = [];

    this.deck.forEach(card => {
      cardList.push(card);
    });

    this.players.forEach(player => {
      player.hand.forEach(card => {
        cardList.push(card);
      });
    });

    // AI should not know about removed card.
    this.removedCards.forEach(card => {
      cardList.push(card);
    });

    return cardList;
  }

  private getDeck() {
    this.deck = this.cardService.getDeck();

    // Remove one card randomly.
    var index = Math.floor(Math.random()*this.deck.length);
    var card = this.deck[index];
    this.removedCards.push(this.deck[index]);
    this.deck.splice(index, 1);
  }

  private getPlayers() {
    this.players = this.playerService.getPlayers();
    this.deal();
  }

  private deal() {
    this.players.forEach((player) => {
      this.draw(player);
    });

    this.updateCardAverageValue();
    this.nextPlayer();
  }

  private updateCardAverageValue() {
    let cards = this.getRemainingCards();
    let total = 0;
    let values = [];

    cards.forEach(card => {
      total = total + card.value;
      values.push(card.value);
    });

    this.averageCardValue = total / values.length;
  }

  private nextPlayer() {
    // New game, new player.
    if (!this.activePlayer) {
      this.activePlayer = this.players[Math.floor(Math.random()*this.players.length)];
    }
    else {
      var activeIndex = this.players.indexOf(this.activePlayer);
      var nextIndex = nextIndex = (activeIndex === (this.players.length - 1)) ? 0 : activeIndex + 1;
      var found = false;
      var iterations = this.players.length;

      while (!found) {
        if (iterations > 0) {
          iterations--;

          if (!this.players[nextIndex].out) {
            found = true;
          }
          else {
            nextIndex = (nextIndex === (this.players.length - 1)) ? 0 : nextIndex + 1;
          }
        }
        else {
          console.log('too many iterations in nextPlayer!');
          break;
        }
      }

      this.activePlayer = this.players[nextIndex];
    }

    // Get rid of protection.
    this.activePlayer.protected = false;

    if (!this.activePlayer.human) {
      this.robotMove();
    }
  }

  private robotMove() {
    // Get the robot a card.
    this.draw(this.activePlayer);

    // Calculate their move.
    var move: Move = this.moveService.getBestMove(this);

    setTimeout(() => {
      this.playCard(move.card, move.player, move.guess);
    }, 1000);
  }

  private knowCard(knower, knowee, card) {
    knower.knownCards.push({
      player: knowee,
      card: card
    });

    // Prefer the player that knows your card.
    knowee.preferredPlayer = knower;
  }

  private unknowCard(knowee, card) {
    this.players.forEach(player => {
      player.knownCards.forEach((knownCard, key) => {
        if (knownCard.player === knowee && knownCard.card === card) {
          player.knownCards.splice(key, 1);

          // If we don't know their card anymore, we no longer prefer them.
          if (knownCard.player.preferredPlayer === knowee) {
            knownCard.player.preferredPlayer = null;
          }
        }
      });
    });
  }

  private exchangeKnownCard(oldKnowee, newKnowee, card) {
    this.players.forEach(player => {
      player.knownCards.forEach((knownCard, key) => {
        if (knownCard.player === oldKnowee && knownCard.card === card) {
          // Forget about it if it's us.
          if (newKnowee === player) {
            player.knownCards.splice(key, 1);
          }
          else {
            knownCard.player = newKnowee;
          }
        }
      });
    });
  }

  private movePlayedCard(card: Card) {
    // Move card to played cards.
    this.activePlayer.playedCards.push(card);
    this.activePlayer.hand.splice(this.activePlayer.hand.indexOf(card), 1);

    this.playedCard = card;
  }

  private finishTurn() {
    this.unknowCard(this.activePlayer, this.playedCard);

    // Reset player selection.
    this.playedCardCorrectGuess = null;
    this.playedCardIncorrectGuess = null;
    this.playedCardTarget = null;
    this.playedCard = null;
    this.playerSelection = [];
    this.checkGame();
  }

  private clearChoosePlayer() {
    this.choosePlayer = null;
  }

  private clearChooseCard() {
    this.chooseCard = null;
  }

  private discard(player: Player) {
    var card = player.hand[0];

    player.playedCards.push(card);
    player.hand.splice(0, 1);

    this.unknowCard(player, card)

    this.addLog(player.name + ' discarded ' + card.name);

    if (card.id === 'princess') {
      this.outPlayer(player);
    }
    else {
      this.draw(player);
    }
  }

  private addLog(message) {
    let date = new Date();
    this.log.unshift(date.toString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + ': ' + message);
  }

  private checkGame() {
    var playersRemaining = this.players.filter(player => !player.out);

    if (playersRemaining.length === 1) {
      this.winner = playersRemaining[0];
      this.addLog(playersRemaining[0].name + ' is the winner! (last man standing)');
    }

    else if (this.deck.length === 0) {
      let winners: Player[] = [];

      this.players.forEach(player => {
        if (!player.out) {
          player.finalScore = player.hand[0].value;
          winners.push(player);
        }
      });

      function compare(a,b) {
        if (a.finalScore < b.finalScore)
          return 1;
        if (a.finalScore > b.finalScore)
          return -1;
        return 0;
      }

      winners.sort(compare);

      // Make sure not a draw.
      if (winners[0].finalScore > winners[1].finalScore) {
        this.winner = winners[0];
        this.addLog(winners[0].name + ' is the winner! (highest card)');
      }
      // If a draw, add total of discarded cards.
      else {
        winners.forEach(player => {
          player.finalScore = 0;

          player.playedCards.forEach(card => {
            player.finalScore = player.finalScore + card.value;
          });
        });

        winners.sort(compare);

        if (winners[0].finalScore > winners[1].finalScore) {
          this.winner = winners[0];
          this.addLog(winners[0].name + ' is the winner! (highest discarded value)');
        }
      }
    }

    else {
      this.updateCardAverageValue();
      this.nextPlayer();
    }
  }

  private outPlayer(player: Player) {
    player.out = true;
    // Create log entry.
    this.addLog(player.name + ' is out!');
  }

  private guess(selectedPlayer: Player, guess?) {
    this.choosePlayer = null;
    return new Promise((resolve, reject) => {
      if (guess) {
        resolve(guess.id);
      }
      else {
        this.chooseCard = resolve;
      }
    });
  }

  private selectPlayer(canChooseSelf, player?) {

    this.playerSelection = [];

    this.players.forEach(player => {
      if (!player.protected && !player.out && (player !== this.activePlayer || canChooseSelf)) {
        this.playerSelection.push(player);
      }
    });

    return new Promise((resolve, reject) => {
      if (this.playerSelection.length > 0) {
        if (player) {
          resolve(player);
        }
        else {
          this.choosePlayer = resolve;
        }
      }
      else {
        reject();
      }
    });
  }

  newGame() {
    this.getDeck();
    this.getPlayers();
  }

  draw(player: Player) {
    var index = Math.floor(Math.random()*this.deck.length);
    var card = this.deck[index];

    player.hand.push(card);
    this.deck.splice(index, 1);
  }

  playCard(card: Card, player?, guess?) {

    switch (card.id) {
      case 'princess':
        this.movePlayedCard(card);
        this.addLog(this.activePlayer.name + ' Played ' + card.name);

        this.outPlayer(this.activePlayer);

        if (this.activePlayer.human) {
          this.finishTurn();
        }
        break;

      case 'king':
        this.movePlayedCard(card);

        this.selectPlayer(false, player).then((selectedPlayer: Player) => {
          let selectedPlayerCard = selectedPlayer.hand[0];
          let activePlayerCard = this.activePlayer.hand[0];

          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name);
          this.playedCardTarget = selectedPlayer;

          // Trade hands.
          selectedPlayer.hand.push(activePlayerCard);
          this.activePlayer.hand.push(selectedPlayerCard);
          selectedPlayer.hand.splice(0, 1);
          this.activePlayer.hand.splice(0, 1);

          // Anyone who knew about these cards should know we've swapped.
          this.exchangeKnownCard(this.activePlayer, selectedPlayer, activePlayerCard);
          this.exchangeKnownCard(selectedPlayer, this.activePlayer, selectedPlayerCard);

          // We know each other's cards now.
          this.knowCard(this.activePlayer, selectedPlayer, activePlayerCard);
          this.knowCard(selectedPlayer, this.activePlayer, selectedPlayerCard);
        },
        (error) => {
          // Create log entry.
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' but there was nobody to play it on!');
        });
        break;

      case 'priest':
        this.movePlayedCard(card);

        this.selectPlayer(false, player).then((selectedPlayer: Player) => {

          // Set played card target.
          this.playedCardTarget = selectedPlayer;
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name);

          let selectedPlayerCard = selectedPlayer.hand[0];

          // We know eachothers cards now.
          this.knowCard(this.activePlayer, selectedPlayer, selectedPlayerCard);
        },
        (error) => {
          // Create log entry.
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' but there was nobody to play it on!');

          if (this.activePlayer.human) {
            this.finishTurn();
          }
        });
        break;

      case 'handmaid':
        this.movePlayedCard(card);
        this.addLog(this.activePlayer.name + ' Played ' + card.name);

        this.activePlayer.protected = true;

        if (this.activePlayer.human) {
          this.finishTurn();
        }
        break;

      case 'baron':
        // @TODO - 'suspect' winner's card.
        this.movePlayedCard(card);

        this.selectPlayer(false, player).then((selectedPlayer: Player) => {

          // Set played card target.
          this.playedCardTarget = selectedPlayer;

          let selectedPlayerCard = selectedPlayer.hand[0];
          let activePlayerCard = this.activePlayer.hand[0];

          if (activePlayerCard.value === selectedPlayerCard.value) {
            // Create log entry.
            this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name + ' but it was a draw');

            // We just know eachothers cards now.
            this.knowCard(this.activePlayer, selectedPlayer, selectedPlayerCard);
          }
          else if (activePlayerCard.value > selectedPlayerCard.value) {
            // Create log entry.
            this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name + ' and won!');

            this.outPlayer(selectedPlayer);
          }
          else {
            // Create log entry.
            this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name + ' and lost!');

            this.outPlayer(this.activePlayer);
          }
        },
        (error) => {
          // Create log entry.
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' but there was nobody to play it on!');

          if (this.activePlayer.human) {
            this.finishTurn();
          }
        });
        break;

      case 'prince':
        this.movePlayedCard(card);

        this.selectPlayer(true, player).then((selectedPlayer: Player) => {
          // Set played card target.
          this.playedCardTarget = selectedPlayer;
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name);

          this.discard(selectedPlayer);

          if (this.activePlayer.human) {
            this.finishTurn();
          }
        },
        (error) => {
          // Create log entry.
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' but there was nobody to play it on!');

          if (this.activePlayer.human) {
            this.finishTurn();
          }
        });
        break;

      case 'guard':
        this.movePlayedCard(card);

        this.selectPlayer(false, player).then((selectedPlayer: Player) => {
          // Set played card target.
          this.playedCardTarget = selectedPlayer;

          this.guess(selectedPlayer, guess).then((guessCardId: string) => {
            if (selectedPlayer.hand[0].id === guessCardId) {
              // Create log entry.
              this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name + ' and correctly guessed ' + guessCardId);

              // Set played card target.
              this.playedCardCorrectGuess = guessCardId;

              this.outPlayer(selectedPlayer);
            }
            else {
              this.addLog(this.activePlayer.name + ' Played ' + card.name + ' on ' + selectedPlayer.name + ' and incorrectly guessed ' + guessCardId);

              // Set played card target.
              this.playedCardIncorrectGuess = guessCardId;
            }
          });
        },
        (error) => {
          // Create log entry.
          this.addLog(this.activePlayer.name + ' Played ' + card.name + ' but there was nobody to play it on!');
        });
        break;

      case 'countess':
        // @TODO - 'suspect' prince, king or princess.
        this.movePlayedCard(card);
        this.addLog(this.activePlayer.name + ' Played ' + card.name);

        if (this.activePlayer.human) {
          this.finishTurn();
        }
        break;
    }
  }

}
