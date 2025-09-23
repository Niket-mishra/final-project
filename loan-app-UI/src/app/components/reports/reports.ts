import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast-service';
import { ReportService } from '../../services/report-service';

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {
   reports: Report[] = [];
  isLoading = true;

  private reportService = inject(ReportService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (res) => {
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
    window.open(report.url, '_blank');
  }
}
