import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanSchemeService } from '../../services/loan-scheme';
import { ToastService } from '../../services/toast-service';
import { ChartModule } from 'primeng/chart'; // or ngx-charts, Chart.js wrapper
import { RouterModule } from '@angular/router';

interface AdminStats {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  disbursed: number;
  totalSchemes: number;
  unassigned: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  isLoading = true;
  stats: AdminStats = {
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    disbursed: 0,
    totalSchemes: 0,
    unassigned: 0
  };

  auditLogs: any[] = [];
  pieChartData: any;
  barChartData: any;

  private applicationService = inject(LoanApplicationService);
  private schemeService = inject(LoanSchemeService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadAdminStats();
    this.loadAuditLogs();
  }

  loadAdminStats(): void {
    this.isLoading = true;

    this.applicationService.getApplicationSummary(0).subscribe({
      next: (summary) => {
        this.stats.totalApplications = summary.total;
        this.stats.pending = summary.pending;
        this.stats.approved = summary.approved;
        this.stats.rejected = summary.rejected;
        this.stats.disbursed = summary.disbursed;
        this.prepareCharts();
      },
      error: () => this.toast.error('Failed to load application stats')
    });

    this.schemeService.getLoanSchemes().subscribe({
      next: (schemes) => {
        this.stats.totalSchemes = schemes.length;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load loan schemes');
        this.isLoading = false;
      }
    });

    this.applicationService.getUnassignedCount().subscribe({
      next: (count) => this.stats.unassigned = count,
      error: () => this.toast.error('Failed to load unassigned count')
    });
  }

  loadAuditLogs(): void {
    this.applicationService.getAuditLog(0).subscribe({
      next: (logs) => this.auditLogs = logs.slice(0, 5),
      error: () => this.toast.error('Failed to load audit logs')
    });
  }

  prepareCharts(): void {
    this.pieChartData = {
      labels: ['Pending', 'Approved', 'Rejected', 'Disbursed'],
      datasets: [{
        data: [
          this.stats.pending,
          this.stats.approved,
          this.stats.rejected,
          this.stats.disbursed
        ],
        backgroundColor: ['#ffc107', '#28a745', '#dc3545', '#17a2b8']
      }]
    };

    this.barChartData = {
      labels: ['Total', 'Unassigned', 'Schemes'],
      datasets: [{
        label: 'Overview',
        data: [
          this.stats.totalApplications,
          this.stats.unassigned,
          this.stats.totalSchemes
        ],
        backgroundColor: ['#007bff', '#343a40', '#6c757d']
      }]
    };
  }
}