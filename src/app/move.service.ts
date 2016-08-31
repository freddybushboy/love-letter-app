import { Injectable } from '@angular/core';
import { Game } from './game';
import { Move } from './move';

@Injectable()
export class MoveService {

  /**
   * Finds the speficied card in the active player's hand if it exists.
   */
  private getCard(cardId: string, game: Game) {
    let retCard = null;

    // Find the card.
    game.activePlayer.hand.forEach(card => {
      if (card.id === cardId) {
        retCard = card;
      }
    });

    return retCard;
  }

  /**
   * Finds an unprotected player to target if there is one.
   */
  private getUnprotectedPlayer(game: Game) {
    let retPlayer = null;

    // Go through the players.
    game.players.forEach(player => {
      if (!player.protected && !player.out && player !== game.activePlayer) {
        retPlayer = player;
      }
    });

    // Use the preferred player if possible.
    game.players.forEach(player => {
      if (!player.protected && !player.out && player !== game.activePlayer && player === game.activePlayer.preferredPlayer) {
        retPlayer = player;
      }
    });

    return retPlayer;
  }

  /**
   * Get a card to be used as a guess.
   */
  private getGuessCard(game: Game) {
    let cardList = this.getRemainingGuessCards(game);
    let cardListGrouped = {};
    let retCard = cardList[Math.floor(Math.random()*cardList.length)];

    // Group the cards.
    cardList.forEach(card => {
      if (cardListGrouped[card.id]) {
        cardListGrouped[card.id].push(card);
      }
      else {
        cardListGrouped[card.id] = [card];
      }
    });

    // If there is more than one of a certain card, guess that.
    for (let key of Object.keys(cardListGrouped)) {
      if (cardListGrouped[key].length > 1) {
        retCard = cardListGrouped[key][0];
        break;
      }
    }

    return retCard;
  }

  /**
   * Get list of remaining cards available for a guess.
   */
  private getRemainingGuessCards(game: Game) {
    let cardList = [];

    game.deck.forEach(card => {
      if (card.id !== 'guard') { cardList.push(card); }
    });

    game.players.forEach(player => {
      if (player !== game.activePlayer) {
        player.hand.forEach(card => {
          if (card.id !== 'guard') { cardList.push(card); }
        });
      }
    });

    // AI should not know about removed card.
    game.removedCards.forEach(card => {
      if (card.id !== 'guard') { cardList.push(card); }
    });

    return cardList;
  }

  /**
   * Returns the moves for all the cards.
   */
  getMoves(game: Game) {
    return {
      guard: this.guard(game),
      priest: this.priest(game),
      baron: this.baron(game),
      handmaid: this.handmaid(game),
      prince: this.prince(game),
      king: this.king(game),
      countess: this.countess(game),
      princess: this.princess(game)
    }
  }

  /**
   * Determines the best move the active player can makes based on their cards.
   */
  getBestMove(game: Game): Move {
    let activePlayer = game.activePlayer;
    let cards = [];
    let moves = this.getMoves(game);
    let returnMove: Move = {
      card: null,
      player: null,
      guess: null
    };

    // Build a list of cards the player has.
    activePlayer.hand.forEach(card => {
      cards.push(card.id);
    })

    // Play countess if you have to.
    if (moves.countess && (moves.prince || moves.king || moves.princess)) {
      returnMove = moves.countess;
    }

    // If you know a card, have a card that could possibly get them out, try.
    if (!returnMove.card && activePlayer.knownCards.length && (moves.guard || moves.baron || moves.prince)) {

      // Go through the known cards.
      activePlayer.knownCards.forEach(knownCard => {
        // If we found a card previously, don't bother.
        if (!returnMove.card) {
          // If the card isn't protected and isn't out - we try get them out.
          if (!knownCard.player.protected && !knownCard.player.out) {
            // Via guard.
            if (moves.guard && knownCard.card.id !== 'guard') {
              // Play the guard to get them out.
              returnMove = moves.guard;
            }
            // Via Baron.
            else if (moves.baron) {
               // Find out what out other card is.
              let otherCard = (cards.indexOf('baron') === 0) ? activePlayer.hand[1] : activePlayer.hand[0];

              // If we can win.
              if (otherCard.value > knownCard.card.value) {
                 // Play the baron to get them out.
                returnMove = moves.baron;
              }
            }
            // Via Prince
            else if (moves.prince && knownCard.card.id === 'princess') {
              // Play the prince to get them out.
              returnMove = moves.prince;
            }
          }
        }
      });
    }

    // Play a handmaid.
    if (!returnMove.card && moves.handmaid) {
      returnMove = moves.handmaid;
    }

    // Priest
    if (!returnMove.card && moves.priest) {
      returnMove = moves.priest;
    }

    // Baron with good win chance.
    if (!returnMove.card && moves.baron) {
      let otherCard = (game.activePlayer.hand.indexOf(moves.baron.card) === 0) ?
        game.activePlayer.hand[1] :
        game.activePlayer.hand[0];

      // Only play a baron here if we have a good win chance.
      if (otherCard.value > game.averageCardValue) {
        returnMove = moves.baron;
      }
    }

    // Guard
    if (!returnMove.card && moves.guard) {
      returnMove = moves.guard;
    }
    // Prince
    if (!returnMove.card && moves.prince) {
      returnMove = moves.prince;
    }

    // King
    if (!returnMove.card && moves.king) {
      returnMove = moves.king;
    }

    // Countess
    if (!returnMove.card && moves.countess) {
      returnMove = moves.countess;
    }

    // Baron with poor win chance.
    if (!returnMove.card && moves.baron) {
      returnMove = moves.baron;
    }

    // Princess as last resort
    if (!returnMove.card && moves.princess) {
      returnMove = moves.princess;
    }

    return returnMove;
  }

