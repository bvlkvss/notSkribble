import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoJoinComponent } from './no-join.component';

describe('NoJoinComponent', () => {
  let component: NoJoinComponent;
  let fixture: ComponentFixture<NoJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoJoinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
