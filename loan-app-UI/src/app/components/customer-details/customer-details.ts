// customer-details.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer, VerificationStatus } from '../../models/customer';
import { CustomerService } from '../../services/customer-service';
import { ToastService } from '../../services/toast-service';

interface ActivityLog {
  id: number;
  action: string;
  timestamp: Date;
  description: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: Date;
  status: 'verified' | 'pending' | 'rejected';
  size: string;
}

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css'
})

export class CustomerDetails implements OnInit {
  @Input() selectedCustomer!: Customer;
  @Output() close = new EventEmitter<void>();

  activeTab: 'overview' | 'documents' | 'activity' | 'loans' = 'overview';
  isLoading = false;

  // Mock data - replace with actual API calls
  activityLogs: ActivityLog[] = [];
  documents: Document[] = [];
  loanApplications: any[] = [];

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAdditionalData();
  }

  loadAdditionalData(): void {
    // Mock activity logs
    this.activityLogs = [
      {
        id: 1,
        action: 'Profile Updated',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Customer updated contact information',
        type: 'info'
      },
      {
        id: 2,
        action: 'Document Uploaded',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        description: 'Aadhar card uploaded for verification',
        type: 'success'
      },
      {
        id: 3,
        action: 'Verification Status Changed',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Profile verification completed',
        type: 'success'
      }
    ];

    // Mock documents
    this.documents = [
      {
        id: 1,
        name: 'Aadhar Card',
        type: 'Identity Proof',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'verified',
        size: '2.3 MB'
      },
      {
        id: 2,
        name: 'PAN Card',
        type: 'Identity Proof',
        uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'verified',
        size: '1.8 MB'
      },
      {
        id: 3,
        name: 'Bank Statement',
        type: 'Financial Document',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
        size: '4.5 MB'
      }
    ];

    // Mock loan applications
    this.loanApplications = [
      {
        id: 'LN-2024-1001',
        type: 'Personal Loan',
        amount: 500000,
        status: 'Approved',
        applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        interestRate: 10.5
      },
      {
        id: 'LN-2024-1052',
        type: 'Home Loan',
        amount: 2500000,
        status: 'Processing',
        applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        interestRate: 8.75
      }
    ];
  }

  onClose(): void {
    this.close.emit();
  }

  setActiveTab(tab: 'overview' | 'documents' | 'activity' | 'loans'): void {
    this.activeTab = tab;
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

  getCreditScoreColor(score: number): string {
    if (score >= 750) return 'success';
    if (score >= 650) return 'info';
    if (score >= 550) return 'warning';
    return 'danger';
  }

  getCreditScoreLabel(score: number): string {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  }

  getInitials(customer: Customer): string {
    const first = customer.firstName?.charAt(0) || '';
    const last = customer.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'C';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadDocument(doc: Document): void {
    this.toastService.success(`Downloading ${doc.name}...`);
    // Implement download logic
  }

  verifyDocument(doc: Document): void {
    this.toastService.info('Verifying document...');
    // Implement verification logic
  }

  rejectDocument(doc: Document): void {
    this.toastService.warning('Document rejected');
    // Implement rejection logic
  }

  sendMessage(): void {
    this.toastService.info('Opening message composer...');
    // Implement messaging
  }

  editProfile(): void {
    this.toastService.info('Opening edit form...');
    // Implement edit
  }

  updateVerificationStatus(status: string): void {
    let Verificationstatus: VerificationStatus;
    switch (status) {
      case 'Verified':
        Verificationstatus = VerificationStatus.Verified;
        break;
      case 'Pending':
        Verificationstatus = VerificationStatus.Pending;
        break;
      case 'Rejected':
        Verificationstatus = VerificationStatus.Rejected;
        break;
      default:
        this.toastService.error('Invalid status');
        return;
    }

    this.isLoading = true;
    this.customerService.updateCustomerStatus(this.selectedCustomer.customerId!, Verificationstatus)
      .subscribe({
        next: () => {
          this.selectedCustomer.verificationStatus = Verificationstatus;
          this.toastService.success('Verification status updated successfully');
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Failed to update verification status');
          this.isLoading = false;
        }
      });
  }

  getDocumentIcon(type: string): string {
    if (type.includes('Identity')) return 'bi-person-badge';
    if (type.includes('Financial')) return 'bi-bank';
    if (type.includes('Address')) return 'bi-house';
    return 'bi-file-earmark';
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'info': return 'bi-info-circle';
      case 'success': return 'bi-check-circle';
      case 'warning': return 'bi-exclamation-triangle';
      case 'danger': return 'bi-x-circle';
      default: return 'bi-circle';
    }
  }

  getLoanStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  }
}
