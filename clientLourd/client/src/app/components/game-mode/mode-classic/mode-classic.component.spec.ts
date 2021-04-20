import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeClassicComponent } from './mode-classic.component';

describe('ModeClassicComponent', () => {
  let component: ModeClassicComponent;
  let fixture: ComponentFixture<ModeClassicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeClassicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeClassicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
