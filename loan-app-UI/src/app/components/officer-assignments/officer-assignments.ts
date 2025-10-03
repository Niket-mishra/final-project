import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanApplication } from '../../models/loan-application';

// officer-assignments.component.html

@Component({
  selector: 'app-officer-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-assignments.html',
  styleUrl: './officer-assignments.css'
})
export class OfficerAssignments implements OnInit {
  isLoading = true;
  errorMessage = '';
  applications: LoanApplication[] = [];
  filteredApplications: LoanApplication[] = [];
  
  // Filters
  searchTerm = '';
  statusFilter = 'all';
  sortBy: 'date' | 'amount' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Statistics
  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  };

  constructor(private officerService: OfficerService, private auth: Auth) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();
    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.officerService.getAssignedApplications(officerId).subscribe({
      next: (data: LoanApplication[]) => {
        console.log(data);
        this.applications = data;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load assigned applications.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  calculateStats(): void {
    this.stats.total = this.applications.length;
    this.stats.pending = this.applications.filter(a => a.status === 'Pending').length;
    this.stats.approved = this.applications.filter(a => a.status === 'Approved').length;
    this.stats.rejected = this.applications.filter(a => a.status === 'Rejected').length;
    this.stats.totalAmount = this.applications.reduce((sum, a) => sum + (a.requestedAmount || 0), 0);
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationId?.toString().includes(term) ||
        app.customer?.firstName?.toLowerCase().includes(term) ||
        app.customer?.lastName?.toLowerCase().includes(term) ||
        app.loanScheme?.schemeName?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
          break;
        case 'amount':
          comparison = (a.requestedAmount || 0) - (b.requestedAmount || 0);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredApplications = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Approved': return '✓';
      case 'Rejected': return '✗';
      case 'Pending': return '⏳';
      default: return '•';
    }
  }

  getDaysAssigned(assignedDate: string): number {
    if (!assignedDate) return 0;
    const assigned = new Date(assignedDate);
    const today = new Date();
    const diff = today.getTime() - assigned.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
