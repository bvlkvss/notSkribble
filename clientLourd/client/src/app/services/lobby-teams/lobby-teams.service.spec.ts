import { TestBed } from '@angular/core/testing';

import { LobbyTeamsService } from './lobby-teams.service';

describe('LobbyTeamsService', () => {
  let service: LobbyTeamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobbyTeamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
