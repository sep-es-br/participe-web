import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalEvaluationComponent } from './proposal-evaluation.component';

describe('ProposalEvaluationComponent', () => {
  let component: ProposalEvaluationComponent;
  let fixture: ComponentFixture<ProposalEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalEvaluationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProposalEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
