import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { Repayment } from '../../models/repayment';
import { RepaymentService } from '../../services/repayment-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface RepaymentStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  collectedAmount: number;
}

@Component({
  selector: 'app-officer-repayments',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, FormsModule],
  template: `
    <div class="officer-repayments">
      <!-- Header Section -->
      <div class="repayments-header">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 class="fw-bold mb-1">Repayment Management</h3>
              <p class="text-muted mb-0">Track and manage loan repayments</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" 
                      (click)="loadRepayments()" 
                      [disabled]="isLoading">
                <span *ngIf="!isLoading">🔄 Refresh</span>
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm"></span>
              </button>
              <button class="btn btn-outline-secondary btn-sm" (click)="exportToCSV()">
                📥 Export
              </button>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="filter-bar mt-4">
            <div class="row g-3">
              <div class="col-md-3">
                <input type="text" 
                       class="form-control form-control-sm" 
                       placeholder="🔍 Search by Loan ID or Transaction ID..."
                       [(ngModel)]="searchTerm"
                       (input)="applyFilters()">
              </div>
              <div class="col-md-2">
                <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="applyFilters()">
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div class="col-md-2">
                <select class="form-select form-select-sm" [(ngModel)]="modeFilter" (change)="applyFilters()">
                  <option value="">All Modes</option>
                  <option value="Online">Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div class="col-md-2">
                <input type="date" 
                       class="form-control form-control-sm" 
                       [(ngModel)]="dateFilter"
                       (change)="applyFilters()"
                       placeholder="Filter by date">
              </div>
              <div class="col-md-3 d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm" (click)="clearFilters()">
                  Clear Filters
                </button>
                <select class="form-select form-select-sm" [(ngModel)]="pageSize" (change)="applyFilters()">
                  <option [value]="10">10 per page</option>
                  <option [value]="25">25 per page</option>
                  <option [value]="50">50 per page</option>
                  <option [value]="100">100 per page</option>
                </select>
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
            <p class="mt-3">Loading repayment records...</p>
          </div>
        } @else if (errorMessage) {
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h5>Failed to Load Repayments</h5>
            <p>{{ errorMessage }}</p>
            <button class="btn btn-primary" (click)="loadRepayments()">
              Try Again
            </button>
          </div>
        } @else {
          
          <!-- Statistics Cards -->
          <div class="stats-grid mb-4">
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-icon">📊</span>
                <span class="stat-label">Total Repayments</span>
              </div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
            <div class="stat-card success">
              <div class="stat-header">
                <span class="stat-icon">✅</span>
                <span class="stat-label">Completed</span>
              </div>
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-subtitle">₹{{ formatAmount(stats.collectedAmount) }}</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-header">
                <span class="stat-icon">⏳</span>
                <span class="stat-label">Pending</span>
              </div>
              <div class="stat-value">{{ stats.pending }}</div>
            </div>
            <div class="stat-card danger">
              <div class="stat-header">
                <span class="stat-icon">⚠️</span>
                <span class="stat-label">Overdue</span>
              </div>
              <div class="stat-value">{{ stats.overdue }}</div>
            </div>
          </div>

          @if (filteredRepayments.length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <h5>No Repayments Found</h5>
              <p>{{ searchTerm || statusFilter ? 'Try adjusting your filters' : 'No repayment records available' }}</p>
              @if (searchTerm || statusFilter || modeFilter || dateFilter) {
                <button class="btn btn-outline-primary" (click)="clearFilters()">
                  Clear Filters
                </button>
              }
            </div>
          } @else {
            <!-- Desktop Table View -->
            <div class="table-container d-none d-lg-block">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th (click)="sortBy('loanId')" class="sortable">
                      Loan ID
                      <span class="sort-indicator">{{ getSortIcon('loanId') }}</span>
                    </th>
                    <th (click)="sortBy('emiNumber')" class="sortable">
                      EMI #
                      <span class="sort-indicator">{{ getSortIcon('emiNumber') }}</span>
                    </th>
                    <th (click)="sortBy('amount')" class="sortable">
                      Amount
                      <span class="sort-indicator">{{ getSortIcon('amount') }}</span>
                    </th>
                    <th (click)="sortBy('dueDate')" class="sortable">
                      Due Date
                      <span class="sort-indicator">{{ getSortIcon('dueDate') }}</span>
                    </th>
                    <th>Paid On</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Transaction ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (repayment of paginatedRepayments; track repayment.repaymentId) {
                    <tr [class.overdue-row]="isOverdue(repayment)">
                      <td>
                        <strong>#{{ repayment.loanId }}</strong>
                      </td>
                      <td>
                        <span class="badge bg-info-subtle text-info">
                          EMI {{ repayment.emiNumber }}
                        </span>
                      </td>
                      <td>
                        <strong class="amount-text">₹{{ formatAmount(repayment.amount) }}</strong>
                      </td>
                      <td>
                        <div>{{ repayment.dueDate | date:'mediumDate' }}</div>
                        @if (isOverdue(repayment)) {
                          <small class="text-danger">{{ getDaysOverdue(repayment) }} days overdue</small>
                        }
                      </td>
                      <td>
                        {{ repayment.paymentDate ? (repayment.paymentDate | date:'mediumDate') : '—' }}
                      </td>
                      <td>
                        <span class="badge" [class]="'bg-' + getStatusBadge(repayment.paymentStatus)">
                          {{ repayment.paymentStatus || 'Unknown' }}
                        </span>
                      </td>
                      <td>
                        <span class="payment-mode">{{ repayment.paymentMode || 'N/A' }}</span>
                      </td>
                      <td>
                        <code class="transaction-id">{{ repayment.transactionId || 'N/A' }}</code>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn btn-sm btn-outline-primary" 
                                  [routerLink]="['/officer/repayments/details', repayment.repaymentId]"
                                  title="View details">
                            👁️
                          </button>
                          @if (repayment.paymentStatus === 'Pending') {
                            <button class="btn btn-sm btn-outline-success" 
                                    (click)="markAsPaid(repayment)"
                                    title="Mark as paid">
                              ✓
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="mobile-cards d-lg-none">
              @for (repayment of paginatedRepayments; track repayment.repaymentId) {
                <div class="repayment-card" [class.overdue]="isOverdue(repayment)">
                  <div class="card-header">
                    <div>
                      <strong>Loan #{{ repayment.loanId }}</strong>
                      <span class="badge bg-info-subtle text-info ms-2">
                        EMI {{ repayment.emiNumber }}
                      </span>
                    </div>
                    <span class="badge" [class]="'bg-' + getStatusBadge(repayment.paymentStatus)">
                      {{ repayment.paymentStatus || 'Unknown' }}
                    </span>
                  </div>
                  <div class="card-body">
                    <div class="info-row">
                      <span class="label">Amount</span>
                      <span class="value amount-text">₹{{ formatAmount(repayment.amount) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Due Date</span>
                      <span class="value">{{ repayment.dueDate | date:'mediumDate' }}</span>
                    </div>
                    @if (repayment.paymentDate) {
                      <div class="info-row">
                        <span class="label">Paid On</span>
                        <span class="value">{{ repayment.paymentDate | date:'mediumDate' }}</span>
                      </div>
                    }
                    <div class="info-row">
                      <span class="label">Mode</span>
                      <span class="value">{{ repayment.paymentMode || 'N/A' }}</span>
                    </div>
                    @if (repayment.transactionId) {
                      <div class="info-row">
                        <span class="label">Transaction</span>
                        <code class="transaction-id">{{ repayment.transactionId }}</code>
                      </div>
                    }
                    @if (isOverdue(repayment)) {
                      <div class="overdue-badge">
                        ⚠️ {{ getDaysOverdue(repayment) }} days overdue
                      </div>
                    }
                  </div>
                  <div class="card-footer">
                    <button class="btn btn-sm btn-outline-primary" 
                            [routerLink]="['/officer/repayments/details', repayment.repaymentId]">
                      View Details
                    </button>
                    @if (repayment.paymentStatus === 'Pending') {
                      <button class="btn btn-sm btn-outline-success" 
                              (click)="markAsPaid(repayment)">
                        Mark as Paid
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Pagination -->
            <div class="pagination-container mt-4">
              <div class="pagination-info">
                Showing {{ getStartIndex() + 1 }} to {{ getEndIndex() }} of {{ filteredRepayments.length }} repayments
              </div>
              <div class="pagination-controls">
                <button class="btn btn-sm btn-outline-secondary" 
                        (click)="previousPage()" 
                        [disabled]="currentPage === 1">
                  ← Previous
                </button>
                <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
                <button class="btn btn-sm btn-outline-secondary" 
                        (click)="nextPage()" 
                        [disabled]="currentPage === totalPages">
                  Next →
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .officer-repayments {
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .repayments-header {
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
      text-center: center;
      padding: 4rem 2rem;
    }

    .error-icon,
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #6c757d;
    }

    .stat-card.success {
      border-left-color: #28a745;
    }

    .stat-card.warning {
      border-left-color: #ffc107;
    }

    .stat-card.danger {
      border-left-color: #dc3545;
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .stat-icon {
      font-size: 1.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6c757d;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #212529;
    }

    .stat-subtitle {
      font-size: 0.875rem;
      color: #28a745;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .table {
      margin: 0;
    }

    .table thead {
      background: #f8f9fa;
    }

    .table th {
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
      padding: 1rem 0.75rem;
    }

    .table td {
      padding: 1rem 0.75rem;
      vertical-align: middle;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background: #e9ecef;
    }

    .sort-indicator {
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .overdue-row {
      background: #fff5f5;
    }

    .amount-text {
      color: #0d6efd;
      font-weight: 600;
    }

    .payment-mode {
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
      background: #e9ecef;
      border-radius: 4px;
    }

    .transaction-id {
      font-size: 0.75rem;
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: #495057;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .repayment-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .repayment-card.overdue {
      border-left: 4px solid #dc3545;
    }

    .repayment-card .card-header {
      padding: 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .repayment-card .card-body {
      padding: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row .label {
      font-size: 0.875rem;
      color: #6c757d;
      font-weight: 500;
    }

    .info-row .value {
      font-size: 0.875rem;
      color: #212529;
      font-weight: 600;
    }

    .overdue-badge {
      background: #fff5f5;
      color: #dc3545;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0.75rem;
      text-align: center;
    }

    .repayment-card .card-footer {
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      display: flex;
      gap: 0.5rem;
    }

    .pagination-container {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-indicator {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .pagination-container {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class OfficerRepayments implements OnInit, OnDestroy {
  repayments: Repayment[] = [];
  filteredRepayments: Repayment[] = [];
  paginatedRepayments: Repayment[] = [];
  isLoading = true;
  errorMessage = '';

  searchTerm = '';
  statusFilter = '';
  modeFilter = '';
  dateFilter = '';
  sortField = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage = 1;
  pageSize = 25;
  totalPages = 1;

  stats: RepaymentStats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    collectedAmount: 0
  };

  private destroy$ = new Subject<void>();
  private repaymentService = inject(RepaymentService);
  private auth = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const officerId = this.auth.getUserId();

    if (!officerId || typeof officerId !== 'number') {
      this.handleError('Officer ID not found. Please log in again.');
      return;
    }

    this.loadRepayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRepayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.repaymentService.getAllRepayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Repayment[]) => {
          this.repayments = data || [];
          this.calculateStats();
          this.applyFilters();
          this.isLoading = false;
          setTimeout(() => {
            this.cdr.markForCheck();
          }, 700);
        },
        error: (err) => {
          console.error('Error loading repayments:', err);
          this.handleError('Failed to load repayment records. Please try again.');
        }
      });
  }

  calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.stats = {
      total: this.repayments.length,
      completed: this.repayments.filter(r => 
        r.paymentStatus?.toLowerCase() === 'completed' || 
        r.paymentStatus?.toLowerCase() === 'paid'
      ).length,
      pending: this.repayments.filter(r => 
        r.paymentStatus?.toLowerCase() === 'pending'
      ).length,
      overdue: this.repayments.filter(r => 
        r.paymentStatus?.toLowerCase() === 'pending' && 
        new Date(r.dueDate) < today
      ).length,
      totalAmount: this.repayments.reduce((sum, r) => sum + (r.amount || 0), 0),
      collectedAmount: this.repayments
        .filter(r => r.paymentStatus?.toLowerCase() === 'completed' || 
                     r.paymentStatus?.toLowerCase() === 'paid')
        .reduce((sum, r) => sum + (r.amount || 0), 0)
    };
  }

  applyFilters(): void {
    let filtered = [...this.repayments];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.loanId?.toString().includes(term) ||
        r.transactionId?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(r => 
        r.paymentStatus?.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    // Mode filter
    if (this.modeFilter) {
      filtered = filtered.filter(r => 
        r.paymentMode?.toLowerCase() === this.modeFilter.toLowerCase()
      );
    }

    // Date filter
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(r => {
        const dueDate = new Date(r.dueDate);
        return dueDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort
    this.applySorting(filtered);

    this.filteredRepayments = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  applySorting(data: Repayment[]): void {
    data.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (this.sortField) {
        case 'loanId':
          aVal = a.loanId || 0;
          bVal = b.loanId || 0;
          break;
        case 'emiNumber':
          aVal = a.emiNumber || 0;
          bVal = b.emiNumber || 0;
          break;
        case 'amount':
          aVal = a.amount || 0;
          bVal = b.amount || 0;
          break;
        case 'dueDate':
          aVal = new Date(a.dueDate).getTime();
          bVal = new Date(b.dueDate).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.modeFilter = '';
    this.dateFilter = '';
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRepayments.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRepayments = this.filteredRepayments.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRepayments.length);
  }

  isOverdue(repayment: Repayment): boolean {
    if (repayment.paymentStatus?.toLowerCase() === 'completed' || 
        repayment.paymentStatus?.toLowerCase() === 'paid') {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(repayment.dueDate) < today;
  }

  getDaysOverdue(repayment: Repayment): number {
    const today = new Date();
    const dueDate = new Date(repayment.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  markAsPaid(repayment: Repayment): void {
  if (!confirm(`Mark EMI #${repayment.emiNumber} for Loan #${repayment.loanId} as paid?`)) {
    return;
  }

  const updatedRepayment: Repayment = {
    ...repayment,
    paymentStatus: 'Completed',
    paymentDate: new Date(),
    updatedAt: new Date()
  };

  this.repaymentService.updateRepayment(repayment.repaymentId, updatedRepayment)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: Repayment) => {
        const index = this.repayments.findIndex(r => r.repaymentId === repayment.repaymentId);
        if (index !== -1) {
          this.repayments[index] = {
            ...response,
            paymentDate: new Date(response.paymentDate),
            dueDate: new Date(response.dueDate),
            createdAt: new Date(response.createdAt),
            updatedAt: response.updatedAt ? new Date(response.updatedAt) : undefined
          };
        }
        this.calculateStats();
        this.applyFilters();
        alert('Payment marked as completed successfully!');
      },
      error: (err) => {
        console.error('Error updating repayment:', err);
        alert('Failed to update payment status. Please try again.');
      }
    });
}

  exportToCSV(): void {
    if (this.filteredRepayments.length === 0) {
      alert('No data to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Loan ID',
      'EMI Number',
      'Amount',
      'Due Date',
      'Payment Date',
      'Status',
      'Payment Mode',
      'Transaction ID'
    ];

    // Convert data to CSV rows
    const rows = this.filteredRepayments.map(r => [
      r.loanId || '',
      r.emiNumber || '',
      r.amount || 0,
      r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '',
      r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '',
      r.paymentStatus || '',
      r.paymentMode || '',
      r.transactionId || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells containing commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `repayments_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  formatAmount(amount: number | undefined | null): string {
    if (!amount && amount !== 0) return '0';
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  getStatusBadge(status: string | undefined): string {
    if (!status) return 'secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'paid' || statusLower === 'success') {
      return 'success';
    }
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'overdue') return 'danger';
    if (statusLower === 'failed') return 'danger';
    return 'secondary';
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
}