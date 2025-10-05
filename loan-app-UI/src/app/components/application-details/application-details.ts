// application-details.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LoanApplication } from '../../models/loan-application';
import { LoanApplicationService } from '../../services/loan-application-service';
import { ToastService } from '../../services/toast-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-application-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div>
            <h4 class="modal-title">Application Details</h4>
            <p class="modal-subtitle">Review and manage loan application</p>
          </div>
          <button class="btn-close-modal" (click)="closeModal()" aria-label="Close">
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          @if (isLoading) {
            <div class="loading-state">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-3">Loading application details...</p>
            </div>
          } @else if (error) {
            <div class="error-state">
              <div class="error-icon">⚠️</div>
              <h5>Failed to Load Application</h5>
              <p>{{ error }}</p>
              <button class="btn btn-primary" (click)="retryLoad()">
                Retry
              </button>
            </div>
          } @else if (!application) {
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <p>No application details available</p>
            </div>
          } @else {
            <!-- Application Info Card -->
            <div class="info-card">
              <div class="info-header">
                <div>
                  <span class="application-id">Application #{{ application.applicationId }}</span>
                  <span class="badge ms-2" [class]="'bg-' + getStatusColor(application.status)">
                    {{ application.status || 'Unknown' }}
                  </span>
                </div>
                <div class="submitted-date">
                  Submitted: {{ application.applicationDate | date:'mediumDate' }}
                </div>
              </div>

              <!-- Customer Information -->
              <div class="section-divider">
                <h6 class="section-title">Customer Information</h6>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Customer Name</label>
                  <p>{{ getCustomerName() }}</p>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <p>{{ application.customer?.user?.email || 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label>Phone</label>
                  <p>{{ application.customer?.user?.phoneNumber || 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <p>{{ (application.customer?.dateOfBirth | date:'mediumDate') || 'N/A' }}</p>
                </div>
              </div>

              <!-- Loan Details -->
              <div class="section-divider">
                <h6 class="section-title">Loan Details</h6>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Requested Amount</label>
                  <p class="amount-text">₹{{ formatAmount(application.requestedAmount) }}</p>
                </div>
                <div class="info-item">
                  <label>Approved Amount</label>
                  <p class="amount-text">
                    {{ application.approvedAmount ? '₹' + formatAmount(application.approvedAmount) : 'Pending' }}
                  </p>
                </div>
                <div class="info-item">
                  <label>Loan Scheme</label>
                  <p>{{ application.loanScheme?.schemeName || 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label>Interest Rate</label>
                  <p>{{ application.loanScheme?.interestRate || 'N/A' }}%</p>
                </div>
                <div class="info-item">
                  <label>Purpose of Loan</label>
                  <p>{{ application.purposeOfLoan || 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label>Tenure</label>
                  <p>{{ application.loanScheme?.tenureMonths || 'N/A' }} months</p>
                </div>
              </div>

              <!-- Officer Assignment -->
              @if (application.loanOfficer || application.officerAssignedDate) {
                <div class="section-divider">
                  <h6 class="section-title">Officer Assignment</h6>
                </div>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Assigned Officer</label>
                    <p>{{ officerName }}</p>
                  </div>
                  <div class="info-item">
                    <label>Assigned Date</label>
                    <p>{{ application.officerAssignedDate ? (application.officerAssignedDate | date:'mediumDate') : 'N/A' }}</p>                  </div>
                </div>
              }

              <!-- Remarks -->
              @if (application.remarks) {
                <div class="section-divider">
                  <h6 class="section-title">Remarks</h6>
                </div>
                <div class="remarks-box">
                  <p>{{ application.remarks }}</p>
                </div>
              }

              <!-- Timeline -->
              <div class="section-divider">
                <h6 class="section-title">Application Timeline</h6>
              </div>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-marker active"></div>
                  <div class="timeline-content">
                    <strong>Application Submitted</strong>
                    <small>{{ application.applicationDate | date:'medium' }}</small>
                  </div>
                </div>
                @if (application.officerAssignedDate) {
                  <div class="timeline-item">
                    <div class="timeline-marker active"></div>
                    <div class="timeline-content">
                      <strong>Officer Assigned</strong>
                      <small>{{ application.officerAssignedDate | date:'medium' }}</small>
                    </div>
                  </div>
                }
                @if (application.status === 'Approved' || application.status === 'Rejected') {
                  <div class="timeline-item">
                    <div class="timeline-marker active"></div>
                    <div class="timeline-content">
                      <strong>Application {{ application.status }}</strong>
                      <small>Review completed</small>
                    </div>
                  </div>
                }
                @if (application.status === 'Disbursed') {
                  <div class="timeline-item">
                    <div class="timeline-marker active"></div>
                    <div class="timeline-content">
                      <strong>Loan Disbursed</strong>
                      <small>Amount credited to account</small>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Modal Footer -->
        @if (!isLoading && !error && application) {
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" (click)="closeModal()">
              Close
            </button>
            <button class="btn btn-primary" [routerLink]="['/officer/loan-applications/review', application.applicationId]">
              Review Application
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: #212529;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      color: #6c757d;
      margin: 0.25rem 0 0 0;
    }

    .btn-close-modal {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .btn-close-modal:hover {
      color: #212529;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .error-icon,
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-state h5 {
      color: #dc3545;
      margin-bottom: 0.5rem;
    }

    .info-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .application-id {
      font-size: 1.25rem;
      font-weight: 700;
      color: #212529;
    }

    .submitted-date {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .section-divider {
      margin: 1.5rem 0 1rem 0;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .section-title {
      font-weight: 600;
      color: #495057;
      margin: 0;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .info-item label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .info-item p {
      margin: 0;
      font-size: 0.95rem;
      color: #212529;
      font-weight: 500;
    }

    .amount-text {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0d6efd;
    }

    .remarks-box {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .remarks-box p {
      margin: 0;
      color: #495057;
      line-height: 1.6;
    }

    .timeline {
      margin-top: 1rem;
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 0.5rem;
      top: 0.5rem;
      bottom: 0.5rem;
      width: 2px;
      background: #dee2e6;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 1.5rem;
    }

    .timeline-item:last-child {
      padding-bottom: 0;
    }

    .timeline-marker {
      position: absolute;
      left: -1.5rem;
      top: 0.25rem;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #dee2e6;
      border: 2px solid white;
    }

    .timeline-marker.active {
      background: #0d6efd;
    }

    .timeline-content strong {
      display: block;
      color: #212529;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .timeline-content small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
      font-weight: 600;
    }

    .btn {
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-outline-secondary {
      border: 1px solid #6c757d;
      color: #6c757d;
      background: transparent;
    }

    .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

    .btn-primary {
      background: #0d6efd;
      border: 1px solid #0d6efd;
      color: white;
    }

    .btn-primary:hover {
      background: #0b5ed7;
      border-color: #0b5ed7;
    }

    @media (max-width: 768px) {
      .modal-container {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .info-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class ApplicationDetails implements OnInit, OnDestroy {
  application?: LoanApplication;
  isLoading = true;
  error = '';
  applicationId?: number;

  private destroy$ = new Subject<void>();
  private applicationService = inject(LoanApplicationService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location);
  private userService = inject(UserService)

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id && !isNaN(id)) {
      this.applicationId = id;
      this.loadDetails(id);
    } else {
      this.error = 'Invalid application ID';
      this.toast.error('Invalid application ID provided');
      this.isLoading = false;
    }

    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDetails(id: number): void {
  this.isLoading = true;
  this.error = '';
  this.officerName = 'Loading...';

  this.applicationService.getById(id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (app) => {
        this.application = app;
        this.isLoading = false;

        const officerId = app?.loanOfficer?.userId;
        if (officerId) {
          this.userService.getUserById(officerId).pipe(takeUntil(this.destroy$)).subscribe({
            next: user => {
              this.officerName = user?.username?.trim() || 'N/A';
              this.cdr.markForCheck(); // trigger change detection immediately
            },
            error: () => {
              this.officerName = 'N/A';
              this.cdr.markForCheck();
            }
          });
        } else {
          this.officerName = 'Not assigned';
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Error loading application:', err);
        this.error = 'Failed to load application details. Please try again.';
        this.toast.error('Failed to load application details');
        this.isLoading = false;
      }
    });
}

  retryLoad(): void {
    if (this.applicationId) {
      this.loadDetails(this.applicationId);
    }
  }

  closeModal(): void {
    this.location.back();
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('rejected')) return 'danger';
    if (statusLower.includes('disbursed')) return 'info';
    
    return 'secondary';
  }

  getCustomerName(): string {
    if (!this.application?.customer) return 'N/A';
    
    const { firstName, lastName } = this.application.customer;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return 'N/A';
  }

  officerName!: string
  
  formatAmount(amount: number | undefined | null): string {
    if (!amount && amount !== 0) return '0';
    return new Intl.NumberFormat('en-IN').format(amount);
  }

 
}