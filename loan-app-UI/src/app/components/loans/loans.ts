// ============================================
// loans.component.ts
// ============================================
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoanService } from '../../services/loan-service';
import { Loan, LoanStatus } from '../../models/loan';

@Component({
  selector: 'app-all-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './loans.html',
  styleUrl: './loans.css'
})
export class Loans implements OnInit, OnDestroy {
  loans: Loan[] = [];
  filteredLoans: Loan[] = [];
  paginatedLoans: Loan[] = [];
  isLoading = false;
  
  // Filter properties
  searchTerm = '';
  statusFilter = '';
  sortBy = 'date-desc';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 0;

  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private loanService = inject(LoanService);
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.loadLoans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLoans(): void {
    this.isLoading = true;
    
    this.loanService.getAllLoans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loans) => {
          this.loans = loans;
          this.applyFilters();
          this.isLoading = false;
          setTimeout(()=> this.cdr.markForCheck(), 800)
        },
        error: (error) => {
          console.error('Error loading loans:', error);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
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
    this.applySorting();
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  applySorting(): void {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredLoans.sort((a, b) => 
          new Date(b.loanStartDate ?? 0).getTime() - new Date(a.loanStartDate ?? 0).getTime()
        );
        break;
      case 'date-asc':
        this.filteredLoans.sort((a, b) => 
          new Date(a.loanStartDate ?? 0).getTime() - new Date(b.loanStartDate ?? 0).getTime()
        );
        break;
      case 'amount-desc':
        this.filteredLoans.sort((a, b) => b.sanctionedAmount - a.sanctionedAmount);
        break;
      case 'amount-asc':
        this.filteredLoans.sort((a, b) => a.sanctionedAmount - b.sanctionedAmount);
        break;
    }
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLoans.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLoans = this.filteredLoans.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'date-desc';
    this.applyFilters();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  // Expose Math for template
  Math = Math;

  // Export CSV functionality
  exportToCSV(): void {
    const data = this.filteredLoans.map(loan => ({
      'Loan ID': loan.loanId,
      'Sanctioned Amount': loan.sanctionedAmount,
      'Remaining Amount': loan.remainingAmount,
      'EMI Amount': loan.emiAmount,
      'Total EMIs': loan.totalEmiCount,
      'Paid EMIs': loan.paidEmiCount,
      'Interest Rate': loan.interestRateApplied,
      'Status': loan.loanStatus,
      'Start Date': loan.loanStartDate,
      'Next Due Date': loan.nextDueDate
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loans-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    );
    return [headers, ...rows].join('\n');
  }

  // Bulk actions
  selectedLoans: Set<number> = new Set();
  selectAll = false;

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedLoans.forEach(loan => this.selectedLoans.add(loan.loanId));
    } else {
      this.selectedLoans.clear();
    }
  }

  toggleSelectLoan(loanId: number): void {
    if (this.selectedLoans.has(loanId)) {
      this.selectedLoans.delete(loanId);
    } else {
      this.selectedLoans.add(loanId);
    }
    this.selectAll = this.selectedLoans.size === this.paginatedLoans.length;
  }

  isLoanSelected(loanId: number): boolean {
    return this.selectedLoans.has(loanId);
  }

  bulkExport(): void {
    const selectedData = this.loans.filter(loan => this.selectedLoans.has(loan.loanId));
    if (selectedData.length === 0) {
      alert('Please select at least one loan');
      return;
    }
    // Implement bulk export logic
    console.log('Exporting selected loans:', selectedData);
  }

  // Summary methods
  getTotalAmount(): number {
    return this.loans.reduce((sum, loan) => sum + loan.sanctionedAmount, 0);
  }

  getActiveLoansCount(): number {
    return this.loans.filter(loan => loan.loanStatus === LoanStatus.Active).length;
  }

  getTotalDisbursed(): number {
    return this.loans.reduce((sum, loan) => sum + (loan.sanctionedAmount - loan.remainingAmount), 0);
  }

  getRepaymentProgress(loan: Loan): number {
    if (!loan.sanctionedAmount || loan.sanctionedAmount === 0) return 0;
    const paidAmount = loan.sanctionedAmount - loan.remainingAmount;
    return Math.round((paidAmount / loan.sanctionedAmount) * 100);
  }

  // Navigation methods
  viewLoanDetails(loanId: number): void {
    this.router.navigate(['/admin/loan-details', loanId]);
  }

  makePayment(loanId: number): void {
    this.router.navigate(['/admin/make-payment'], { queryParams: { loanId } });
  }

  manageLoan(loanId: number): void {
    this.router.navigate(['/admin/manage-loan', loanId]);
  }

  navigateToApply(): void {
    this.router.navigate(['/admin/apply-loan']);
  }

  // Utility methods
  getStatusColor(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.Active: return 'primary';
      case LoanStatus.Completed: return 'success';
      case LoanStatus.NPA: return 'danger';
      case LoanStatus.Closed: return 'secondary';
      default: return 'dark';
    }
  }

  getStatusIcon(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.Active: return 'bi-check-circle-fill';
      case LoanStatus.Completed: return 'bi-trophy-fill';
      case LoanStatus.NPA: return 'bi-exclamation-triangle-fill';
      case LoanStatus.Closed: return 'bi-x-circle-fill';
      default: return 'bi-circle-fill';
    }
  }
}





