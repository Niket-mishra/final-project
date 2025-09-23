import { Component, Input } from '@angular/core';
import { LoanOfficer } from '../../models/loan-officer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workload-meter-component',
  imports: [CommonModule],
  templateUrl: './workload-meter-component.html',
  styleUrl: './workload-meter-component.css'
})
export class WorkloadMeterComponent {
 @Input() officer!: LoanOfficer;

  get workloadPercentage(): number {
    if (!this.officer) return 0;
    return Math.round((this.officer.currentWorkload / this.officer.maxLoansAssigned) * 100);
  }

  getMeterColor(): string {
    const pct = this.workloadPercentage;
    if (pct < 50) return 'success';
    if (pct < 80) return 'warning';
    return 'danger';
  }
}


