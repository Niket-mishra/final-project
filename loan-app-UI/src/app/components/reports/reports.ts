import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast-service';
import { ReportService } from '../../services/report-service';
import { Report } from '../../models/report';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit {
  reports: Report[] = [];
  isLoading = true;

  private reportService = inject(ReportService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (res: Report[]) => {
        this.reports = res;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load reports');
        this.isLoading = false;
      }
    });
  }

  downloadReport(report: Report): void {
    if (!report.filePath) {
      this.toast.error('Report file path is missing');
      return;
    }
    window.open(report.filePath, '_blank');
  }
}
