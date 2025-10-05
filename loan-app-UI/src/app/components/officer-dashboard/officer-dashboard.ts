import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfficerService } from '../../services/officer-service';
import { LoanApplication, ApplicationStatus } from '../../models/loan-application';
import { LoanDocument, DocumentStatus } from '../../models/loan-document';
import { CustomerQuery } from '../../models/customer-query';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user-service';
import { Customer } from '../../models/customer';
import { CustomerService } from '../../services/customer-service';
import { DocumentService } from '../../services/document-service';

interface DashboardData {
  applications: LoanApplication[];
  documents: LoanDocument[];
  queries: CustomerQuery[];
}

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
          <button class="btn btn-sm btn-outline-primary" 
                  (click)="loadDashboard()" 
                  [disabled]="isLoading">
                  @if (!isLoading) {
            <span>🔄 Refresh</span>
                  }
                  @if (isLoading) {
            <span class="spinner-border spinner-border-sm"></span>
                  }
          </button>
          <button class="btn btn-sm btn-primary" [routerLink]="['/officer/loan-applications']">
            📋 View All Applications
          </button>
        </div>
      </div>

      @if (error) {
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center">
          <span class="fs-4 me-3">⚠️</span>
          <div class="flex-grow-1">
            <strong>Error Loading Dashboard</strong>
            <p class="mb-0">{{ error }}</p>
          </div>
          <button class="btn btn-sm btn-outline-danger me-2" (click)="loadDashboard()">
            Retry
          </button>
          <button type="button" class="btn-close" (click)="error = ''"></button>
        </div>
      }

      @if (isLoading && !error) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      } @else if (!error) {

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
                    <a [routerLink]="['/officer/assignments']" 
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
                    <h3 class="fw-bold mb-0 text-success">{{ getVerifiedDocumentsCount() }}</h3>
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
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/officer/loan-applications']"
                 [queryParams]="{status: 'pending'}">
              <div class="card-body py-3">
                <div class="status-icon text-warning mb-2">⏳</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Pending') }}</h5>
                <small class="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/officer/loan-applications']"
                 [queryParams]="{status: 'approved'}">
              <div class="card-body py-3">
                <div class="status-icon text-success mb-2">✅</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Approved') }}</h5>
                <small class="text-muted">Approved</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/officer/loan-applications']"
                 [queryParams]="{status: 'rejected'}">
              <div class="card-body py-3">
                <div class="status-icon text-danger mb-2">❌</div>
                <h5 class="fw-bold mb-0">{{ getStatusCount('Rejected') }}</h5>
                <small class="text-muted">Rejected</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/officer/loan-applications']"
                 [queryParams]="{status: 'disbursed'}">
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
                <a [routerLink]="['/officer/assignments']" class="small text-decoration-none">View All →</a>
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
                              <strong class="d-block">{{ getCustomerName(app) }}</strong>
                              <small class="text-muted">{{ getLoanSchemeName(app) }}</small>
                            </div>
                            <span class="badge bg-{{ getApplicationBadgeColor(app.status) }}">
                              {{ app.status || 'Unknown' }}
                            </span>
                          </div>
                          <div class="row g-2 small text-muted">
                            <div class="col-sm-6">
                              <strong>Amount:</strong> ₹{{ formatAmount(app.requestedAmount) }}
                            </div>
                            <div class="col-sm-6">
                              <strong>Purpose:</strong> {{ app.purposeOfLoan || 'N/A' }}
                            </div>
                            <div class="col-sm-6">
                              <strong>Submitted:</strong> {{ formatDate(app.applicationDate) }}
                            </div>
                            <div class="col-sm-6">
                              <strong>Assigned:</strong> {{ formatDate(app.officerAssignedDate) || 'N/A' }}
                            </div>
                          </div>
                          <div class="mt-2">
                            <a [routerLink]="['/officer/loan-applications', app.applicationId]" 
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
                  <a [routerLink]="['/officer/loan-applications']" 
                     [queryParams]="{status: 'pending'}"
                     class="btn btn-outline-warning btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>⏳ Review Pending Applications</span>
                    @if (getPendingCount() > 0) {
                      <span class="badge bg-warning">{{ getPendingCount() }}</span>
                    }
                  </a>
                  <a [routerLink]="['/officer/documents']" 
                     class="btn btn-outline-success btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>📄 Verify Documents</span>
                    @if (getPendingDocumentsCount() > 0) {
                      <span class="badge bg-warning">{{ getPendingDocumentsCount() }}</span>
                    }
                  </a>
                  <a [routerLink]="['/officer/queries']" 
                     class="btn btn-outline-info btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>❓ Answer Queries</span>
                    @if (getOpenQueriesCount() > 0) {
                      <span class="badge bg-info">{{ getOpenQueriesCount() }}</span>
                    }
                  </a>
                  <a [routerLink]="['/officer/enerate-report']" 
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
                  <div class="progress-bar bg-success" 
                       [style.width.%]="getApprovalRate()"
                       role="progressbar"
                       [attr.aria-valuenow]="getApprovalRate()"
                       aria-valuemin="0"
                       aria-valuemax="100"></div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Total Processed</span>
                  <strong>{{ getProcessedCount() }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Pending Action</span>
                  <strong class="text-warning">{{ getPendingCount() }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small">Average Processing Time</span>
                  <strong>{{ getAverageProcessingTime() }} days</strong>
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
                <h5 class="fw-bold mb-0">📁 Recent Documents</h5>
                <a [routerLink]="['/officer/document-verification']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (verifiedDocuments.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">📄</div>
                    <p class="text-muted mb-0">No documents processed yet</p>
                  </div>
                } @else {
                  <div class="document-list">
                    @for (doc of verifiedDocuments.slice(0, 4); track doc.documentId) {
                      <div class="document-item d-flex align-items-center p-3 border-bottom">
                        <div class="doc-icon me-3">
                          <span class="fs-4">{{ getDocumentIcon(doc.documentType) }}</span>
                        </div>
                        <div class="flex-grow-1">
                          <strong class="d-block small">{{ doc.documentType || 'Document' }}</strong>
                          <small class="text-muted text-truncate d-block" style="max-width: 300px;">
                            {{ doc.fileName || 'N/A' }}
                          </small>
                          <small class="text-muted">
                            App ID: {{ doc.applicationId }} | Verified: {{ formatDate(doc.verificationDate) || 'N/A' }}
                          </small>
                        </div>
                        <span class="badge bg-{{ getDocumentBadgeColor(doc.verificationStatus) }}">
                          {{ doc.verificationStatus || 'Unknown' }}
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
                <h5 class="fw-bold mb-0">❓ Recent Queries</h5>
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
                            {{ getQueryCustomerName(query) }}
                          </strong>
                          <span class="badge bg-{{ getQueryBadgeColor(query.queryStatus) }}">
                            {{ query.queryStatus || 'Unknown' }}
                          </span>
                        </div>
                        <p class="small mb-1 fw-semibold">{{ query.querySubject || 'No subject' }}</p>
                        <p class="small mb-1 text-muted text-truncate">{{ query.queryDescription || 'No description' }}</p>
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
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .status-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.3rem 0.6rem rgba(0,0,0,0.12) !important;
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

    .text-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .officer-dashboard {
        padding: 1rem;
      }

      .metric-icon {
        width: 50px;
        height: 50px;
      }
    }
  `]
})
export class OfficerDashboard implements OnInit, OnDestroy {
  officerId!: number;
  assignedApplications: LoanApplication[] = [];
  verifiedDocuments: LoanDocument[] = [];
  handledQueries: CustomerQuery[] = [];
  customer:Customer[] = [];
  isLoading = true;
  error = '';

  private destroy$ = new Subject<void>();
  private officerService = inject(OfficerService);
  private auth = inject(Auth);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UserService);
  private customerService = inject(CustomerService);
  private documentService = inject(DocumentService)
  

  ngOnInit(): void {
  const userId = this.auth.getUserId();
    
    if (!userId || userId === 0) {
    this.error = 'Invalid customer ID. Please log in again.';
    this.isLoading = false;
    this.toast.error('Invalid customer ID');
    return;
  }

   this.userService.getRoleEntityId(userId).subscribe({
    next: (response: { roleEntityId: number }) => {
      console.log(response.roleEntityId);
      
      this.officerId = response.roleEntityId;
      this.loadDashboard();
    },
    error: (err) => {
      console.error('Failed to fetch role entity ID:', err);
      this.error = 'Unable to load Officer information.';
      this.isLoading = false;
      this.toast.error('Failed to load officer info');
    }
  });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.error = '';

    this.officerService.getDashboardData(this.officerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardData) => {
          this.assignedApplications = data.applications || [];
          this.verifiedDocuments = data.documents || [];
          this.handledQueries = data.queries || [];
          this.isLoading = false;
          console.log(this.customer);

          this.assignedApplications.forEach(app => {
      if (app.customerId) {
        this.customerService.getCustomerById(app.customerId).subscribe(cust => {
          app.customer = cust;
          this.cdr.markForCheck();
        });
      }
    });
        this.documentService.getPendingDocuments().subscribe({
  next: (documents: LoanDocument[]) => {
    this.verifiedDocuments = documents;
  },
  error: (err) => {
    console.error('Failed to fetch documents:', err);
  }
});

          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Dashboard load error:', err);
          this.error = 'Failed to load dashboard data. Please try again.';
          this.toast.error('Failed to load dashboard data');
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  getPendingCount(): number {
    return this.assignedApplications.filter(
      app => app.status === ApplicationStatus.Pending || 
             app.status?.toLowerCase() === 'pending'
    ).length;
  }

  getStatusCount(status: string): number {
    return this.assignedApplications.filter(
      app => app.status === status as ApplicationStatus ||
             app.status?.toLowerCase() === status.toLowerCase()
    ).length;
  }

  getProcessedCount(): number {
    return this.assignedApplications.filter(
      app => app.status === ApplicationStatus.Approved ||
             app.status === ApplicationStatus.Rejected ||
             app.status === ApplicationStatus.Pending ||
             app.status === ApplicationStatus.Disbursed
    ).length;
  }

  getVerifiedDocumentsCount(): number {
    return this.verifiedDocuments.filter(
      doc => doc.verificationStatus === DocumentStatus.Approved ||
             doc.verificationStatus?.toLowerCase().includes('verified') ||
             doc.verificationStatus?.toLowerCase().includes('approved')
    ).length;
  }

  getPendingDocumentsCount(): number {
    return this.verifiedDocuments.filter(
      doc => doc.verificationStatus === DocumentStatus.Pending ||
             doc.verificationStatus?.toLowerCase().includes('pending')
    ).length;
  }

  getOpenQueriesCount(): number {
    return this.handledQueries.filter(
      query => query.queryStatus?.toLowerCase().includes('open') ||
               query.queryStatus?.toLowerCase().includes('pending')
    ).length;
  }

  getApprovalRate(): number {
    const total = this.assignedApplications.length;
    if (total === 0) return 0;
    
    const approved = this.getStatusCount('Approved');
    return Math.round((approved / total) * 100);
  }

  getAverageProcessingTime(): number {
    const processedApps = this.assignedApplications.filter(
      app => app.status === ApplicationStatus.Approved ||
             app.status === ApplicationStatus.Rejected
    );

    if (processedApps.length === 0) return 0;

    const totalDays = processedApps.reduce((sum, app) => {
      if (app.applicationDate && app.officerAssignedDate) {
        const start = new Date(app.applicationDate).getTime();
        const end = new Date(app.officerAssignedDate).getTime();
        const days = Math.abs((end - start) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);

    return Math.round(totalDays / processedApps.length);
  }

  getApplicationBadgeColor(status: ApplicationStatus | string | undefined): string {
    if (!status) return 'secondary';
    
    const statusStr = typeof status === 'string' ? status : status;
    const statusLower = statusStr.toLowerCase();

    if (statusLower === 'approved') return 'success';
    if (statusLower === 'rejected') return 'danger';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'disbursed') return 'info';
    
    return 'secondary';
  }

  getDocumentBadgeColor(status: DocumentStatus | string | undefined): string {
    if (!status) return 'secondary';
    
    const statusStr = typeof status === 'string' ? status : status;
    const statusLower = statusStr.toLowerCase();

    if (statusLower.includes('approved') || statusLower.includes('verified')) return 'success';
    if (statusLower.includes('rejected')) return 'danger';
    if (statusLower.includes('pending')) return 'warning';
    
    return 'secondary';
  }

  getQueryBadgeColor(status: string | undefined): string {
    if (!status) return 'secondary';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('resolved') || statusLower.includes('closed')) return 'success';
    if (statusLower.includes('progress')) return 'info';
    if (statusLower.includes('open') || statusLower.includes('pending')) return 'warning';
    
    return 'secondary';
  }

 getCustomerName(app: LoanApplication): string {
  const first = app.customer?.firstName || '';
  const last = app.customer?.lastName || '';
  return (first || last) ? `${first} ${last}`.trim() : 'Unknown Customer';
}

  getLoanSchemeName(app: LoanApplication): string {
    return app.loanScheme?.schemeName || 'Loan Application';
  }

  getQueryCustomerName(query: CustomerQuery): string {
    if (query.customer?.firstName || query.customer?.lastName) {
      return `${query.customer.firstName || ''} ${query.customer.lastName || ''}`.trim();
    }
    return 'Unknown Customer';
  }

  getDocumentIcon(docType: string | undefined): string {
    if (!docType) return '📄';
    
    const iconMap: { [key: string]: string } = {
      'identity': '🪪',
      'address': '🏠',
      'income': '💼',
      'bank': '🏦',
      'photo': '📸',
      'signature': '✍️',
      'pan': '🪪',
      'aadhar': '🆔',
      'salary': '💰'
    };
    
    const key = docType.toLowerCase();
    for (const [docKey, icon] of Object.entries(iconMap)) {
      if (key.includes(docKey)) return icon;
    }
    
    return '📄';
  }

  formatAmount(amount: number | undefined | null): string {
    if (!amount && amount !== 0) return '0';
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  }
}