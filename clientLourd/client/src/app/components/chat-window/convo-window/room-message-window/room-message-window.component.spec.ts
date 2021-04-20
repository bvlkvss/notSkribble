import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomMessageWindowComponent } from './room-message-window.component';

describe('RoomMessageWindowComponent', () => {
  let component: RoomMessageWindowComponent;
  let fixture: ComponentFixture<RoomMessageWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomMessageWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomMessageWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
