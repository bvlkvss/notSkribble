import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDrawingComponent } from './preview-drawing.component';

describe('PreviewDrawingComponent', () => {
  let component: PreviewDrawingComponent;
  let fixture: ComponentFixture<PreviewDrawingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewDrawingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
