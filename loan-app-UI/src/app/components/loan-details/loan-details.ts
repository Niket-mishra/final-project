import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Loan } from '../../models/loan';
import { LoanService } from '../../services/loan-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loan-details.html',
  styleUrls: ['./loan-details.css']
})
export class LoanDetails implements OnInit {
  @Input() applicationId!: number;

  loan?: Loan;
  isLoading = true;

  private loanService = inject(LoanService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadLoanDetails();
    } else {
      this.toast.error('No application ID provided');
      this.isLoading = false;
    }
  }

  loadLoanDetails(): void {
    this.isLoading = true;
    this.loanService.getLoanByApplication(this.applicationId).subscribe({
      next: (loan) => {
        this.loan = loan;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load loan details');
        this.isLoading = false;
      }
    });
  }
}