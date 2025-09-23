import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanOfficers } from './loan-officers';

describe('LoanOfficers', () => {
  let component: LoanOfficers;
  let fixture: ComponentFixture<LoanOfficers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanOfficers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanOfficers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
