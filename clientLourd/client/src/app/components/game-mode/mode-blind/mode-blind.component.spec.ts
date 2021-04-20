import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeBlindComponent } from './mode-blind.component';

describe('ModeBlindComponent', () => {
  let component: ModeBlindComponent;
  let fixture: ComponentFixture<ModeBlindComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeBlindComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeBlindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
