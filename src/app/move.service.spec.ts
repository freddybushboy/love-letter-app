/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { Game } from './game';
import { CardService } from './card.service';
import { PlayerService } from './player.service';
import { MoveService } from './move.service';

let cardService = new CardService();
let playerService = new PlayerService();
let moveService = new MoveService();

describe('Move service', () => {

  it('finds correct moves for the active player', () => {
    let game = new Game(cardService, playerService, moveService);

    game.deck = [{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"priest","value":2,"name":"Priest","description":"Look at a hand"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"princess","value":8,"name":"Princess","description":"Lose if discarded"}];
    game.players = [
      {"id":1,"name":"🌚 Moon","hand":[{"id":"king","value":6,"name":"King","description":"Trade hands"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":2,"name":"🌞 Sun","hand":[{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":3,"name":"👦🏽 Human","hand":[{"id":"countess","value":7,"name":"Countess","description":"Discard if caught with King or Prince"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":true}
    ];

    game.activePlayer = game.players[0];
    game.activePlayer.hand.push({"id":"priest","value":2,"name":"Priest","description":"Look at a hand"});

    expect(moveService.king(game)).not.toEqual(null);
    expect(moveService.priest(game)).not.toEqual(null);
    expect(moveService.guard(game)).toEqual(null);
    expect(moveService.baron(game)).toEqual(null);
    expect(moveService.handmaid(game)).toEqual(null);
    expect(moveService.prince(game)).toEqual(null);
    expect(moveService.countess(game)).toEqual(null);
    expect(moveService.princess(game)).toEqual(null);
  });

  it('finds guesses cards with more likelyhood', () => {
    let game = new Game(cardService, playerService, moveService);

    game.deck = [{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"priest","value":2,"name":"Priest","description":"Look at a hand"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"king","value":6,"name":"King","description":"Trade hands"},{"id":"princess","value":8,"name":"Princess","description":"Lose if discarded"}];
    game.players = [
      {"id":1,"name":"🌚 Moon","hand":[{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":2,"name":"🌞 Sun","hand":[{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":3,"name":"👦🏽 Human","hand":[{"id":"countess","value":7,"name":"Countess","description":"Discard if caught with King or Prince"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":true}
    ];

    game.activePlayer = game.players[0];

    expect(moveService.guard(game).guess.id).toEqual('baron');

    game.removedCards = [{"id":"priest","value":2,"name":"Priest","description":"Look at a hand"}];

    expect(moveService.guard(game).guess.id).toEqual('priest');

    game.removedCards = [];

    game.activePlayer.hand.push({"id":"priest","value":2,"name":"Priest","description":"Look at a hand"});

    expect(moveService.guard(game).guess.id).toEqual('baron');
  });

  it('finds does not consider cards in the active players hands as guessable', () => {
    let game = new Game(cardService, playerService, moveService);

    game.deck = [{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"priest","value":2,"name":"Priest","description":"Look at a hand"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"king","value":6,"name":"King","description":"Trade hands"},{"id":"princess","value":8,"name":"Princess","description":"Lose if discarded"}];
    game.players = [
      {"id":1,"name":"🌚 Moon","hand":[{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":2,"name":"🌞 Sun","hand":[{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":3,"name":"👦🏽 Human","hand":[{"id":"countess","value":7,"name":"Countess","description":"Discard if caught with King or Prince"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":true}
    ];

    game.activePlayer = game.players[0];

    game.activePlayer.hand.push({"id":"priest","value":2,"name":"Priest","description":"Look at a hand"});

    expect(moveService.guard(game).guess.id).toEqual('baron');
  });

  it('guesses known cards', () => {
    let game = new Game(cardService, playerService, moveService);

    game.deck = [{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"},{"id":"priest","value":2,"name":"Priest","description":"Look at a hand"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"baron","value":3,"name":"Baron","description":"Compare hands; lower hand is out"},{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"prince","value":5,"name":"Prince","description":"One player discards his or her hand"},{"id":"king","value":6,"name":"King","description":"Trade hands"},{"id":"princess","value":8,"name":"Princess","description":"Lose if discarded"}];
    game.players = [
      {"id":1,"name":"🌚 Moon","hand":[{"id":"guard","value":1,"name":"Guard","description":"Guess a player's hand"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":2,"name":"🌞 Sun","hand":[{"id":"handmaid","value":4,"name":"Handmaid","description":"Protection until your next turn"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":false},
      {"id":3,"name":"👦🏽 Human","hand":[{"id":"countess","value":7,"name":"Countess","description":"Discard if caught with King or Prince"}],"playedCards":[],"protected":false,"out":false,"knownCards":[],"human":true}
    ];

    game.activePlayer = game.players[0];
    game.activePlayer.knownCards = [{player: game.players[1], card: game.players[1].hand[0]}];

    expect(moveService.guard(game).guess.id).toEqual('handmaid');
  });

});
