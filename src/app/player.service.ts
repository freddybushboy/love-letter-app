import { Injectable } from '@angular/core';
import { Player } from './player';

@Injectable()
export class PlayerService {
  getPlayers(): Player[] {
    return [
      { id: 1, name: '🌚 Moon', hand: [], playedCards: [], protected: false, out: false, knownCards: [], human: false },
      { id: 2, name: '🌞 Sun', hand: [], playedCards: [], protected: false, out: false, knownCards: [], human: false},
      { id: 3, name: '👦🏽 Human', hand: [], playedCards: [], protected: false, out: false, knownCards: [], human: true }
    ];
  }
}
