import { TestBed } from '@angular/core/testing';

import { SvgArrayService } from './svg-array.service';

describe('SvgArrayService', () => {
  let service: SvgArrayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgArrayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
