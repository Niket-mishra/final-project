import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selectedCustomer: Customer | null = null;
  isLoading = true;
  error = '';

  // Filters
  searchTerm = '';
  statusFilter = '';
  cityFilter = '';
  sortBy = 'name';

  // View mode
  showProfileModal = false;

  private destroy$ = new Subject<void>();

  constructor(private service: CustomerService) {}

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
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.cityFilter = '';
    this.sortBy = 'name';
    this.filterCustomers();
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
    // Cast status to VerificationStatus if it's a string representation of the enum
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
}

