import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-officer-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-summary.html',
  styleUrl: './officer-summary.css'
})
export class OfficerSummary implements OnInit {
  constructor(private officerService: OfficerService, private auth: Auth) {}

  isLoading = true;
  errorMessage = '';
  summary = {
    assignedApplications: 0,
    verifiedDocuments: 0,
    handledQueries: 0,
    performanceScore: 0
  };

  ngOnInit(): void {
    const officerId = this.auth.getUserId();
    if (typeof officerId !== 'number') {
      this.errorMessage = 'Officer ID not found.';
      this.isLoading = false;
      return;
    }

    this.officerService.getDashboardData(officerId).subscribe({
      next: (data) => {
        this.summary.assignedApplications = data.applications.length;
        this.summary.verifiedDocuments = data.documents.length;
        this.summary.handledQueries = data.queries.length;
        this.summary.performanceScore = Math.round(
          (data.documents.length + data.queries.length) / (data.applications.length || 1) * 25
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load officer summary.';
        this.isLoading = false;
      }
    });
  }
}