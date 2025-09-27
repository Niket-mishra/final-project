import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanApplication } from '../../models/loan-application';
import { LoanOfficer } from '../../models/loan-officer';
import { LoanApplicationService } from '../../services/loan-application-service';
import { OfficerService } from '../../services/officer-service';
import { ToastService } from '../../services/toast-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-officer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-officer.html',
  styleUrls: ['./assign-officer.css']
})
export class AssignOfficerComponent implements OnInit {
  applicationId!: number;
  application: LoanApplication | null = null;
  officers: LoanOfficer[] = [];
  selectedOfficerId: number | null = null;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appService = inject(LoanApplicationService);
  private officerService = inject(OfficerService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.applicationId = Number(this.route.snapshot.paramMap.get('applicationId'));
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.appService.getById(this.applicationId).subscribe({
      next: (app) => {
        this.application = app;

        this.officerService.getAllOfficers().subscribe({
          next: (officers) => {
            this.officers = officers;
            if (officers.length === 0) {
              this.toast.error('No active officers available');
            }
            this.isLoading = false;
          },
          error: () => {
            this.toast.error('Failed to load officers');
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.toast.error('Failed to load application');
        this.isLoading = false;
      }
    });
  }

  assignOfficer(): void {
    if (!this.selectedOfficerId || !this.applicationId) return;

    this.appService.assignOfficer(this.applicationId, this.selectedOfficerId).subscribe({
      next: () => {
        this.toast.success('Officer assigned successfully');
        this.router.navigate(['/applications/details', this.applicationId]);
      },
      error: () => this.toast.error('Failed to assign officer')
    });
  }

  assignRandom(): void {
    const available = this.officers;
    if (available.length === 0) {
      this.toast.error('No officers available for random assignment');
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    this.selectedOfficerId = random.officerId;
    this.assignOfficer();
  }
}