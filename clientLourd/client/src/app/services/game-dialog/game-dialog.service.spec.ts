import { TestBed } from '@angular/core/testing';

import { GameDialogService } from './game-dialog.service';

describe('GameDialogService', () => {
  let service: GameDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
