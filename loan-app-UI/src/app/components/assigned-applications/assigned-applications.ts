import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanApplication, ApplicationStatus } from '../../models/loan-application';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';
import { map, switchMap, tap } from 'rxjs';
import { LoanOfficer } from '../../models/loan-officer';
import { OfficerService } from '../../services/officer-service';
import { LoanSchemeService } from '../../services/loan-scheme';
import { CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-assigned-applications',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './assigned-applications.html',
  styleUrl: './assigned-applications.css'
})
export class AssignedApplications implements OnInit {
  applications: LoanApplication[] = [];
  filteredApplications: LoanApplication[] = [];
  paginatedApplications: LoanApplication[] = [];
  isLoading = true;
  
  officerId!: number;
  officerName = '';

  // Filters
  searchTerm = '';
  statusFilter = '';
  sortBy = 'date-desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 0;

  // Status enum
  Status = ApplicationStatus;

  private applicationService = inject(LoanApplicationService);
  private authService = inject(Auth);
  private userService = inject(UserService)
  private officerService = inject(OfficerService)
  private cdr =  inject(ChangeDetectorRef);
  private customerService = inject(CustomerService);
  private schemeService = inject(LoanSchemeService);
  
  Math = Math;

  ngOnInit(): void {
    this.loadOfficerInfo();
  }

  loadOfficerInfo(): void {
  const currentUser = this.authService.getCurrentUser();
  if (currentUser) {
    this.userService.getRoleEntityId(currentUser.userId).pipe(
      map((response: { roleEntityId: number }) => response.roleEntityId),
      switchMap((roleEntityId: number) =>
        this.officerService.getOfficerById(roleEntityId)
      )
    ).subscribe({
      next: (officer: LoanOfficer) => {
        this.officerId = officer.officerId;
        this.officerName = 'Officer';

        // ✅ Now that officerId is set, load applications
        this.loadAssignedApplications();
      },
      error: (err) => {
        console.error('Failed to load officer info:', err);
        this.officerName = currentUser.name || 'Officer';
        this.isLoading = false;
      }
    });
  }
}
  loadAssignedApplications(): void {
  this.isLoading = true;

  this.officerService.getAssignedApplications(this.officerId)
    .subscribe({
      next: (data: LoanApplication[]) => {
        this.applications = data;

        this.applications.forEach(app => {
          // Hydrate customer
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

          // Hydrate scheme
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
      error: (err) => {
        console.error('Failed to load assigned applications', err);
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
        app.applicationId.toString().includes(search) ||
        app.customer?.firstName?.toLowerCase().includes(search) ||
        app.customer?.lastName?.toLowerCase().includes(search) ||
        app.purposeOfLoan?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

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
    this.statusFilter = '';
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

  // Statistics
  getStatusCount(status: ApplicationStatus): number {
    return this.applications.filter(app => app.status === status).length;
  }

  getTotalRequestedAmount(): number {
    return this.applications.reduce((sum, app) => sum + app.requestedAmount, 0);
  }

  // Actions
  updateStatus(application: LoanApplication, newStatus: ApplicationStatus): void {
  const remarks = prompt(`Enter remarks for changing status to ${newStatus}:`) || '';
  if (confirm(`Change status to ${newStatus}?`)) {
    this.applicationService.updateStatus(application.applicationId, newStatus, remarks).subscribe({
      next: () => {
        application.status = newStatus;
        this.applyFilters();
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 700);
      },
      error: (err) => console.error('Failed to update status', err)
    });
  }
}

  // Utilities
  getStatusColor(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved: return 'success';
      case ApplicationStatus.Rejected: return 'danger';
      case ApplicationStatus.Pending: return 'warning';
      case ApplicationStatus.Disbursed: return 'primary';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved: return 'bi-check-circle-fill';
      case ApplicationStatus.Rejected: return 'bi-x-circle-fill';
      case ApplicationStatus.Pending: return 'bi-clock-fill';
      case ApplicationStatus.Disbursed: return 'bi-cash-coin';
      default: return 'bi-circle-fill';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
