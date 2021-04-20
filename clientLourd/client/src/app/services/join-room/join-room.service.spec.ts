import { TestBed } from '@angular/core/testing';

import { JoinRoomService } from './join-room.service';

describe('JoinRoomService', () => {
  let service: JoinRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
