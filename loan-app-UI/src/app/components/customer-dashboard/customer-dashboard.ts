// ============================================
// ENHANCED CUSTOMER DASHBOARD - BEAUTIFUL UI
// Optimized and Feature-Rich
// ============================================

import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanApplication } from '../../models/loan-application';
import { LoanDocument } from '../../models/loan-document';
import { CustomerQuery } from '../../models/customer-query';
import { Repayment } from '../../models/repayment';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { LoanApplicationService } from '../../services/loan-application-service';
import { DocumentService } from '../../services/document-service';
import { QueryService } from '../../services/query-service';
import { RepaymentService } from '../../services/repayment-service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Alert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  actionLink?: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  template: `
    <div class="customer-dashboard">
      <!-- Enhanced Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">🏠 Your Loan Dashboard</h2>
          <p class="text-muted mb-0">Manage your loans, documents, and queries all in one place</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" (click)="loadDashboard()" [disabled]="isLoading">
            🔄 Refresh
          </button>
          <button class="btn btn-sm btn-primary" [routerLink]="['/customer/apply-loan']">
            ➕ New Application
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3 text-muted">Loading your data...</p>
        </div>
      } @else {

        <!-- Alert Notifications -->
        @if (alerts.length > 0) {
          <div class="alert-banner mb-4">
            @for (alert of alerts; track alert.id) {
              <div class="alert" [class]="'alert-' + getAlertClass(alert.type) + ' alert-dismissible fade show'">
                <strong>{{ alert.title }}</strong> {{ alert.message }}
                @if (alert.actionLink) {
                  <a [routerLink]="alert.actionLink" class="alert-link ms-2">Take Action →</a>
                }
                <button type="button" class="btn-close" (click)="dismissAlert(alert.id)"></button>
              </div>
            }
          </div>
        }

        <!-- Key Metrics Grid -->
        <div class="row g-3 mb-4">
          @for (stat of summaryStats; track stat.label) {
            <div class="col-lg col-md-4 col-sm-6">
              <div class="metric-card card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <p class="text-muted mb-1 small">{{ stat.label }}</p>
                      <h3 class="fw-bold mb-0">{{ stat.value }}</h3>
                      @if (stat.label === 'Total' && getTrendPercentage() !== null) {
                        <span class="badge bg-success-subtle text-success mt-2">
                          ↑ {{ getTrendPercentage() }}%
                        </span>
                      }
                    </div>
                    <div class="metric-icon" [class]="'bg-' + getColorForLabel(stat.label) + '-subtle'">
                      <span class="fs-3">{{ getIconForLabel(stat.label) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Status Breakdown -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center" 
                 [routerLink]="['/applications/list']" 
                 [queryParams]="{status: 'pending'}">
              <div class="card-body py-3">
                <div class="status-icon text-warning mb-2">⏳</div>
                <h5 class="fw-bold mb-0">{{ summaryStats[2].value || 0 }}</h5>
                <small class="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/applications/list']" 
                 [queryParams]="{status: 'approved'}">
              <div class="card-body py-3">
                <div class="status-icon text-success mb-2">✅</div>
                <h5 class="fw-bold mb-0">{{ summaryStats[1].value || 0 }}</h5>
                <small class="text-muted">Approved</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/applications/list']" 
                 [queryParams]="{status: 'rejected'}">
              <div class="card-body py-3">
                <div class="status-icon text-danger mb-2">❌</div>
                <h5 class="fw-bold mb-0">{{ summaryStats[3].value || 0 }}</h5>
                <small class="text-muted">Rejected</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="status-card card border-0 shadow-sm text-center"
                 [routerLink]="['/applications/list']" 
                 [queryParams]="{status: 'disbursed'}">
              <div class="card-body py-3">
                <div class="status-icon text-primary mb-2">💰</div>
                <h5 class="fw-bold mb-0">{{ summaryStats[4].value || 0 }}</h5>
                <small class="text-muted">Disbursed</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Applications & Quick Actions -->
        <div class="row g-4 mb-4">
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">🕒 Recent Applications</h5>
                <a [routerLink]="['/applications/list']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (recentApplications.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">📭</div>
                    <p class="text-muted mb-1">No recent applications</p>
                    <button class="btn btn-sm btn-outline-primary mt-2" 
                            [routerLink]="['/applications/create']">
                      Apply Now
                    </button>
                  </div>
                } @else {
                  <div class="application-list">
                    @for (app of recentApplications; track app.applicationId) {
                      <div class="application-item d-flex align-items-start p-3 border-bottom">
                        <div class="application-icon me-3 mt-1">
                          <span class="badge rounded-pill bg-primary-subtle text-primary">
                            #{{ app.applicationId }}
                          </span>
                        </div>
                        <div class="flex-grow-1">
                          <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong class="d-block">₹{{ app.requestedAmount | number:'1.0-0' }}</strong>
                              <small class="text-muted">{{ app.loanScheme?.schemeName || 'Loan Application' }}</small>
                            </div>
                            <span class="badge" [class]="'bg-' + getStatusColor(app.status)">
                              {{ app.status }}
                            </span>
                          </div>
                          <div class="small text-muted mb-2">
                            <strong>Purpose:</strong> {{ app.purposeOfLoan || 'N/A' }}<br>
                            <strong>Submitted:</strong> {{ app.applicationDate | date:'mediumDate' }}
                          </div>
                          <a [routerLink]="['/applications/details', app.applicationId]" 
                             class="btn btn-sm btn-outline-primary">
                            View Details
                          </a>
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
                  <a [routerLink]="['/customer/apply-loan']" 
                     class="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>➕ Apply for New Loan</span>
                  </a>
                  <a [routerLink]="['/customer/upload-documents']" 
                     class="btn btn-outline-success btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>📤 Upload Documents</span>
                    @if (getPendingDocuments() > 0) {
                      <span class="badge bg-warning">{{ getPendingDocuments() }}</span>
                    }
                  </a>
                  <a [routerLink]="['/queries/create']" 
                     class="btn btn-outline-info btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>❓ Submit Query</span>
                  </a>
                  <a [routerLink]="['/repayments/schedule']" 
                     class="btn btn-outline-warning btn-sm text-start d-flex align-items-center justify-content-between">
                    <span>💳 View EMI Schedule</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Application Summary -->
            <div class="card border-0 shadow-sm mt-3">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="fw-bold mb-0">📊 Summary</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Total Applications</span>
                  <strong>{{ summaryStats[0].value || 0 }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Active Loans</span>
                  <strong class="text-success">{{ summaryStats[4].value || 0 }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small">Pending Review</span>
                  <strong class="text-warning">{{ summaryStats[2].value || 0 }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small">Total Disbursed</span>
                  <strong class="text-info">₹{{ getTotalDisbursedAmount() | number:'1.0-0' }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents & Queries -->
        <div class="row g-4 mb-4">
          <!-- Documents Section -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">📁 Your Documents</h5>
                <a [routerLink]="['/documents/list']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (documents.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">📄</div>
                    <p class="text-muted mb-1">No documents uploaded</p>
                    <a [routerLink]="['/documents/upload']" class="btn btn-sm btn-outline-primary mt-2">
                      Upload Documents
                    </a>
                  </div>
                } @else {
                  <div class="document-list">
                    @for (doc of documents.slice(0, 5); track doc.documentId) {
                      <div class="document-item d-flex align-items-center p-3 border-bottom">
                        <div class="doc-icon me-3">
                          <span class="fs-4">{{ getDocumentIcon(doc.documentType) }}</span>
                        </div>
                        <div class="flex-grow-1">
                          <strong class="d-block small">{{ doc.documentType }}</strong>
                          <small class="text-muted">{{ doc.fileName }}</small>
                        </div>
                        <span class="badge" [class]="'bg-' + getVerificationColor(doc.verificationStatus)">
                          {{ doc.verificationStatus }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Queries Section -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">❓ Your Queries</h5>
                <a [routerLink]="['/queries/list']" class="small text-decoration-none">View All →</a>
              </div>
              <div class="card-body p-0">
                @if (queries.length === 0) {
                  <div class="empty-state-small p-4 text-center">
                    <div class="empty-icon mb-2">💬</div>
                    <p class="text-muted mb-1">No queries submitted</p>
                    <a [routerLink]="['/queries/create']" class="btn btn-sm btn-outline-primary mt-2">
                      Submit Query
                    </a>
                  </div>
                } @else {
                  <div class="query-list">
                    @for (q of queries.slice(0, 5); track q.queryId) {
                      <div class="query-item p-3 border-bottom">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <strong class="small">{{ q.querySubject }}</strong>
                          <span class="badge" [class]="'bg-' + getQueryStatusColor(q.queryStatus)">
                            {{ q.queryStatus }}
                          </span>
                        </div>
                        <p class="small mb-1 text-muted">{{ q.queryDescription }}</p>
                        <small class="text-muted">
                          <strong>Response:</strong> {{ q.officerResponse || 'Awaiting response...' }}
                        </small>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Repayment History -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">💸 Repayment History</h5>
            <a [routerLink]="['/repayments/list']" class="small text-decoration-none">View All →</a>
          </div>
          <div class="card-body p-0">
            @if (repayments.length === 0) {
              <div class="empty-state-small p-4 text-center">
                <div class="empty-icon mb-2">💳</div>
                <p class="text-muted mb-0">No repayments made yet</p>
              </div>
            } @else {
              <div class="repayment-list">
                @for (r of repayments.slice(0, 6); track r.repaymentId) {
                  <div class="repayment-item d-flex align-items-start p-3 border-bottom">
                    <div class="repayment-icon me-3 mt-1">
                      <span class="badge rounded-pill bg-info-subtle text-info">
                        EMI #{{ r.emiNumber }}
                      </span>
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <strong class="d-block">₹{{ r.amount | number:'1.2-2' }}</strong>
                          <small class="text-muted">{{ r.paymentDate | date:'mediumDate' }}</small>
                        </div>
                        <span class="badge" [class]="'bg-' + getPaymentStatusColor(r.paymentStatus ?? '')">
                          {{ r.paymentStatus ?? 'Unknown' }}
                        </span>
                      </div>
                      @if (r.paymentMode) {
                        <small class="text-muted">Method: {{ r.paymentMode }}</small>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .customer-dashboard {
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
    .query-list,
    .repayment-list {
      max-height: 450px;
      overflow-y: auto;
    }

    .application-item:last-child,
    .document-item:last-child,
    .query-item:last-child,
    .repayment-item:last-child {
      border-bottom: none !important;
    }

    .application-item:hover,
    .document-item:hover,
    .repayment-item:hover {
      background-color: #f8f9fa;
    }

    .empty-state-small {
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon {
      font-size: 3rem;
      opacity: 0.4;
    }

    .doc-icon,
    .application-icon,
    .repayment-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-header {
      font-weight: 500;
    }

    .alert-banner {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
      .customer-dashboard {
        padding: 1rem;
      }

      .metric-icon {
        width: 50px;
        height: 50px;
      }
    }
  `]
})
export class CustomerDashboard implements OnInit, OnDestroy {


  customerId!: number;
  recentApplications: LoanApplication[] = [];
  applications: LoanApplication[] = [];
  documents: LoanDocument[] = [];
  queries: CustomerQuery[] = [];
  repayments: Repayment[] = [];
  summaryStats: { label: string; value: number }[] = [];
  alerts: Alert[] = [];
  isLoading = true;

  private destroy$ = new Subject<void>();
  private auth = inject(Auth);
  private toast = inject(ToastService);
  private applicationService = inject(LoanApplicationService);
  private documentService = inject(DocumentService);
  private queryService = inject(QueryService);
  private repaymentService = inject(RepaymentService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.customerId = this.auth.getUserId() ?? 0;
    if (this.customerId === 0) {
      this.toast.error('Invalid customer ID');
      this.isLoading = false;
      return;
    }
    this.loadDashboard();
    setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.isLoading = true;

    forkJoin({
      applications: this.applicationService.getApplicationsByCustomer(this.customerId),
      documents: this.documentService.getDocumentsByCustomer(this.customerId),
      queries: this.queryService.getQueriesByCustomer(this.customerId),
      repayments: this.repaymentService.getRepaymentsByCustomer(this.customerId),
      recentApplications: this.applicationService.getRecentApplications(this.customerId),
      summary: this.applicationService.getApplicationSummary(this.customerId)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ applications, documents, queries, repayments, recentApplications, summary }) => {
        this.applications = applications || [];
        this.documents = documents || [];
        this.queries = queries || [];
        this.repayments = repayments || [];
        this.recentApplications = recentApplications || [];
        this.summaryStats = [
          { label: 'Total', value: summary?.total || 0 },
          { label: 'Approved', value: summary?.approved || 0 },
          { label: 'Pending', value: summary?.pending || 0 },
          { label: 'Rejected', value: summary?.rejected || 0 },
          { label: 'Disbursed', value: summary?.disbursed || 0 }
        ];
        this.generateAlerts();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.toast.error('Failed to load dashboard data');
        this.isLoading = false;
      }
    });
  }

  generateAlerts(): void {
    this.alerts = [];
    
    // Check for pending documents
    const pendingDocs = this.getPendingDocuments();
    if (pendingDocs > 0) {
      this.alerts.push({
        id: '1',
        type: 'WARNING',
        title: 'Document Verification Pending:',
        message: `${pendingDocs} document(s) require verification`,
        actionLink: '/documents/upload'
      });
    }

    // Check for pending applications
    const pendingApps = this.summaryStats[2]?.value || 0;
    if (pendingApps > 0) {
      this.alerts.push({
        id: '2',
        type: 'INFO',
        title: 'Applications Under Review:',
        message: `${pendingApps} application(s) are being reviewed`,
        actionLink: '/applications/list'
      });
    }

    // Check for approved applications
    const approvedApps = this.summaryStats[1]?.value || 0;
    if (approvedApps > 0 && this.summaryStats[4]?.value === 0) {
      this.alerts.push({
        id: '3',
        type: 'SUCCESS',
        title: 'Application Approved:',
        message: 'Congratulations! Your loan has been approved',
        actionLink: '/applications/list'
      });
    }
  }

  dismissAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }

  getAlertClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'WARNING': 'warning',
      'ERROR': 'danger',
      'INFO': 'info',
      'SUCCESS': 'success'
    };
    return typeMap[type] || 'info';
  }

  getPendingDocuments(): number {
    return this.documents.filter(d => 
      d.verificationStatus?.toLowerCase().includes('pending')
    ).length;
  }

  getTotalDisbursedAmount(): number {
    return this.applications
      .filter(app => app.status?.toLowerCase().includes('disbursed'))
      .reduce((sum, app) => sum + (app.approvedAmount || 0), 0);
  }

  getTrendPercentage(): number | null {
    // Mock trend - in real app, calculate based on historical data
    return this.summaryStats[0]?.value > 0 ? 15 : null;
  }

  getDocumentIcon(docType: string): string {
    const iconMap: { [key: string]: string } = {
      'Identity Proof': '🪪',
      'Address Proof': '🏠',
      'Income Proof': '💼',
      'Bank Statement': '🏦',
      'Photo': '📸',
      'Signature': '✍️'
    };
    return iconMap[docType] || '📄';
  }

  getIconForLabel(label: string): string {
    const icons: { [key: string]: string } = {
      'Total': '📁',
      'Approved': '✅',
      'Pending': '⏳',
      'Rejected': '❌',
      'Disbursed': '💰'
    };
    return icons[label] || '📊';
  }

  getColorForLabel(label: string): string {
    const colors: { [key: string]: string } = {
      'Total': 'primary',
      'Approved': 'success',
      'Pending': 'warning',
      'Rejected': 'danger',
      'Disbursed': 'info'
    };
    return colors[label] || 'secondary';
  }

  getStatusColor(status: string): string {
    if (!status) return 'secondary';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('rejected')) return 'danger';
    if (statusLower.includes('disbursed')) return 'info';
    return 'secondary';
  }

  getVerificationColor(status: string): string {
    if (!status) return 'secondary';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('verified')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('rejected')) return 'danger';
    return 'secondary';
  }

  getQueryStatusColor(status: string): string {
    if (!status) return 'secondary';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('resolved') || statusLower.includes('closed')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('open') || statusLower.includes('progress')) return 'info';
    return 'secondary';
  }

  getPaymentStatusColor(status: string): string {
    if (!status) return 'secondary';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('paid') || statusLower.includes('success')) return 'success';
    if (statusLower.includes('pending') || statusLower.includes('processing')) return 'warning';
    if (statusLower.includes('failed') || statusLower.includes('overdue') || statusLower.includes('late')) return 'danger';
    return 'secondary';
  }
}