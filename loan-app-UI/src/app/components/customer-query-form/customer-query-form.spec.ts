import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQueryForm } from './customer-query-form';

describe('CustomerQueryForm', () => {
  let component: CustomerQueryForm;
  let fixture: ComponentFixture<CustomerQueryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerQueryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerQueryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
