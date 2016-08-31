/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { Game } from './game';
import { CardService } from './card.service';
import { PlayerService } from './player.service';
import { MoveService } from './move.service';

let cardService = new CardService();
let playerService = new PlayerService();
let moveService = new MoveService();

let freshGame = new Game(cardService, playerService, moveService);
freshGame.newGame();

describe('Game start', () => {

  it('gets a deck when stating a new game', () => {
    let game = new Game(cardService, playerService, moveService);

    game.newGame();
    expect(game.deck[0].id).toEqual('guard');
  });

  it('gets the players when stating a new game', () => {
    let game = new Game(cardService, playerService, moveService);

    game.newGame();
    expect(game.players[0].id).toEqual(1);
  });

  it('gives the players cards when starting a game', () => {
    expect(freshGame.players[0].hand.length).toBeGreaterThan(0);
    expect(freshGame.players[1].hand.length).toBeGreaterThan(0);
    expect(freshGame.players[2].hand.length).toBeGreaterThan(0);
  });

  it('sets an active player when starting a game', () => {
    expect(freshGame.activePlayer).toBeDefined();
  });

});
