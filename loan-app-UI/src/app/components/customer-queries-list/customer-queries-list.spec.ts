import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQueriesList } from './customer-queries-list';

describe('CustomerQueriesList', () => {
  let component: CustomerQueriesList;
  let fixture: ComponentFixture<CustomerQueriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerQueriesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerQueriesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
