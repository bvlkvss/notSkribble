import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvoWindowComponent } from './convo-window.component';

describe('ConvoWindowComponent', () => {
  let component: ConvoWindowComponent;
  let fixture: ComponentFixture<ConvoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvoWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvoWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
