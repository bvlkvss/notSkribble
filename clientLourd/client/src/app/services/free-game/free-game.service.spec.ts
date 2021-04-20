import { TestBed } from '@angular/core/testing';

import { FreeGameService } from './free-game.service';

describe('FreeGameService', () => {
  let service: FreeGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreeGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
