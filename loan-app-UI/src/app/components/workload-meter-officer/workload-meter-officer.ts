// workload-meter-officer.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';
import { switchMap } from 'rxjs';

interface WorkloadStats {
  assignedApplications: number;
  verifiedDocuments: number;
  handledQueries: number;
  pendingReviews?: number;
  completionRate?: number;
}

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
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  stats: WorkloadStats = {
    assignedApplications: 0,
    verifiedDocuments: 0,
    handledQueries: 0,
    pendingReviews: 0,
    completionRate: 0
  };

  // Targets for progress calculation
  readonly targets = {
    applications: 50,
    documents: 100,
    queries: 30
  };

  ngOnInit(): void {
    const userId = this.auth.getUserId() ?? 0;

    this.userService.getRoleEntityId(userId).subscribe({
      next: (roleEntity) => {
        const officerId = roleEntity.roleEntityId;
        this.officerService.getDashboardData(officerId).subscribe({
          next: (data) => {
            this.stats = {
              assignedApplications: data.applications.length,
              verifiedDocuments: data.documents.length,
              handledQueries: data.queries.length,
              pendingReviews: data.applications.filter((app: any) => app.status === 'Pending').length,
              completionRate: this.calculateCompletionRate(data)
            };
            this.isLoading = false;
            setTimeout(() => this.cdr.detectChanges(), 1000);
          },
          error: () => {
            console.error('Failed to load workload data');
            this.isLoading = false;
          }
        });
      },
      error: () => {
        console.error('Failed to get officer role entity');
        this.isLoading = false;
      }
    });
    setTimeout(() => this.cdr.detectChanges(), 1000);
  }


  private calculateCompletionRate(data: any): number {
    const total = data.applications.length + data.documents.length + data.queries.length;
    const completed = (data.completedApplications?.length ?? 0) + 
                     (data.verifiedDocuments?.length ?? 0) + 
                     (data.resolvedQueries?.length ?? 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getProgressPercentage(value: number, target: number): number {
    return Math.min(Math.round((value / target) * 100), 100);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return 'danger';
    if (percentage >= 60) return 'warning';
    return 'success';
  }

  getWorkloadStatus(): string {
    const totalPercentage = 
      (this.getProgressPercentage(this.stats.assignedApplications, this.targets.applications) +
       this.getProgressPercentage(this.stats.verifiedDocuments, this.targets.documents) +
       this.getProgressPercentage(this.stats.handledQueries, this.targets.queries)) / 3;

    if (totalPercentage >= 80) return 'High';
    if (totalPercentage >= 50) return 'Moderate';
    return 'Light';
  }

  getStatusBadgeClass(): string {
    const status = this.getWorkloadStatus();
    switch(status) {
      case 'High': return 'badge-danger';
      case 'Moderate': return 'badge-warning';
      default: return 'badge-success';
    }
  }
}

