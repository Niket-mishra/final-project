// ============================================
// ENHANCED OFFICER DASHBOARD - BEAUTIFUL UI
// ============================================

import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfficerService } from '../../services/officer-service';
import { LoanApplication, ApplicationStatus } from '../../models/loan-application';
import { LoanDocument, DocumentStatus } from '../../models/loan-document';
import { CustomerQuery } from '../../models/customer-query';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="officer-dashboard">
      <!-- Enhanced Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">👨‍💼 Officer Dashboard</h2>
          <p class="text-muted mb-0">Manage your assigned applications, documents, and queries</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" (click)="loadDashboard()">
            🔄 Refresh
          </button>
          <button class="btn btn-sm btn-primary" [routerLink]="['/applications/list']">
            📋 View All Applications
          </button>
        </div>
      </div>

      @if (error) {
        <div class="alert alert-danger alert-dismissible fade show">
          <strong>Error:</strong> {{ error }}
          <button type="button" class="btn-close" (click)="error = ''"></button>
        </div>
      }

      @if (isLoading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      } @else {

        <!-- Key Metrics Grid -->
        <div class="row g-3 mb-4">
          <!-- Assigned Applications -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Assigned Applications</p>
                    <h3 class="fw-bold mb-0">{{ assignedApplications.length }}</h3>
                    <a [routerLink]="['/applications/list']" 
                       class="small text-decoration-none mt-2 d-inline-block">
                      View All →
                    </a>
                  </div>
                  <div class="metric-icon bg-primary-subtle">
                    <span class="fs-3">📋</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Review -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Pending Review</p>
                    <h3 class="fw-bold mb-0 text-warning">{{ getPendingCount() }}</h3>
                    <span class="small text-muted">Requires action</span>
                  </div>
                  <div class="metric-icon bg-warning-subtle">
                    <span class="fs-3">⏳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Verified -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Documents Verified</p>
                    <h3 class="fw-bold mb-0 text-success">{{ verifiedDocuments.length }}</h3>
                    <span class="small text-muted">Total processed</span>
                  </div>
                  <div class="metric-icon bg-success-subtle">
                    <span class="fs-3">📁</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Queries Handled -->
          <div class="col-lg-3 col-md-6">
            <div class="metric-card card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Queries Handled</p>
                    <h3 class="fw-bold mb-0">{{ handledQueries.length }}</h3>
                    <span class="small text-muted">Customer support</span>
                  </div>
                  <div class="metric-icon bg-info-subtle">
                    <span class="fs-3">❓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-warning mb-2">⏳</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Pending') }}</h5>
                <small class="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-success mb-2">✅</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Approved') }}</h5>
                <small class="text-muted">Approved</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-danger mb-2">❌</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Rejected') }}</h5>
                <small class="text-muted">Rejected</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <div class="status-icon text-primary mb-2">💰</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Disbursed') }}</h5>
                <small class="text-muted">Disbursed</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="row g-4 mb-4">
          <!-- Assigned Applications -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">📋 Assigned Applications</h5>
                <a [routerLink]="['/applications/list']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (assignedApplications.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">📭</div>
                    <p class="text-muted mb-0">No applications assigned</p>
                  </div>
                } @else {
                  <div class="application-list">
                    @for (app of assignedApplications.slice(0, 5); track app.applicationId) {
                      <div class="application-item d-flex align-items-start p-3 border-bottom">
                        <div class="application-icon me-3 mt-1">
                          <span class="badge rounded-pill bg-primary-subtle text-primary">
                            #{{ app.applicationId }}
                          </span>
                        </div>
                        <div class="flex-grow-1">
                          <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong class="d-block">{{ app.customer?.firstName }} {{ app.customer?.lastName }}</strong>
                              <small class="text-muted">{{ app.loanScheme?.schemeName || 'N/A' }}</small>
                            </div>
                            <span class="badge bg-{{ getApplicationBadgeColor(app.status) }}">
                              {{ app.status }}
                            </span>
                          </div>
                          <div class="row g-2 small text-muted">
                            <div class="col-sm-6">
                              <strong>Amount:</strong> ₹{{ app.requestedAmount | number:'1.0-0' }}
                            </div>
                            <div class="col-sm-6">
                              <strong>Purpose:</strong> {{ app.purposeOfLoan }}
                            </div>
                            <div class="col-sm-6">
                              <strong>Submitted:</strong> {{ app.applicationDate | date:'mediumDate' }}
                            </div>
                            <div class="col-sm-6">
                              <strong>Assigned:</strong> {{ app.officerAssignedDate || 'N/A' }}
                            </div>
                          </div>
                          <div class="mt-2">
                            <a [routerLink]="['/applications/review', app.applicationId]" 
                               class="btn btn-sm btn-outline-primary">
                              Review Application
                            </a>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Quick Actions & Summary -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">⚡ Quick Actions</h5>
              </div>
              <div class="card-body p-2">
                <div class="d-grid gap-2">
                  <a [routerLink]="['/applications/list']" 
                     [queryParams]="{status: 'pending'}"
                     class="btn btn-outline-warning btn-sm text-start">
                    ⏳ Review Pending Applications
                  </a>
                  <a [routerLink]="['/documents/verify']" 
                     class="btn btn-outline-success btn-sm text-start">
                    📄 Verify Documents
                  </a>
                  <a [routerLink]="['/queries/list']" 
                     class="btn btn-outline-info btn-sm text-start">
                    ❓ Answer Queries
                  </a>
                  <a [routerLink]="['/reports/officer']" 
                     class="btn btn-outline-secondary btn-sm text-start">
                    📊 View Reports
                  </a>
                </div>
              </div>
            </div>

            <!-- Performance Summary -->
            <div class="card border-0 shadow-sm mt-3">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">📊 Performance</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Approval Rate</span>
                  <strong>{{ getApprovalRate() }}%</strong>
                </div>
                <div class="progress mb-3" style="height: 6px;">
                  <div class="progress-bar bg-success" [style.width.%]="getApprovalRate()"></div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Total Processed</span>
                  <strong>{{ assignedApplications.length }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small">Pending Action</span>
                  <strong class="text-warning">{{ getPendingCount() }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents & Queries -->
        <div class="row g-4 mb-4">
          <!-- Verified Documents -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">📁 Verified Documents</h5>
                <a [routerLink]="['/documents/list']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (verifiedDocuments.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">📄</div>
                    <p class="text-muted mb-0">No documents verified yet</p>
                  </div>
                } @else {
                  <div class="document-list">
                    @for (doc of verifiedDocuments.slice(0, 4); track doc.documentId) {
                      <div class="document-item d-flex align-items-center p-3 border-bottom">
                        <div class="doc-icon me-3">
                          <span class="fs-4">📄</span>
                        </div>
                        <div class="flex-grow-1">
                          <strong class="d-block small">{{ doc.documentType }}</strong>
                          <small class="text-muted">
                            {{ doc.fileName }}<br>
                            App ID: {{ doc.applicationId }} | Verified: {{ doc.verificationDate || 'N/A' }}
                          </small>
                        </div>
                        <span class="badge bg-{{ getDocumentBadgeColor(doc.verificationStatus) }}">
                          {{ doc.verificationStatus }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Handled Queries -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">❓ Handled Queries</h5>
                <a [routerLink]="['/queries/list']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (handledQueries.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">💬</div>
                    <p class="text-muted mb-0">No queries handled yet</p>
                  </div>
                } @else {
                  <div class="query-list">
                    @for (query of handledQueries.slice(0, 4); track query.queryId) {
                      <div class="query-item p-3 border-bottom">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <strong class="small">
                            {{ query.customer?.firstName }} {{ query.customer?.lastName }}
                          </strong>
                          <span class="badge bg-{{ getQueryBadgeColor(query.queryStatus) }}">
                            {{ query.queryStatus }}
                          </span>
                        </div>
                        <p class="small mb-1">{{ query.queryDescription }}</p>
                        <small class="text-muted">
                          <strong>Response:</strong> {{ query.officerResponse || 'No response yet' }}
                        </small>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .officer-dashboard {
      padding: 1.5rem;
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .metric-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-card {
      transition: transform 0.2s;
      cursor: pointer;
    }

    .status-card:hover {
      transform: translateY(-2px);
    }

    .status-icon {
      font-size: 1.5rem;
    }

    .application-list,
    .document-list,
    .query-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .application-item:last-child,
    .document-item:last-child,
    .query-item:last-child {
      border-bottom: none !important;
    }

    .application-item:hover,
    .document-item:hover {
      background-color: #f8f9fa;
    }

    .empty-state-small {
      min-height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon {
      font-size: 2.5rem;
      opacity: 0.5;
    }

    .doc-icon,
    .application-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-header {
      font-weight: 500;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .btn-sm {
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .officer-dashboard {
        padding: 1rem;
      }
    }
  `]
})
export class OfficerDashboard implements OnInit {
  officerId!: number;
  assignedApplications: LoanApplication[] = [];
  verifiedDocuments: LoanDocument[] = [];
  handledQueries: CustomerQuery[] = [];
  isLoading = true;
  error = '';

  private officerService = inject(OfficerService);
  private auth = inject(Auth);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.auth.getUserId();
    if (typeof id !== 'number') {
      this.error = 'Invalid officer ID.';
      this.isLoading = false;
      return;
    }

    this.officerId = id;
    this.loadDashboard();
    setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.error = '';

    this.officerService.getDashboardData(this.officerId).subscribe({
      next: ({ applications, documents, queries }) => {
        this.assignedApplications = applications ?? [];
        this.verifiedDocuments = documents ?? [];
        this.handledQueries = queries ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data.';
        this.toast.error('Failed to load dashboard data');
        this.isLoading = false;
      }
    });
  }

  getPendingCount(): number {
    return this.assignedApplications.filter(
      app => app.status === ApplicationStatus.Pending
    ).length;
  }

  getStatusCount(status: string): number {
    return this.assignedApplications.filter(
      app => app.status === status as ApplicationStatus
    ).length;
  }

  getApprovalRate(): number {
    const total = this.assignedApplications.length;
    if (total === 0) return 0;
    const approved = this.getStatusCount('Approved');
    return Math.round((approved / total) * 100);
  }

  getApplicationBadgeColor(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved: return 'success';
      case ApplicationStatus.Rejected: return 'danger';
      case ApplicationStatus.Pending: return 'warning';
      case ApplicationStatus.Disbursed: return 'info';
      default: return 'secondary';
    }
  }

  getDocumentBadgeColor(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.Approved: return 'success';
      case DocumentStatus.Rejected: return 'danger';
      case DocumentStatus.Pending: return 'warning';
      default: return 'secondary';
    }
  }

  getQueryBadgeColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('resolved') || statusLower.includes('closed')) return 'success';
    if (statusLower.includes('progress')) return 'info';
    if (statusLower.includes('open')) return 'warning';
    return 'secondary';
  }

  getApplicationBadge(status: ApplicationStatus): string {
    return this.getApplicationBadgeColor(status);
  }

  getDocumentBadge(status: DocumentStatus): string {
    return this.getDocumentBadgeColor(status);
  }

  getQueryBadge(status: string): string {
    return this.getQueryBadgeColor(status);
  }
}