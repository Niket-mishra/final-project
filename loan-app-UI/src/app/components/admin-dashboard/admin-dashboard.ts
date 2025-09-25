import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanApplicationService } from '../../services/loan-application-service';
import { LoanSchemeService } from '../../services/loan-scheme';
import { ToastService } from '../../services/toast-service';

interface AdminStats {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  disbursed: number;
  totalSchemes: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
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
    totalSchemes: 0
  };

  private applicationService = inject(LoanApplicationService);
  private schemeService = inject(LoanSchemeService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadAdminStats();
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
  }
}