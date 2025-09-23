import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanSchemes } from './loan-schemes';

describe('LoanSchemes', () => {
  let component: LoanSchemes;
  let fixture: ComponentFixture<LoanSchemes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanSchemes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanSchemes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
