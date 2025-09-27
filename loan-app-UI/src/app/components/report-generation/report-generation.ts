import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-generation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-generation.html',
  styleUrl: './report-generation.css'
})
export class ReportGeneration {
  constructor(private officerService: OfficerService, private http: HttpClient) {}

  reportType: string = '';
  startDate: string = '';
  endDate: string = '';
  isLoading = false;
  errorMessage = '';

  generateReport(): void {
    if (!this.reportType || !this.startDate || !this.endDate) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      type: this.reportType,
      from: this.startDate,
      to: this.endDate
    };

    this.http.post('https://your-api.com/api/officers/generate-report', payload, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.reportType}-report_${this.startDate}_to_${this.endDate}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to generate report. Try again later.';
        this.isLoading = false;
      }
    });
  }
}