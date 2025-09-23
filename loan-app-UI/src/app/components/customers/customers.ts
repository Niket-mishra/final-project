import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer-service';
import { Customer } from '../../models/customer';
import { CustomerProfileComponent } from '../customer-profile-component/customer-profile-component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CustomerProfileComponent],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isLoading = false;
  error = '';

  constructor(private service: CustomerService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.service.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load customers.';
        this.isLoading = false;
      }
    });
  }

  viewProfile(customer: Customer): void {
    this.selectedCustomer = customer;
  }

  closeProfile(): void {
    this.selectedCustomer = null;
  }
}