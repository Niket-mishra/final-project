import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';
import { Customer } from '../../models/customer';

@Component({
  selector: 'app-customer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-settings.html',
  styleUrl: './customer-settings.css'
})
export class CustomerSettings implements OnInit {
  isLoading = true;
  errorMessage = '';
  customer?: Customer;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getCurrentCustomer().subscribe({
      next: (data: Customer) => {
        this.customer = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load customer settings.';
        this.isLoading = false;
      }
    });
  }

  save(): void {
    if (!this.customer) return;

    this.customerService.updateCustomer(this.customer.customerId, this.customer).subscribe({
      next: () => alert('Settings saved successfully.'),
      error: () => alert('Failed to save settings.')
    });
  }
}