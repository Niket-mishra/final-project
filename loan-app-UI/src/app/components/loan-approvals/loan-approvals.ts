// ============================================
// loan-approvals.ts
// ============================================
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanApplication, ApplicationStatus } from '../../models/loan-application';
import { ToastService } from '../../services/toast-service';
import { CustomerService } from '../../services/customer-service';
import { LoanSchemeService } from '../../services/loan-scheme';
import { Customer } from '../../models/customer';
import { LoanScheme } from '../../models/loan-scheme';

@Component({
  selector: 'app-loan-approvals',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './loan-approvals.html',
  styleUrl: './loan-approvals.css'
})
export class LoanApprovals implements OnInit {
  applications: LoanApplication[] = [];
  filteredApplications: LoanApplication[] = [];
  paginatedApplications: LoanApplication[] = [];
  isLoading = true;
  errorMessage = '';
  customer!: Customer;
  scheme!: LoanScheme;

  // Filters
  searchTerm = '';
  sortBy = 'date-desc';
  minAmount = 0;
  maxAmount = 10000000;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  // Selected application for details
  selectedApp: LoanApplication | null = null;
  showDetailsModal = false;

  // Remarks
  remarks = '';

  private loanApplicationService = inject(LoanApplicationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private customerService = inject(CustomerService);
  private schemeService = inject(LoanSchemeService);

  Math = Math;

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.loanApplicationService.getByStatus(ApplicationStatus.Pending)
    .subscribe({
      next: (data: LoanApplication[]) => {
        this.applications = data;

        // Hydrate each application with customer and scheme
        this.applications.forEach(app => {
          if (app.customerId) {
            this.customerService.getCustomerById(app.customerId).subscribe({
              next: customer => {
                app.customer = customer;
                this.cdr.markForCheck();
              },
              error: () => {
                console.warn(`Failed to load customer for App ID ${app.applicationId}`);
              }
            });
          }

          if (app.schemeId) {
            this.schemeService.getLoanSchemeById(app.schemeId).subscribe({
              next: scheme => {
                app.loanScheme = scheme;
                this.cdr.markForCheck();
              },
              error: () => {
                console.warn(`Failed to load scheme for App ID ${app.applicationId}`);
              }
            });
          }
        });

        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load pending applications.';
        this.isLoading = false;
      }
    });
}

  applyFilters(): void {
    let filtered = [...this.applications];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.customer?.firstName?.toLowerCase().includes(search) ||
        app.customer?.lastName?.toLowerCase().includes(search) ||
        app.applicationId.toString().includes(search) ||
        app.loanScheme?.schemeName?.toLowerCase().includes(search)
      );
    }

    // Amount range filter
    filtered = filtered.filter(app =>
      app.requestedAmount >= this.minAmount &&
      app.requestedAmount <= this.maxAmount
    );

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
        case 'date-asc':
          return new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
        case 'amount-desc':
          return b.requestedAmount - a.requestedAmount;
        case 'amount-asc':
          return a.requestedAmount - b.requestedAmount;
        default:
          return 0;
      }
    });

    this.filteredApplications = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedApplications = this.filteredApplications.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'date-desc';
    this.minAmount = 0;
    this.maxAmount = 10000000;
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

  // Actions
  viewDetails(app: LoanApplication): void {
    this.selectedApp = app;
    this.showDetailsModal = true;
    this.remarks = '';
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedApp = null;
    this.remarks = '';
  }

  approve(applicationId: number): void {
    const defaultRemarks = this.remarks || 'Approved by officer';
    if (confirm('Are you sure you want to approve this application?')) {
      this.loanApplicationService.updateStatus(applicationId, ApplicationStatus.Approved, defaultRemarks).subscribe({
        next: () => {
          this.applications = this.applications.filter(app => app.applicationId !== applicationId);
          this.applyFilters();
          this.toastService.success('Application approved successfully');
          this.closeDetails();
        },
        error: () => {
          this.toastService.error(`Failed to approve application ${applicationId}`);
        }
      });
    }
  }

  reject(applicationId: number): void {
    const defaultRemarks = this.remarks || 'Rejected by officer';
    if (confirm('Are you sure you want to reject this application?')) {
      this.loanApplicationService.updateStatus(applicationId, ApplicationStatus.Rejected, defaultRemarks).subscribe({
        next: () => {
          this.applications = this.applications.filter(app => app.applicationId !== applicationId);
          this.applyFilters();
          this.toastService.success('Application rejected');
          this.closeDetails();
        },
        error: () => {
          this.toastService.error(`Failed to reject application ${applicationId}`);
        }
      });
    }
  }

  // Utilities
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.applications.reduce((sum, app) => sum + app.requestedAmount, 0);
  }
}

