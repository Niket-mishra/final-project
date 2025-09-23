import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboard implements OnInit {
  customerId!: number;
  recentApplications: LoanApplication[] = [];
  applications: LoanApplication[] = [];
  documents: LoanDocument[] = [];
  queries: CustomerQuery[] = [];
  repayments: Repayment[] = [];
  summaryStats: { label: string; value: number }[] = [];
  isLoading = true;

  private auth = inject(Auth);
  private toast = inject(ToastService);
  private applicationService = inject(LoanApplicationService);
  private documentService = inject(DocumentService);
  private queryService = inject(QueryService);
  private repaymentService = inject(RepaymentService);

  ngOnInit(): void {
    this.customerId = this.auth.getUserId() ?? 0;
    this.loadDashboard();
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
  }).subscribe({
    next: ({ applications, documents, queries, repayments, recentApplications, summary }) => {
      this.applications = applications;
      this.documents = documents;
      this.queries = queries;
      this.repayments = repayments;
      this.recentApplications = recentApplications;
      this.summaryStats = [
        { label: 'Total', value: summary.total },
        { label: 'Approved', value: summary.approved },
        { label: 'Pending', value: summary.pending },
        { label: 'Rejected', value: summary.rejected },
        { label: 'Disbursed', value: summary.disbursed }
      ];
      this.isLoading = false;
    },
    error: () => {
      this.toast.error('Failed to load dashboard data');
      this.isLoading = false;
    }
  });
  }
}