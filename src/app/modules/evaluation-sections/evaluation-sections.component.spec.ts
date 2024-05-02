import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationSectionsComponent } from './evaluation-sections.component';

describe('EvaluationSectionsComponent', () => {
  let component: EvaluationSectionsComponent;
  let fixture: ComponentFixture<EvaluationSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationSectionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EvaluationSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
