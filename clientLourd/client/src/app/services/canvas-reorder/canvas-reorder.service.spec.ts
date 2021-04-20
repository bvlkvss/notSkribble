import { TestBed } from '@angular/core/testing';

import { CanvasReorderService } from './canvas-reorder.service';

describe('CanvasReorderService', () => {
  let service: CanvasReorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasReorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
