// src/app/components/make-payment.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment-service';
import { CustomerService } from '../../services/customer-service';
import { Auth } from '../../services/auth';
import { Customer } from '../../models/customer';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

declare var Razorpay: any;

@Component({
  selector: 'app-make-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-payment.html',
  styleUrl: './make-payment.css'
})
export class MakePayment implements OnInit {
  amount = 0;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  id!: number;

  constructor(
    private paymentService: PaymentService,
    private customerService: CustomerService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.id = this.auth.getUserId() ?? 0;
  }

  submitPayment(): void {
    if (this.amount <= 0) {
      this.errorMessage = 'Please enter a valid amount.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.customerService.getCustomerById(this.id).pipe(
      switchMap((cust: Customer | null) => {
        if (!cust) {
          this.errorMessage = 'Customer details not found.';
          this.isSubmitting = false;
          return of(null);
        }
        return this.paymentService.createOrder(this.amount).pipe(
          switchMap(order => {
            this.launchRazorpay(order, cust);
            return of(order);
          })
        );
      })
    ).subscribe({
      error: () => {
        this.errorMessage = 'Failed to initiate payment.';
        this.isSubmitting = false;
      }
    });
  }

  launchRazorpay(order: any, cust: Customer): void {
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: 'New Loan Portal',
      description: 'Loan Payment',
      order_id: order.orderId,
      handler: (response: any) => {
        this.successMessage = `Payment successful. Razorpay ID: ${response.razorpay_payment_id}`;
        this.isSubmitting = false;
        // Optionally send response to backend for verification
      },
      prefill: {
        name: cust.firstName ?? 'Customer',
        email: cust.user?.email ?? 'test@test.com',
        contact: cust.user?.phoneNumber ?? '9876543210'
      },
      theme: {
        color: '#0d6efd'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}