// ============================================
// loan-application.component.ts
// ============================================
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanApplication, ApplicationStatus } from '../../models/loan-application';
import { ModalWrapperComponent } from '../../components/modal-wrapper-component/modal-wrapper-component';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalWrapperComponent],
  templateUrl: './loan-application.html',
  styleUrls: ['./loan-application.css']
})
export class LoanApplications implements OnInit {
  applications: LoanApplication[] = [];
  filteredApplications: LoanApplication[] = [];
  paginatedApplications: LoanApplication[] = [];
  isLoading = false;
  isUpdating = false;
  error = '';
  success = '';
  Status = ApplicationStatus;

  // Filter & Search
  searchTerm = '';
  filterStatus = '';
  sortBy = 'date';

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 0;

  // Bulk Selection
  selectedApplications: Set<number> = new Set();
  selectAll = false;

  // Edit Modal
  showEditModal = false;
  editApplication: LoanApplication | null = null;
  updateError = '';
  updateSuccess = '';

  // Details Modal
  showDetailsModal = false;
  selectedApplication: LoanApplication | null = null;

  private service = inject(LoanApplicationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  Math = Math;

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.isLoading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.applyFilters();
        this.isLoading = false;
        setTimeout(()=> this.cdr.markForCheck(), 800)
      },
      error: (err) => {
        this.error = 'Failed to load applications. Please try again.';
        this.isLoading = false;
        console.error('Error fetching applications:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationId?.toString().includes(term) ||
        app.customer?.firstName?.toLowerCase().includes(term) ||
        app.customer?.lastName?.toLowerCase().includes(term) ||
        app.purposeOfLoan?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.filterStatus) {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'amount':
          return (b.requestedAmount || 0) - (a.requestedAmount || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'date':
        default:
          return new Date(b.applicationDate || 0).getTime() - new Date(a.applicationDate || 0).getTime();
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
    this.filterStatus = '';
    this.sortBy = 'date';
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
      this.paginatedApplications.forEach(app => 
        this.selectedApplications.add(app.applicationId)
      );
    } else {
      this.selectedApplications.clear();
    }
  }

  toggleSelectApplication(applicationId: number): void {
    if (this.selectedApplications.has(applicationId)) {
      this.selectedApplications.delete(applicationId);
    } else {
      this.selectedApplications.add(applicationId);
    }
    this.selectAll = this.selectedApplications.size === this.paginatedApplications.length;
  }

  isApplicationSelected(applicationId: number): boolean {
    return this.selectedApplications.has(applicationId);
  }

  bulkApprove(): void {
    if (this.selectedApplications.size === 0) {
      alert('Please select at least one application');
      return;
    }
    if (confirm(`Approve ${this.selectedApplications.size} selected applications?`)) {
      // Implement bulk approve logic
      console.log('Bulk approving:', this.selectedApplications);
    }
  }

  bulkReject(): void {
    if (this.selectedApplications.size === 0) {
      alert('Please select at least one application');
      return;
    }
    if (confirm(`Reject ${this.selectedApplications.size} selected applications?`)) {
      // Implement bulk reject logic
      console.log('Bulk rejecting:', this.selectedApplications);
    }
  }

  exportToCSV(): void {
    const data = this.filteredApplications.map(app => ({
      'Application ID': app.applicationId,
      'Customer Name': `${app.customer?.firstName} ${app.customer?.lastName}`,
      'Customer ID': app.customer?.customerId,
      'Requested Amount': app.requestedAmount,
      'Status': app.status,
      'Loan Scheme': app.loanScheme?.schemeName,
      'Purpose': app.purposeOfLoan,
      'Employment': app.employmentDetails,
      'Application Date': app.applicationDate
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan-applications-${new Date().toISOString().split('T')[0]}.csv`;
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

  // Status operations
  getStatusCount(status: ApplicationStatus): number {
    return this.applications.filter(app => app.status === status).length;
  }

  updateStatus(application: LoanApplication, status: ApplicationStatus): void {
    this.isUpdating = true;
    this.service.updateStatus(application.applicationId, status).subscribe({
      next: (updatedApp) => {
        const index = this.applications.findIndex(a => a.applicationId === updatedApp.applicationId);
        if (index !== -1) {
          this.applications[index] = updatedApp;
          this.applyFilters();
        }
        this.success = `Application #${updatedApp.applicationId} status updated to ${updatedApp.status}.`;
        this.error = '';
        this.isUpdating = false;
        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        this.error = 'Status update failed. Please try again.';
        this.success = '';
        this.isUpdating = false;
        console.error('Error updating status:', err);
      }
    });
  }

  // Modal operations
  openEditModal(app: LoanApplication): void {
    this.editApplication = { ...app };
    this.showEditModal = true;
    this.updateError = '';
    this.updateSuccess = '';
  }

  cancelEdit(): void {
    this.editApplication = null;
    this.showEditModal = false;
    this.updateError = '';
    this.updateSuccess = '';
  }

  submitUpdate(): void {
    if (!this.editApplication) return;

    this.isUpdating = true;
    this.updateError = '';
    this.updateSuccess = '';

    this.service.updateApplication(this.editApplication.applicationId, this.editApplication).subscribe({
      next: (updatedApp) => {
        const index = this.applications.findIndex(a => a.applicationId === updatedApp.applicationId);
        if (index !== -1) {
          this.applications[index] = updatedApp;
          this.applyFilters();
        }
        this.updateSuccess = 'Application updated successfully!';
        this.isUpdating = false;
        setTimeout(() => {
          this.showEditModal = false;
          this.updateSuccess = '';
        }, 2000);
      },
      error: (err) => {
        this.updateError = 'Failed to update application. Please try again.';
        this.isUpdating = false;
        console.error('Error updating application:', err);
      }
    });
  }

  openDetailsModal(app: LoanApplication): void {
    this.selectedApplication = app;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.selectedApplication = null;
    this.showDetailsModal = false;
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

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
}


