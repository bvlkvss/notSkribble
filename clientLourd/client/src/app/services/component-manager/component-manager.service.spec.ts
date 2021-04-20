import { TestBed } from '@angular/core/testing';

import { ComponentManagerService } from './component-manager.service';

describe('ComponentManagerService', () => {
  let service: ComponentManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
