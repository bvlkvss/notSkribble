import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyTeamsComponent } from './lobby-teams.component';

describe('LobbyTeamsComponent', () => {
  let component: LobbyTeamsComponent;
  let fixture: ComponentFixture<LobbyTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LobbyTeamsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
