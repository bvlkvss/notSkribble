import { TestBed } from '@angular/core/testing';

import { RoomMessagesService } from './room-messages.service';

describe('RoomMessagesService', () => {
  let service: RoomMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
