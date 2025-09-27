import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerApplications } from './customer-applications';

describe('CustomerApplications', () => {
  let component: CustomerApplications;
  let fixture: ComponentFixture<CustomerApplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerApplications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerApplications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
