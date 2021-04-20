import { TestBed } from '@angular/core/testing';

import { ClassicService } from './classic.service';

describe('ClassicService', () => {
  let service: ClassicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
