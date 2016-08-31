import { Component } from '@angular/core';
import { CardService } from './card.service';
import { PlayerService } from './player.service';
import { MoveService } from './move.service';
import { PlayerComponent } from './player/player.component';
import { CardComponent } from './card/card.component';
import { Card } from './card';
import { Player } from './player';
import { Game } from './game';


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [CardService, PlayerService, MoveService],
  directives: [PlayerComponent, CardComponent]
})
export class AppComponent {

  constructor(private cardService: CardService, private playerService: PlayerService, private moveService: MoveService) {}

  game: Game = new Game(this.cardService, this.playerService, this.moveService);

  newGame() {
    this.game = new Game(this.cardService, this.playerService, this.moveService);
    this.game.newGame();
  }
}
