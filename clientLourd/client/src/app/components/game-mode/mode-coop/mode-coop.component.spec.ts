import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeCoopComponent } from './mode-coop.component';

describe('ModeCoopComponent', () => {
  let component: ModeCoopComponent;
  let fixture: ComponentFixture<ModeCoopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeCoopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeCoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
