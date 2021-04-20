import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomMessageComponent } from './room-message.component';

describe('RoomMessageComponent', () => {
  let component: RoomMessageComponent;
  let fixture: ComponentFixture<RoomMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
