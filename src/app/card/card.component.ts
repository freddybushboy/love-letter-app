import { Component, Input } from '@angular/core';
import { Card } from '../card';

@Component({
  moduleId: module.id,
  selector: 'app-card',
  templateUrl: 'card.component.html'
})
export class CardComponent {
  @Input() card: Card;
  @Input() reveal: Boolean;
}
