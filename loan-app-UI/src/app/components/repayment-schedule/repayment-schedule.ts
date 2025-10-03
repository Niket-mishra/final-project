import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanApplication } from '../../models/loan-application';

@Component({
  selector: 'app-repayment-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repayment-schedule.html',
  styleUrl: './repayment-schedule.css'
})
export class RepaymentSchedule implements OnInit {
  isLoading = true;
  repaymentData: LoanApplication[] = [];
  errorMessage = '';

  constructor(
    private officerService: OfficerService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();

    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.fetchRepaymentSchedule(officerId);
  }

  private fetchRepaymentSchedule(officerId: number): void {
    this.officerService.getAssignedApplications(officerId).subscribe({
      next: (applications: LoanApplication[]) => {
        this.repaymentData = applications.filter(app => 
          app.loan?.repayments && app.loan.repayments.length > 0
        );
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load repayment schedule.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
  getStatusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'danger';
    default: return 'secondary';
  }
}
}