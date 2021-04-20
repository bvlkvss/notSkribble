import { TestBed } from '@angular/core/testing';

import { RoomMessagesWindowService } from './room-messages-window.service';

describe('RoomMessagesWindowService', () => {
  let service: RoomMessagesWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomMessagesWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
