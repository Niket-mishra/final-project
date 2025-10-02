

// src/app/components/all-loans.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Loan {
  loanId: number;
  sanctionedAmount: number;
  loanStatus: string;
  loanStartDate: string;
  loanEndDate?: string;
  interestRate?: number;
  tenure?: number;
  emiAmount?: number;
  paidAmount?: number;
}

@Component({
  selector: 'app-all-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loans.html',
  styleUrl: './loans.css'
})
export class Loans implements OnInit, OnDestroy {
  loans: Loan[] = [];
  filteredLoans: Loan[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = '';
  sortBy = 'date-desc';
  currentPage = 1;
  itemsPerPage = 6;

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLoans(): void {
    this.isLoading = true;
    
    // Replace with your actual service call
    // this.loanService.getAllLoans()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (loans) => {
    //       this.loans = loans;
    //       this.filterLoans();
    //       this.isLoading = false;
    //     },
    //     error: (error) => {
    //       console.error('Error loading loans:', error);
    //       this.isLoading = false;
    //     }
    //   });

    // Mock data for demonstration
    setTimeout(() => {
      this.loans = [
        {
          loanId: 1001,
          sanctionedAmount: 500000,
          loanStatus: 'ACTIVE',
          loanStartDate: '2024-01-15',
          loanEndDate: '2027-01-15',
          interestRate: 8.5,
          tenure: 36,
          emiAmount: 15800,
          paidAmount: 150000
        },
        {
          loanId: 1002,
          sanctionedAmount: 250000,
          loanStatus: 'PENDING',
          loanStartDate: '2024-10-01',
          interestRate: 9.0,
          tenure: 24
        },
        {
          loanId: 1003,
          sanctionedAmount: 750000,
          loanStatus: 'APPROVED',
          loanStartDate: '2024-09-20',
          interestRate: 8.0,
          tenure: 48
        }
      ];
      this.filterLoans();
      this.isLoading = false;
    }, 1000);
  }

  filterLoans(): void {
    let filtered = [...this.loans];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.loanId.toString().includes(search) ||
        loan.sanctionedAmount.toString().includes(search)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(loan => loan.loanStatus === this.statusFilter);
    }

    this.filteredLoans = filtered;
    this.sortLoans();
  }

  sortLoans(): void {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredLoans.sort((a, b) => 
          new Date(b.loanStartDate).getTime() - new Date(a.loanStartDate).getTime()
        );
        break;
      case 'date-asc':
        this.filteredLoans.sort((a, b) => 
          new Date(a.loanStartDate).getTime() - new Date(b.loanStartDate).getTime()
        );
        break;
      case 'amount-desc':
        this.filteredLoans.sort((a, b) => b.sanctionedAmount - a.sanctionedAmount);
        break;
      case 'amount-asc':
        this.filteredLoans.sort((a, b) => a.sanctionedAmount - b.sanctionedAmount);
        break;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'date-desc';
    this.filterLoans();
  }

  getTotalAmount(): number {
    return this.loans.reduce((sum, loan) => sum + loan.sanctionedAmount, 0);
  }

  getActiveLoansCount(): number {
    return this.loans.filter(loan => loan.loanStatus === 'ACTIVE').length;
  }

  getRepaymentProgress(loan: Loan): number {
    if (!loan.paidAmount || !loan.sanctionedAmount) return 0;
    return Math.round((loan.paidAmount / loan.sanctionedAmount) * 100);
  }

  viewLoanDetails(loanId: number): void {
    this.router.navigate(['/loans', loanId]);
  }

  makePayment(loanId: number): void {
    this.router.navigate(['/payment'], { queryParams: { loanId } });
  }

  cancelLoan(loanId: number): void {
    if (confirm('Are you sure you want to cancel this loan application?')) {
      // Implement cancel loan logic
      console.log('Cancelling loan:', loanId);
    }
  }

  navigateToApply(): void {
    this.router.navigate(['/apply-loan']);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredLoans.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}