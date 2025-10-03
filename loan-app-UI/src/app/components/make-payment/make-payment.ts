// src/app/components/make-payment.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';
import { Auth } from '../../services/auth';
import { Customer } from '../../models/customer';
import { RepaymentService } from '../../services/repayment-service';
import { Repayment } from '../../models/repayment';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user-service';

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
  styleUrls: ['./make-payment.css']
})
export class MakePayment implements OnInit, OnDestroy {
  amount = 0;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  agreedToTerms = false;
  id!: number;
  custId!: number;
  customerInfo: CustomerInfo | null = null;
  quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  private destroy$ = new Subject<void>();
  private rzpInstance: any = null;

  constructor(
    private customerService: CustomerService,
    private repaymentService: RepaymentService,
    private userService: UserService,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.auth.getUserId() ?? 0;
    
    this.loadRazorpayScript();
      this.loadCustomerInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.rzpInstance) {
      this.rzpInstance = null;
    }
  }

  loadCustomerInfo(): void {
    this.userService.getRoleEntityId(this.id)
    .pipe(
      takeUntil(this.destroy$),
      switchMap(({ roleEntityId }) => {
        this.custId = roleEntityId;
        return this.customerService.getCustomerById(this.custId);
      })
    )
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
    return Math.min(Math.round(this.amount * 0.02), 100); // 2% max ₹100
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
      this.errorMessage = 'Customer information not loaded. Please refresh.';
      return;
    }

    this.isSubmitting = true;
    this.launchRazorpay(this.customerInfo);
  }

  launchRazorpay(cust: CustomerInfo): void {
    if (typeof Razorpay === 'undefined') {
      this.errorMessage = 'Payment gateway not loaded. Please refresh.';
      this.isSubmitting = false;
      return;
    }

    const options = {
      key: 'rzp_test_RMguG9RxmKNynf', // 🔹 Replace with your test/live key
      amount: this.amount * 100,   // in paise
      currency: 'INR',
      name: 'New Loan Portal',
      description: 'Loan Repayment',
      handler: (response: any) => this.handlePaymentSuccess(response),
      prefill: {
        name: cust.name,
        email: cust.email,
        contact: cust.phone
      },
      theme: { color: '#0d6efd' },
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
      console.error('Razorpay init error:', error);
      this.errorMessage = 'Failed to open payment gateway.';
      this.isSubmitting = false;
    }
  }

  handlePaymentSuccess(response: any): void {
    this.successMessage = `Payment successful! Transaction ID: ${response.razorpay_payment_id}`;
    this.isSubmitting = false;

    // 🔹 Save repayment into DB
    const repaymentPayload: Repayment = {
      repaymentId: 0,
      loanId: 0, // ⚠️ TODO: if you have loanId in context, pass it here
      amount: this.amount,
      emiNumber: 1,
      penaltyPaid: 0,
      lateFee: 0,
      paymentDate: new Date(),
      dueDate: new Date(),
      paymentMode: 'Razorpay',
      transactionId: response.razorpay_payment_id,
      paymentGatewayResponse: JSON.stringify(response),
      paymentStatus: 'Completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.repaymentService.createRepayment(repaymentPayload).subscribe({
      next: () => {
        console.log('Repayment saved in DB ✅'),
        this.cdr.markForCheck();
      },
      error: err => console.error('Failed to save repayment ❌', err)
    });

    this.amount = 0;
    this.agreedToTerms = false;
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
}
