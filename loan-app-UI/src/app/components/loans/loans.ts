import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Loan } from '../../models/loan';
import { LoanService } from '../../services/loan-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loans.html',
  styleUrls: ['./loans.css']
})
export class Loans implements OnInit {
  loans: Loan[] = [];
  isLoading = true;

  private loanService = inject(LoanService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loanService.getAllLoans().subscribe({
      next: (data) => {
        this.loans = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load loans');
        this.isLoading = false;
      }
    });
  }
}