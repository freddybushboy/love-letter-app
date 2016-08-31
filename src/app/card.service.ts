import { Injectable } from '@angular/core';
import { Card } from './card';

@Injectable()
export class CardService {
  getDeck(): Card[] {
    return [
      { id: 'guard', value: 1, name: 'Guard', description: 'Guess a player\'s hand' },
      { id: 'guard', value: 1, name: 'Guard', description: 'Guess a player\'s hand' },
      { id: 'guard', value: 1, name: 'Guard', description: 'Guess a player\'s hand' },
      { id: 'guard', value: 1, name: 'Guard', description: 'Guess a player\'s hand' },
      { id: 'guard', value: 1, name: 'Guard', description: 'Guess a player\'s hand' },
      { id: 'priest', value: 2, name: 'Priest', description: 'Look at a hand' },
      { id: 'priest', value: 2, name: 'Priest', description: 'Look at a hand' },
      { id: 'baron', value: 3, name: 'Baron', description: 'Compare hands; lower hand is out' },
      { id: 'baron', value: 3, name: 'Baron', description: 'Compare hands; lower hand is out' },
      { id: 'handmaid', value: 4, name: 'Handmaid', description: 'Protection until your next turn' },
      { id: 'handmaid', value: 4, name: 'Handmaid', description: 'Protection until your next turn' },
      { id: 'prince', value: 5, name: 'Prince', description: 'One player discards his or her hand' },
      { id: 'prince', value: 5, name: 'Prince', description: 'One player discards his or her hand' },
      { id: 'king', value: 6, name: 'King', description: 'Trade hands' },
      { id: 'countess', value: 7, name: 'Countess', description: 'Discard if caught with King or Prince' },
      { id: 'princess', value: 8, name: 'Princess', description: 'Lose if discarded' }
    ];
  }
  getCardList() {
    return cardList;
  }
}

let cardList = [
  { id: 'priest', name: 'Priest' },
  { id: 'baron', name: 'Baron' },
  { id: 'handmaid', name: 'Handmaid' },
  { id: 'prince', name: 'Prince' },
  { id: 'king', name: 'King' },
  { id: 'countess', name: 'Countess' },
  { id: 'princess', name: 'Princess' }
];
