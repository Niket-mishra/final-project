import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth'; // assuming this provides officer ID

@Component({
  selector: 'app-workload-meter-officer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workload-meter-officer.html',
  styleUrl: './workload-meter-officer.css'
})
export class WorkloadMeterOfficer implements OnInit {
  private officerService = inject(OfficerService);
  private auth = inject(Auth);

  isLoading = true;
  assignedApplications = 0;
  verifiedDocuments = 0;
  handledQueries = 0;

  ngOnInit(): void {
    const officerId = this.auth.getUserId() ?? 0;

    this.officerService.getDashboardData(officerId).subscribe({
      next: (data) => {
        this.assignedApplications = data.applications.length;
        this.verifiedDocuments = data.documents.length;
        this.handledQueries = data.queries.length;
        this.isLoading = false;
      },
      error: () => {
        console.error('Failed to load workload data');
        this.isLoading = false;
      }
    });
  }
}