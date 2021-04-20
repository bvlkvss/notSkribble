import { TestBed } from '@angular/core/testing';

import { ChatWindowManagerService } from './chat-window-manager.service';

describe('ChatWindowManagerService', () => {
  let service: ChatWindowManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatWindowManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