  /**
   * Return the best move for the Guard card.
   */
  guard(game: Game): Move {
    let move: Move = {
      card: this.getCard('guard', game),
      player: null,
      guess: null
    };

    // Don't bother if we don't have the card
    if (move.card) {
      // If we know any cards.
      if (game.activePlayer.knownCards.length) {
        // Go through the known cards and try to find an unprotected one.
        game.activePlayer.knownCards.forEach(knownCard => {
          if (!knownCard.player.protected && !knownCard.player.out && knownCard.card.id !== 'guard') {
            move.player = knownCard.player;
            move.guess = knownCard.card;
          }
        });

        // We didn't find an unprotected player - get another player if possible.
        if (!move.player) {
          move.player = this.getUnprotectedPlayer(game);
          if (move.player) {
            move.guess = this.getGuessCard(game);
          }
        }
      }
      else {
        move.player = this.getUnprotectedPlayer(game);
        if (move.player) {
          move.guess = this.getGuessCard(game);
        }
      }

      return move;
    }

    return null;
  }

  /**
   * Return the best move for the Priest card.
   * @TODO - dont check players we already know about.
   */
  priest(game: Game): Move {
    let move: Move = {
      card: this.getCard('priest', game),
      player: this.getUnprotectedPlayer(game),
      guess: null
    };

    return (move.card) ? move : null;
  }

  /**
   * Return the best move for the Baron card.
   */
  baron(game: Game): Move {
    let move: Move = {
      card: this.getCard('baron', game),
      player: this.getUnprotectedPlayer(game),
      guess: null
    };

    // Don't bother if we don't have the card
    if (move.card) {
      let otherCard = (game.activePlayer.hand.indexOf(move.card) === 0) ?
        game.activePlayer.hand[1] :
        game.activePlayer.hand[0];

      // If we know any cards.
      if (game.activePlayer.knownCards.length) {
        // Go through the known cards and try to find an unprotected one.
        game.activePlayer.knownCards.forEach(knownCard => {
          if (!knownCard.player.protected && !knownCard.player.out && otherCard.value > knownCard.card.value) {
            move.player = knownCard.player;
          }
        });
      }

      return move;
    }

    return null;
  }

  /**
   * Return the best move for the Handmaid card.
   */
  handmaid(game: Game): Move {
    let move: Move = {
      card: this.getCard('handmaid', game),
      player: null,
      guess: null
    };

    return (move.card) ? move : null;
  }

  /**
   * Return the best move for the Prince card.
   */
  prince(game: Game): Move {
    let move: Move = {
      card: this.getCard('prince', game),
      player: null,
      guess: null
    };


    // Don't bother if we don't have the card
    if (move.card) {
      // If we know any cards.
      if (game.activePlayer.knownCards.length) {
        // Go through the known cards and try to find an unprotected one.
        game.activePlayer.knownCards.forEach(knownCard => {
          if (!knownCard.player.protected && !knownCard.player.out && knownCard.card.id === 'princess') {
            move.player = knownCard.player;
          }
        });

        // We didn't find a princess - get another player or self.
        if (!move.player) {
          move.player = this.getUnprotectedPlayer(game) || game.activePlayer;
        }
      }
      else {
        // We don't know any cards - get another player or self.
        move.player = this.getUnprotectedPlayer(game) || game.activePlayer;
      }

      return move;
    }

    return null;
  }

  /**
   * Return the best move for the King card.
   */
  king(game: Game): Move {
    let move: Move = {
      card: this.getCard('king', game),
      player: this.getUnprotectedPlayer(game),
      guess: null
    };

    return (move.card) ? move : null;
  }

  /**
   * Return the best move for the Countess card.
   */
  countess(game: Game): Move {
    let move: Move = {
      card: this.getCard('countess', game),
      player: null,
      guess: null
    };

    return (move.card) ? move : null;
  }

  /**
   * Return the best move for the Princess card.
   */
  princess(game: Game): Move {
    let move: Move = {
      card: this.getCard('princess', game),
      player: null,
      guess: null
    };

    return (move.card) ? move : null;
  }
}
