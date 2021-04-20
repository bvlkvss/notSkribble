import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawImageComponent } from './draw-image.component';

describe('DrawImageComponent', () => {
  let component: DrawImageComponent;
  let fixture: ComponentFixture<DrawImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
