import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoanSchemeService } from '../../services/loan-scheme';
import { LoanScheme } from '../../models/loan-scheme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-loan-schemes-officer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="loan-schemes-officer">
      <!-- Header Section -->
      <div class="schemes-header">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 class="fw-bold mb-1">Available Loan Schemes</h3>
              <p class="text-muted mb-0">Browse and manage loan products</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" 
                      (click)="loadSchemes()" 
                      [disabled]="isLoading">
                <span *ngIf="!isLoading">🔄 Refresh</span>
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm"></span>
              </button>
              <button class="btn btn-primary btn-sm" [routerLink]="['/officer/schemes/create']">
                ➕ Add New Scheme
              </button>
            </div>
          </div>

          <!-- Search and Filter Bar -->
          <div class="filter-bar mt-4">
            <div class="row g-3">
              <div class="col-md-4">
                <input type="text" 
                       class="form-control" 
                       placeholder="🔍 Search schemes..."
                       [(ngModel)]="searchTerm"
                       (input)="applyFilters()">
              </div>
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
                  <option value="">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="sortBy" (change)="applyFilters()">
                  <option value="name">Sort by Name</option>
                  <option value="interest">Sort by Interest Rate</option>
                  <option value="amount">Sort by Max Amount</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container py-4">
        @if (isLoading) {
          <div class="loading-state">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3">Loading loan schemes...</p>
          </div>
        } @else if (errorMessage) {
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h5>Failed to Load Schemes</h5>
            <p>{{ errorMessage }}</p>
            <button class="btn btn-primary" (click)="loadSchemes()">
              Try Again
            </button>
          </div>
        } @else if (filteredSchemes.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h5>No Schemes Found</h5>
            <p>{{ searchTerm ? 'Try adjusting your search or filters' : 'No loan schemes available at the moment' }}</p>
            @if (searchTerm || statusFilter) {
              <button class="btn btn-outline-primary" (click)="clearFilters()">
                Clear Filters
              </button>
            }
          </div>
        } @else {
          <!-- Stats Summary -->
          <div class="stats-row mb-4">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div>
                <div class="stat-value">{{ schemes.length }}</div>
                <div class="stat-label">Total Schemes</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div>
                <div class="stat-value">{{ getActiveCount() }}</div>
                <div class="stat-label">Active</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div>
                <div class="stat-value">{{ getAverageInterestRate() }}%</div>
                <div class="stat-label">Avg Interest</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div>
                <div class="stat-value">₹{{ getMaxLoanAmount() }}</div>
                <div class="stat-label">Max Loan</div>
              </div>
            </div>
          </div>

          <!-- Schemes Grid -->
          <div class="row g-4">
            @for (scheme of filteredSchemes; track scheme.schemeId) {
              <div class="col-lg-6 col-xl-4">
                <div class="scheme-card" [class.inactive]="!scheme.isActive">
                  <div class="scheme-header">
                    <div>
                      <h5 class="scheme-title">{{ scheme.schemeName }}</h5>
                      <span class="badge" [class]="'bg-' + getStatusBadgeColor(scheme.isActive)">
                        {{ scheme.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <div class="scheme-actions">
                      <button class="btn-icon" 
                              [routerLink]="['/officer/schemes/edit', scheme.schemeId]"
                              title="Edit scheme">
                        ✏️
                      </button>
                    </div>
                  </div>

                  <div class="scheme-body">
                    <!-- Interest Rate Highlight -->
                    <div class="interest-highlight">
                      <div class="interest-rate">{{ scheme.interestRate }}%</div>
                      <div class="interest-label">Interest Rate</div>
                    </div>

                    <!-- Key Details -->
                    <div class="detail-row">
                      <span class="detail-label">Loan Amount</span>
                      <span class="detail-value">
                        ₹{{ formatAmount(scheme.minAmount) }} - ₹{{ formatAmount(scheme.maxAmount) }}
                      </span>
                    </div>

                    <div class="detail-row">
                      <span class="detail-label">Tenure</span>
                      <span class="detail-value">{{ scheme.tenureMonths }} months</span>
                    </div>

                    <!-- Eligibility Criteria -->
                    @if (scheme.eligibilityCriteria) {
                      <div class="eligibility-section">
                        <div class="eligibility-label">Eligibility</div>
                        <div class="eligibility-text">{{ scheme.eligibilityCriteria }}</div>
                      </div>
                    }

                    <!-- EMI Calculator -->
                    <div class="emi-preview">
                      <small class="text-muted">Estimated EMI for ₹{{ formatAmount(scheme.maxAmount) }}</small>
                      <div class="emi-amount">₹{{ calculateEMI(scheme) }}/month</div>
                    </div>
                  </div>

                  <div class="scheme-footer">
                    <button class="btn btn-outline-primary btn-sm w-100" 
                            [routerLink]="['/officer/schemes/details', scheme.schemeId]">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination Info -->
          <div class="pagination-info mt-4 text-center text-muted">
            Showing {{ filteredSchemes.length }} of {{ schemes.length }} schemes
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .loan-schemes-officer {
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .schemes-header {
      background: white;
      border-bottom: 1px solid #dee2e6;
      padding: 1.5rem 0;
    }

    .filter-bar {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .error-icon,
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .error-state h5 {
      color: #dc3545;
      margin-bottom: 0.5rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #212529;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .scheme-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .scheme-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .scheme-card.inactive {
      opacity: 0.7;
    }

    .scheme-header {
      padding: 1.25rem;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .scheme-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #212529;
    }

    .scheme-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 1.2rem;
      padding: 0.25rem;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .btn-icon:hover {
      opacity: 1;
    }

    .scheme-body {
      padding: 1.25rem;
      flex: 1;
    }

    .interest-highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      margin-bottom: 1.25rem;
    }

    .interest-rate {
      font-size: 2rem;
      font-weight: 700;
    }

    .interest-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-label {
      font-size: 0.875rem;
      color: #6c757d;
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.9rem;
      color: #212529;
      font-weight: 600;
    }

    .eligibility-section {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .eligibility-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .eligibility-text {
      font-size: 0.875rem;
      color: #495057;
      line-height: 1.5;
    }

    .emi-preview {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #e7f3ff;
      border-radius: 6px;
      border-left: 3px solid #0d6efd;
    }

    .emi-amount {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0d6efd;
      margin-top: 0.25rem;
    }

    .scheme-footer {
      padding: 1.25rem;
      border-top: 1px solid #f0f0f0;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
      font-weight: 600;
    }

    .btn-sm {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .pagination-info {
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .filter-bar .row {
        gap: 0.75rem;
      }

      .filter-bar .col-md-2,
      .filter-bar .col-md-3,
      .filter-bar .col-md-4 {
        width: 100%;
      }
    }
  `]
})
export class LoanSchemesOfficer implements OnInit, OnDestroy {
  schemes: LoanScheme[] = [];
  filteredSchemes: LoanScheme[] = [];
  isLoading = true;
  errorMessage = '';
  
  searchTerm = '';
  statusFilter = '';
  sortBy = 'name';

  private destroy$ = new Subject<void>();
  private loanSchemeService = inject(LoanSchemeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadSchemes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSchemes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.loanSchemeService.getLoanSchemes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: LoanScheme[]) => {
          this.schemes = data || [];
          this.applyFilters();
          this.isLoading = false;
          setTimeout(()=>this.cdr.markForCheck(),700)
        },
        error: (err) => {
          console.error('Error loading schemes:', err);
          this.errorMessage = 'Failed to load loan schemes. Please try again.';
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.schemes];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(scheme => 
        scheme.schemeName?.toLowerCase().includes(term) ||
        scheme.eligibilityCriteria?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(scheme => scheme.isActive);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(scheme => !scheme.isActive);
    }

    // Sort
    switch (this.sortBy) {
      case 'name':
        filtered.sort((a, b) => (a.schemeName || '').localeCompare(b.schemeName || ''));
        break;
      case 'interest':
        filtered.sort((a, b) => (a.interestRate || 0) - (b.interestRate || 0));
        break;
      case 'amount':
        filtered.sort((a, b) => (b.maxAmount || 0) - (a.maxAmount || 0));
        break;
    }

    this.filteredSchemes = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  getActiveCount(): number {
    return this.schemes.filter(s => s.isActive).length;
  }

  getAverageInterestRate(): string {
    if (this.schemes.length === 0) return '0';
    
    const total = this.schemes.reduce((sum, s) => sum + (s.interestRate || 0), 0);
    return (total / this.schemes.length).toFixed(2);
  }

  getMaxLoanAmount(): string {
    if (this.schemes.length === 0) return '0';
    
    const max = Math.max(...this.schemes.map(s => s.maxAmount || 0));
    return this.formatAmount(max);
  }

  calculateEMI(scheme: LoanScheme): string {
    const principal = scheme.maxAmount || 0;
    const rate = (scheme.interestRate || 0) / 12 / 100;
    const tenure = scheme.tenureMonths || 1;

    if (rate === 0) {
      return this.formatAmount(principal / tenure);
    }

    const emi = principal * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1);
    return this.formatAmount(Math.round(emi));
  }

  formatAmount(amount: number | undefined | null): string {
    if (!amount && amount !== 0) return '0';
    
    if (amount >= 10000000) {
      return (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
      return (amount / 100000).toFixed(2) + ' L';
    }
    
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  getStatusBadgeColor(isActive: boolean | undefined): string {
    return isActive ? 'success' : 'secondary';
  }
}