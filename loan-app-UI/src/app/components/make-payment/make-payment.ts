


// src/app/components/make-payment.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment-service';
import { CustomerService } from '../../services/customer-service';
import { Auth } from '../../services/auth';
import { Customer } from '../../models/customer';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var Razorpay: any;

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-make-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-payment.html',
  styleUrl: './make-payment.css'
})
export class MakePayment implements OnInit, OnDestroy {
  amount = 0;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  agreedToTerms = false;
  id!: number;
  customerInfo: CustomerInfo | null = null;
  quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  private destroy$ = new Subject<void>();
  private rzpInstance: any = null;

  constructor(
    private paymentService: PaymentService,
    private customerService: CustomerService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.id = this.auth.getUserId() ?? 0;
    this.loadCustomerInfo();
    this.loadRazorpayScript();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up Razorpay instance
    if (this.rzpInstance) {
      this.rzpInstance = null;
    }
  }

  loadCustomerInfo(): void {
    this.customerService.getCustomerById(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cust: Customer | null) => {
          if (cust) {
            this.customerInfo = {
              name: `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Customer',
              email: cust.user?.email || 'customer@example.com',
              phone: cust.user?.phoneNumber || '9876543210'
            };
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load customer details.';
        }
      });
  }

  loadRazorpayScript(): void {
    if (typeof Razorpay !== 'undefined') {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onerror = () => {
      this.errorMessage = 'Failed to load payment gateway. Please refresh the page.';
    };
    document.body.appendChild(script);
  }

  setAmount(quickAmount: number): void {
    this.amount = quickAmount;
    this.clearMessages();
  }

  calculateProcessingFee(): number {
    // 2% processing fee, max ₹100
    return Math.min(Math.round(this.amount * 0.02), 100);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitPayment(): void {
    this.clearMessages();

    if (this.amount <= 0) {
      this.errorMessage = 'Please enter a valid amount.';
      return;
    }

    if (!this.agreedToTerms) {
      this.errorMessage = 'Please agree to the terms and conditions.';
      return;
    }

    if (!this.customerInfo) {
      this.errorMessage = 'Customer information is not loaded. Please refresh the page.';
      return;
    }

    this.isSubmitting = true;

    this.paymentService.createOrder(this.amount).pipe(
      takeUntil(this.destroy$),
      switchMap(order => {
        if (!order || !order.orderId) {
          throw new Error('Invalid order response');
        }
        this.launchRazorpay(order, this.customerInfo!);
        return of(order);
      }),
      catchError(error => {
        console.error('Payment initiation error:', error);
        this.errorMessage = error?.error?.message || 'Failed to initiate payment. Please try again.';
        this.isSubmitting = false;
        return of(null);
      })
    ).subscribe();
  }

  launchRazorpay(order: any, cust: CustomerInfo): void {
    if (typeof Razorpay === 'undefined') {
      this.errorMessage = 'Payment gateway not loaded. Please refresh the page.';
      this.isSubmitting = false;
      return;
    }

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'New Loan Portal',
      description: 'Loan Payment',
      order_id: order.orderId,
      handler: (response: any) => this.handlePaymentSuccess(response),
      prefill: {
        name: cust.name,
        email: cust.email,
        contact: cust.phone
      },
      theme: {
        color: '#0d6efd'
      },
      modal: {
        ondismiss: () => this.handlePaymentDismiss(),
        escape: false,
        backdropclose: false
      }
    };

    try {
      this.rzpInstance = new Razorpay(options);
      
      this.rzpInstance.on('payment.failed', (response: any) => {
        this.handlePaymentFailure(response);
      });

      this.rzpInstance.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      this.errorMessage = 'Failed to open payment gateway. Please try again.';
      this.isSubmitting = false;
    }
  }

  handlePaymentSuccess(response: any): void {
    this.successMessage = `Payment successful! Transaction ID: ${response.razorpay_payment_id}`;
    this.isSubmitting = false;
    this.amount = 0;
    this.agreedToTerms = false;

    // Send payment verification to backend
    this.verifyPayment(response);
  }

  handlePaymentFailure(response: any): void {
    const reason = response.error?.reason || response.error?.description || 'Unknown error';
    this.errorMessage = `Payment failed: ${reason}`;
    this.isSubmitting = false;
  }

  handlePaymentDismiss(): void {
    this.errorMessage = 'Payment cancelled by user.';
    this.isSubmitting = false;
  }

  verifyPayment(response: any): void {
    // Implement backend verification call
    const verificationData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    // Call your backend verification service
    // this.paymentService.verifyPayment(verificationData).subscribe({
    //   next: () => console.log('Payment verified'),
    //   error: (err) => console.error('Verification failed:', err)
    // });
    
    console.log('Payment verification data:', verificationData);
  }
}