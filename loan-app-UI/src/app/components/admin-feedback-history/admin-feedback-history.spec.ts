import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeedbackHistory } from './admin-feedback-history';

describe('AdminFeedbackHistory', () => {
  let component: AdminFeedbackHistory;
  let fixture: ComponentFixture<AdminFeedbackHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFeedbackHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFeedbackHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
