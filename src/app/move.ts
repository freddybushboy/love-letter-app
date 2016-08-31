import { Card } from './card';
import { Player } from './player';

export interface Move {
  card: Card;
  player?: Player;
  guess?: Card;
}
