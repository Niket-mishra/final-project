import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanApplication, Status } from '../../models/loan-application';
import { ModalWrapperComponent } from '../../components/modal-wrapper-component/modal-wrapper-component';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalWrapperComponent],
  templateUrl: './loan-application.html',
  styleUrls: ['./loan-application.css']
})
export class LoanApplications implements OnInit {
  applications: LoanApplication[] = [];
  isLoading = false;
  error = '';
  success = '';
  Status = Status;

  showEditModal = false;
  editApplication: LoanApplication | null = null;
  updateError = '';
  updateSuccess = '';

  constructor(private service: LoanApplicationService) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load applications.';
        this.isLoading = false;
      }
    });
  }

  updateStatus(application: LoanApplication, status: Status): void {
    this.service.updateStatus(application.applicationId, status).subscribe({
      next: (updatedApp) => {
        const index = this.applications.findIndex(a => a.applicationId === updatedApp.applicationId);
        if (index !== -1) this.applications[index] = updatedApp;
        this.success = `Application #${updatedApp.applicationId} marked as ${updatedApp.status}.`;
        this.error = '';
      },
      error: () => {
        this.error = 'Status update failed.';
        this.success = '';
      }
    });
  }

  openEditModal(app: LoanApplication): void {
    this.editApplication = { ...app };
    this.showEditModal = true;
  }

  cancelEdit(): void {
    this.editApplication = null;
    this.showEditModal = false;
    this.updateError = '';
    this.updateSuccess = '';
  }

  submitUpdate(): void {
    if (!this.editApplication) return;

    this.service.updateApplication(this.editApplication.applicationId, this.editApplication).subscribe({
      next: (updatedApp) => {
        const index = this.applications.findIndex(a => a.applicationId === updatedApp.applicationId);
        if (index !== -1) this.applications[index] = updatedApp;
        this.updateSuccess = 'Application updated successfully.';
        this.updateError = '';
        this.showEditModal = false;
      },
      error: () => {
        this.updateError = 'Failed to update application.';
        this.updateSuccess = '';
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getStatusColor(status: Status): string {
    switch (status) {
      case Status.Approved: return 'success';
      case Status.Rejected: return 'danger';
      case Status.Pending: return 'warning';
      case Status.Disbursed: return 'primary';
      default: return 'secondary';
    }
  }
}