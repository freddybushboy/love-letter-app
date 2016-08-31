/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { CardService } from './card.service';

describe('Service: Card', () => {
  beforeEach(() => {
    addProviders([CardService]);
  });

  it('should ...',
    inject([CardService],
      (service: CardService) => {
        expect(service).toBeTruthy();
      }));
});
