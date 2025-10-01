import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer-service';
import { Customer } from '../../models/customer';
import { CustomerProfileComponent } from '../customer-profile-component/customer-profile-component';

@Component({
  selector: 'app-customers',
  standalone: true,
  templateUrl: "./customers.html",
  styleUrl: './customers.css',
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

  viewProfile(selectedCustomer: Customer): void {
    this.selectedCustomer = selectedCustomer;
  }

  closeProfile(): void {
    this.selectedCustomer = null;
  }
}