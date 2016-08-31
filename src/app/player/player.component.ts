import { Component, Input } from '@angular/core';
import { Player } from '../player';
import { Card } from '../card';
import { CardComponent } from '../card/card.component';

@Component({
  moduleId: module.id,
  selector: 'app-player',
  templateUrl: 'player.component.html',
  directives: [CardComponent]
})
export class PlayerComponent {
  @Input() player: Player;
  @Input() activePlayer: Player;
  @Input() winner: Player;
  @Input() choosePlayer;
  @Input() draw;
  @Input() playCard;
  @Input() playedCard: Card;
  @Input() promptOpen: Boolean;
}
