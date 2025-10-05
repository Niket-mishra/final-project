// ============================================
// admin-repayments.ts
// ============================================
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepaymentService } from '../../services/repayment-service';
import { Repayment } from '../../models/repayment';

// interface Repayment {
//   repaymentId: number;
//   loanId: number;
//   amount: number;
//   emiNumber: number;
//   penaltyPaid: number;
//   lateFee: number;
//   paymentDate: string;
//   dueDate: string;
//   paymentMode: string;
//   transactionId: string;
//   paymentGatewayResponse?: string;
//   paymentStatus: string;
//   createdAt: string;
//   updatedAt?: string;
//   loan?: {
//     loanId: number;
//     applicationId: number;
//     sanctionedAmount: number;
//     remainingAmount: number;
//     emiAmount: number;
//     totalEmiCount: number;
//     paidEmiCount: number;
//     interestRateApplied: number;
//     loanStatus: string;
//   };
// }

@Component({
  selector: 'app-admin-repayments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-repayments.html',
  styleUrl: './admin-repayments.css'
})
export class AdminRepayments implements OnInit {
  repayments: Repayment[] = [];
  filteredRepayments: Repayment[] = [];
  paginatedRepayments: Repayment[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  statusFilter = '';
  paymentModeFilter = '';
  sortBy = 'date-desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Bulk Selection
  selectedRepayments: Set<number> = new Set();
  selectAll = false;

  private repaymentService = inject(RepaymentService);
  private cdr = inject(ChangeDetectorRef);
  Math = Math;

  ngOnInit(): void {
    this.loadRepayments();
  }

  loadRepayments(): void {
    this.isLoading = true;
    this.repaymentService.getAllRepayments().subscribe({
      next: (data) => {
        this.repayments = data;
        this.applyFilters();
        this.isLoading = false;
        setTimeout(()=>this.cdr.markForCheck(),800);
      },
      error: (err) => {
        console.error('Failed to load repayments', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.repayments];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.transactionId.toLowerCase().includes(search) ||
        r.loanId.toString().includes(search) ||
        r.amount.toString().includes(search)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(r => r.paymentStatus === this.statusFilter);
    }

    // Payment mode filter
    if (this.paymentModeFilter) {
      filtered = filtered.filter(r => r.paymentMode === this.paymentModeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
        case 'date-asc':
          return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    this.filteredRepayments = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRepayments.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRepayments = this.filteredRepayments.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.paymentModeFilter = '';
    this.sortBy = 'date-desc';
    this.applyFilters();
  }

  // Pagination
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
        pages.push(-1);
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

  // Bulk Selection
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedRepayments.forEach(r => this.selectedRepayments.add(r.repaymentId));
    } else {
      this.selectedRepayments.clear();
    }
  }

  toggleSelect(id: number): void {
    if (this.selectedRepayments.has(id)) {
      this.selectedRepayments.delete(id);
    } else {
      this.selectedRepayments.add(id);
    }
    this.selectAll = this.selectedRepayments.size === this.paginatedRepayments.length;
  }

  isSelected(id: number): boolean {
    return this.selectedRepayments.has(id);
  }

  // Statistics
  getTotalAmount(): number {
    return this.repayments.reduce((sum, r) => sum + r.amount, 0);
  }

  getTotalPenalties(): number {
    return this.repayments.reduce((sum, r) => sum + r.penaltyPaid + r.lateFee, 0);
  }

  getCompletedCount(): number {
    return this.repayments.filter(r => r.paymentStatus === 'Completed').length;
  }

  getPendingCount(): number {
    return this.repayments.filter(r => r.paymentStatus === 'Pending').length;
  }

  getUniquePaymentModes(): string[] {
    return [...new Set(this.repayments.map(r => r.paymentMode))];
  }

  // Utilities
  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Completed': return 'bi-check-circle-fill';
      case 'Pending': return 'bi-clock-fill';
      case 'Failed': return 'bi-x-circle-fill';
      default: return 'bi-circle-fill';
    }
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode.toLowerCase()) {
      case 'online': return 'bi-globe';
      case 'cash': return 'bi-cash-coin';
      case 'cheque': return 'bi-file-earmark-check';
      case 'card': return 'bi-credit-card';
      default: return 'bi-wallet2';
    }
  }

  isOverdue(dueDate: Date, paymentDate: Date): boolean {
    return paymentDate >dueDate;
  }

  // Export
  exportToCSV(): void {
    const data = this.filteredRepayments.map(r => ({
      'Repayment ID': r.repaymentId,
      'Loan ID': r.loanId,
      'Transaction ID': r.transactionId,
      'Amount': r.amount,
      'EMI Number': r.emiNumber,
      'Penalty': r.penaltyPaid,
      'Late Fee': r.lateFee,
      'Payment Date': r.paymentDate,
      'Due Date': r.dueDate,
      'Payment Mode': r.paymentMode,
      'Status': r.paymentStatus
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repayments-${new Date().toISOString().split('T')[0]}.csv`;
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
}

