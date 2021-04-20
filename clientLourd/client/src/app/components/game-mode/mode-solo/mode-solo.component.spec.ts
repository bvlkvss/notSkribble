import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeSoloComponent } from './mode-solo.component';

describe('ModeSoloComponent', () => {
  let component: ModeSoloComponent;
  let fixture: ComponentFixture<ModeSoloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeSoloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeSoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
