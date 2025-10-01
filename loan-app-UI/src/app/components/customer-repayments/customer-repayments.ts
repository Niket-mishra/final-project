import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepaymentService } from '../../services/repayment-service';
import { Repayment } from '../../models/repayment';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-customer-repayments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-repayments.html',
  styleUrl: './customer-repayments.css'
})
export class CustomerRepayments implements OnInit {
  isLoading = true;
  errorMessage = '';
  repayments: Repayment[] = [];

  constructor(private repaymentService: RepaymentService, private auth: Auth) {}

  ngOnInit(): void {
    const customerId = this.auth.getUserId();
    if (typeof customerId !== 'number') {
      this.errorMessage = 'Customer ID not found.';
      this.isLoading = false;
      return;
    }
    this.repaymentService.getRepaymentsByCustomer(customerId).subscribe({
      next: (data: Repayment[]) => {
        this.repayments = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load repayment records.';
        this.isLoading = false;
      }
    });
  }

  getStatusBadge(status?: string): string {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'danger';
      default: return 'secondary';
    }
  }
}