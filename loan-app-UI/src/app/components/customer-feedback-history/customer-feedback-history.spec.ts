import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFeedbackHistory } from './customer-feedback-history';

describe('CustomerFeedbackHistory', () => {
  let component: CustomerFeedbackHistory;
  let fixture: ComponentFixture<CustomerFeedbackHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
