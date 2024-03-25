import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConferenceListComponent } from './conference-list.component';

describe('ConferenceListComponent', () => {
  let component: ConferenceListComponent;
  let fixture: ComponentFixture<ConferenceListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConferenceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConferenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
