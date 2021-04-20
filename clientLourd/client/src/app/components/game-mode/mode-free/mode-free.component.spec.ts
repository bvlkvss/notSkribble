import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeFreeComponent } from './mode-free.component';

describe('ModeFreeComponent', () => {
  let component: ModeFreeComponent;
  let fixture: ComponentFixture<ModeFreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeFreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeFreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
