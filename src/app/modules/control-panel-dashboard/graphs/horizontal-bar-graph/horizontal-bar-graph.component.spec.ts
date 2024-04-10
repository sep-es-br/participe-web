import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HorizontalBarGraphComponent } from './horizontal-bar-graph.component';

describe('HorizontalBarGraphComponent', () => {
  let component: HorizontalBarGraphComponent;
  let fixture: ComponentFixture<HorizontalBarGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizontalBarGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalBarGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
