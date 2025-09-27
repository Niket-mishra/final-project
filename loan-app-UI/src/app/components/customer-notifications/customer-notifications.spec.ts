import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerNotifications } from './customer-notifications';

describe('CustomerNotifications', () => {
  let component: CustomerNotifications;
  let fixture: ComponentFixture<CustomerNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerNotifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
