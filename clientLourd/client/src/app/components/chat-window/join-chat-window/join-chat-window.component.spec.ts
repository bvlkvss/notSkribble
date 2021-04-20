import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinChatWindowComponent } from './join-chat-window.component';

describe('JoinChatWindowComponent', () => {
  let component: JoinChatWindowComponent;
  let fixture: ComponentFixture<JoinChatWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinChatWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
