import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyCoopComponent } from './lobby-coop.component';

describe('LobbyCoopComponent', () => {
  let component: LobbyCoopComponent;
  let fixture: ComponentFixture<LobbyCoopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LobbyCoopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyCoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
