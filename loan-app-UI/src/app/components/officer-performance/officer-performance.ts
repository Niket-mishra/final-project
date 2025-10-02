// officer-performance.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanOfficer } from '../../models/loan-officer';
import { Auth } from '../../services/auth';
import { OfficerService } from '../../services/officer-service';
import { ToastService } from '../../services/toast-service';
import { UserService } from '../../services/user-service';
import { switchMap } from 'rxjs/operators';

interface PerformanceMetrics {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  averageProcessingTime: number;
  satisfactionScore: number;
}

@Component({
  selector: 'app-officer-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-performance.html',
  styleUrl: './officer-performance.css'
})
export class OfficerPerformance implements OnInit {
  officerId!: number;
  officer!: LoanOfficer;
  isLoading = true;
  performanceMetrics!: PerformanceMetrics;

  private officerService = inject(OfficerService);
  private auth = inject(Auth);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UserService);

  ngOnInit(): void {
    const userId = this.auth.getUserId() ?? 0;

    this.userService.getRoleEntityId(userId)
      .pipe(
        switchMap((roleEntity) => {
          this.officerId = roleEntity.roleEntityId;
          return this.officerService.getOfficerById(this.officerId);
        })
      )
      .subscribe({
        next: (officer) => {
          this.officer = officer;
          this.loadPerformanceMetrics();
        },
        error: () => {
          this.toast.error('Failed to load officer data');
          this.isLoading = false;
        }
      });
  }

  loadPerformanceMetrics(): void {
    this.officerService.getOfficerPerformance(this.officerId).subscribe({
      next: (metrics) => {
        this.performanceMetrics = metrics;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Failed to load performance metrics');
        this.isLoading = false;
      }
    });
  }

  getRatingColor(): string {
    const rating = this.officer?.performanceRating ?? 0;
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'info';
    if (rating >= 2.5) return 'warning';
    return 'danger';
  }

  getRatingStars(): number[] {
    const rating = this.officer?.performanceRating ?? 0;
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getWorkloadPercentage(): number {
    if (!this.officer?.maxLoansAssigned) return 0;
    return Math.round((this.officer.currentWorkload / this.officer.maxLoansAssigned) * 100);
  }

  getWorkloadStatus(): string {
    const percentage = this.getWorkloadPercentage();
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'High';
    if (percentage >= 50) return 'Moderate';
    return 'Low';
  }

  getWorkloadColorClass(): string {
    const percentage = this.getWorkloadPercentage();
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'info';
    return 'success';
  }

  getApprovalRate(): number {
    const total = this.performanceMetrics?.approvedApplications + this.performanceMetrics?.rejectedApplications;
    return total > 0 ? Math.round((this.performanceMetrics.approvedApplications / total) * 100) : 0;
  }

  viewAuditLog(): void {
    this.toast.info('Opening audit log...');
    // TODO: Implement navigation to audit log
  }

  sendFeedback(): void {
    this.toast.info('Opening feedback form...');
    // TODO: Implement feedback form
  }

  exportReport(): void {
    this.toast.success('Performance report downloaded');
    // TODO: Implement export functionality
  }
}
