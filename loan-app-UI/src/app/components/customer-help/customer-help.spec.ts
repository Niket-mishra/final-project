import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHelp } from './customer-help';

describe('CustomerHelp', () => {
  let component: CustomerHelp;
  let fixture: ComponentFixture<CustomerHelp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerHelp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerHelp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
