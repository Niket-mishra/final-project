import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQueries } from './customer-queries';

describe('CustomerQueries', () => {
  let component: CustomerQueries;
  let fixture: ComponentFixture<CustomerQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerQueries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerQueries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
