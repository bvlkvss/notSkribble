import { TestBed } from '@angular/core/testing';

import { ConvoManagerService } from './convo-manager.service';

describe('ConvoManagerService', () => {
  let service: ConvoManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvoManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
