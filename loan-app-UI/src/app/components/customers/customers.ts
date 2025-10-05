// ============================================
// customers.ts (Keep your existing imports and class structure)
// ============================================
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';
import { Customer, VerificationStatus } from '../../models/customer';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CustomerDetails } from '../customer-details/customer-details';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerDetails],
  templateUrl: "./customers.html",
  styleUrl: './customers.css',
})
export class Customers implements OnInit, OnDestroy {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  paginatedCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isLoading = true;
  error = '';

  // Filters
  searchTerm = '';
  statusFilter = '';
  cityFilter = '';
  sortBy = 'name';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  // Bulk Selection
  selectedCustomers: Set<number> = new Set();
  selectAll = false;

  // View mode
  showProfileModal = false;

  private destroy$ = new Subject<void>();
  private service = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);
  Math = Math;

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.service.getAllCustomers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.customers = data;
          this.filterCustomers();
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Failed to load customers.';
        }
      });
  }

  filterCustomers(): void {
    let filtered = [...this.customers];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstName?.toLowerCase().includes(search) ||
        c.lastName?.toLowerCase().includes(search) ||
        c.user?.email?.toLowerCase().includes(search) ||
        c.city?.toLowerCase().includes(search) ||
        c.occupation?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(c => c.verificationStatus?.toString() === this.statusFilter);
    }

    // City filter
    if (this.cityFilter) {
      filtered = filtered.filter(c => c.city?.toLowerCase().includes(this.cityFilter.toLowerCase()));
    }

    this.filteredCustomers = filtered;
    this.sortCustomers();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortCustomers(): void {
    switch (this.sortBy) {
      case 'name':
        this.filteredCustomers.sort((a, b) => 
          (a.firstName || '').localeCompare(b.firstName || '')
        );
        break;
      case 'city':
        this.filteredCustomers.sort((a, b) => 
          (a.city || '').localeCompare(b.city || '')
        );
        break;
      case 'income':
        this.filteredCustomers.sort((a, b) => 
          (b.annualIncome || 0) - (a.annualIncome || 0)
        );
        break;
      case 'credit':
        this.filteredCustomers.sort((a, b) => 
          (b.creditScore || 0) - (a.creditScore || 0)
        );
        break;
    }
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCustomers = this.filteredCustomers.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.cityFilter = '';
    this.sortBy = 'name';
    this.filterCustomers();
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
      this.paginatedCustomers.forEach(c => this.selectedCustomers.add(c.customerId));
    } else {
      this.selectedCustomers.clear();
    }
  }

  toggleSelect(id: number): void {
    if (this.selectedCustomers.has(id)) {
      this.selectedCustomers.delete(id);
    } else {
      this.selectedCustomers.add(id);
    }
    this.selectAll = this.selectedCustomers.size === this.paginatedCustomers.length;
  }

  isSelected(id: number): boolean {
    return this.selectedCustomers.has(id);
  }

  viewProfile(customer: Customer): void {
    this.selectedCustomer = customer;
    this.showProfileModal = true;
  }

  closeProfile(): void {
    this.showProfileModal = false;
    this.selectedCustomer = null;
  }

  getStatusColor(status: any): string {
    switch (status) {
      case VerificationStatus.Verified:
      case 'Verified':
        return 'success';
      case VerificationStatus.Pending:
      case 'Pending':
        return 'warning';
      case VerificationStatus.Rejected:
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusText(status: any): string {
    if (typeof status === 'number' || typeof status === 'string') {
      switch (status) {
        case VerificationStatus.Verified:
        case 'Verified':
          return 'Verified';
        case VerificationStatus.Pending:
        case 'Pending':
          return 'Pending';
        case VerificationStatus.Rejected:
        case 'Rejected':
          return 'Rejected';
        default:
          return 'Unknown';
      }
    }
    return status || 'Unknown';
  }

  getVerifiedCount(): number {
    return this.customers.filter(c => 
      c.verificationStatus === VerificationStatus.Verified
    ).length;
  }

  getPendingCount(): number {
    return this.customers.filter(c => 
      c.verificationStatus === VerificationStatus.Pending).length;
  }

  getRejectedCount(): number {
    return this.customers.filter(c => 
      c.verificationStatus === VerificationStatus.Rejected).length;
  }

  getInitials(customer: Customer): string {
    const first = customer.firstName?.charAt(0) || '';
    const last = customer.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'C';
  }

  getUniqueCities(): string[] {
    const cities = this.customers.map(c => c.city).filter(Boolean);
    return Array.from(new Set(cities)) as string[];
  }

  exportToCSV(): void {
    const data = this.filteredCustomers.map(c => ({
      'Customer ID': c.customerId,
      'Name': `${c.firstName} ${c.lastName}`,
      'Email': c.user?.email,
      'Phone': c.user?.phoneNumber,
      'City': c.city,
      'Occupation': c.occupation,
      'Annual Income': c.annualIncome,
      'Credit Score': c.creditScore,
      'Status': this.getStatusText(c.verificationStatus)
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
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

