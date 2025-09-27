import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanApplication } from '../../models/loan-application';

@Component({
  selector: 'app-officer-assignments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-assignments.html',
  styleUrl: './officer-assignments.css'
})
export class OfficerAssignments implements OnInit {
  isLoading = true;
  errorMessage = '';
  applications: LoanApplication[] = [];

  constructor(private officerService: OfficerService, private auth: Auth) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();
    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.officerService.getAssignedApplications(officerId).subscribe({
      next: (data: LoanApplication[]) => {
        this.applications = data;
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load assigned applications.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  }
}