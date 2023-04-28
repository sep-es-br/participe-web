import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetPanelComponent } from './meet-panel.component';

describe('MeetPanelComponent', () => {
  let component: MeetPanelComponent;
  let fixture: ComponentFixture<MeetPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
