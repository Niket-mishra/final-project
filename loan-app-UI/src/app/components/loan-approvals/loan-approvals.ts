import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanApplication, ApplicationStatus } from '../../models/loan-application';

@Component({
  selector: 'app-loan-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-approvals.html',
  styleUrl: './loan-approvals.css'
})
export class LoanApprovals implements OnInit {
  isLoading = true;
  errorMessage = '';
  applications: LoanApplication[] = [];

  constructor(private loanApplicationService: LoanApplicationService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loanApplicationService.getByStatus(ApplicationStatus.Pending).subscribe({
      next: (data: LoanApplication[]) => {
        this.applications = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load pending applications.';
        this.isLoading = false;
      }
    });
  }

  approve(applicationId: number): void {
    this.loanApplicationService.updateStatus(applicationId, ApplicationStatus.Approved, 'Approved by officer').subscribe({
      next: () => {
        this.applications = this.applications.filter(app => app.applicationId !== applicationId);
      },
      error: () => {
        this.errorMessage = `Failed to approve application ${applicationId}.`;
      }
    });
  }

  reject(applicationId: number): void {
    this.loanApplicationService.updateStatus(applicationId, ApplicationStatus.Rejected, 'Rejected by officer').subscribe({
      next: () => {
        this.applications = this.applications.filter(app => app.applicationId !== applicationId);
      },
      error: () => {
        this.errorMessage = `Failed to reject application ${applicationId}.`;
      }
    });
  }
}