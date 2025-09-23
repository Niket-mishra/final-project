import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { LoanApplication } from '../../models/loan-application';
import { LoanDocument } from '../../models/loan-document';
import { CustomerQuery } from '../../models/customer-query';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-dashboard.html',
  styleUrls: ['./officer-dashboard.css']
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

  ngOnInit(): void {
    this.officerId = this.auth.getUserId() ?? 0;
    this.loadDashboard();
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
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Open': return 'warning';
      case 'InProgress': return 'info';
      case 'Resolved': return 'success';
      case 'Closed': return 'secondary';
      default: return 'dark';
    }
  }
}