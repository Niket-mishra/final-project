import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLoans } from './customer-loans';

describe('CustomerLoans', () => {
  let component: CustomerLoans;
  let fixture: ComponentFixture<CustomerLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerLoans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerLoans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
