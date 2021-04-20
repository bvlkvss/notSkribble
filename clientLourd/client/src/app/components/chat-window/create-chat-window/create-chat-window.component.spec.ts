import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChatWindowComponent } from './create-chat-window.component';

describe('CreateChatWindowComponent', () => {
  let component: CreateChatWindowComponent;
  let fixture: ComponentFixture<CreateChatWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateChatWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
