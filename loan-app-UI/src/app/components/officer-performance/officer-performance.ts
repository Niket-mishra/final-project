import { Component, inject, OnInit } from '@angular/core';
import { LoanOfficer } from '../../models/loan-officer';
import { Auth } from '../../services/auth';
import { OfficerService } from '../../services/officer-service';
import { ToastService } from '../../services/toast-service';
import { WorkloadMeterComponent } from '../workload-meter-component/workload-meter-component';

@Component({
  selector: 'app-officer-performance',
  imports: [WorkloadMeterComponent],
  templateUrl: './officer-performance.html',
  styleUrl: './officer-performance.css'
})
export class OfficerPerformance implements OnInit{

  officerId!: number;
  officer!: LoanOfficer;
  isLoading = true;

  private officerService = inject(OfficerService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.officerId = this.auth.getUserId() ?? 0;
    this.loadPerformance();
  }

  loadPerformance(): void {
    this.officerService.getOfficerById(this.officerId).subscribe({
      next: (res) => {
        this.officer = res;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load performance data');
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
}



