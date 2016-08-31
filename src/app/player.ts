import { Card } from './card';
import { knownCard } from './known-card';

export interface Player {
  id: number;
  name: string;
  finalScore?: number;
  hand: Card[];
  playedCards?: Card[];
  preferredPlayer?: Player;
  protected: boolean;
  out: boolean;
  knownCards: Array<knownCard>;
  human: boolean;
}
