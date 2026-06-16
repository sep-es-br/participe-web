import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewAuthorityComponent } from './new-authority.component';

describe('NewAuthorityComponent', () => {
  let component: NewAuthorityComponent;
  let fixture: ComponentFixture<NewAuthorityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAuthorityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
