import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoanApplication } from '../../models/loan-application';
import { LoanApplicationService } from '../../services/loan-application-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-application-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './application-details.html',
  styleUrls: ['./application-details.css']
})
export class ApplicationDetails implements OnInit {
  @Input() applicationId!: number;

  application?: LoanApplication;
  isLoading = true;

  private applicationService = inject(LoanApplicationService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadDetails();
    } else {
      this.toast.error('No application ID provided');
      this.isLoading = false;
    }
  }

  loadDetails(): void {
    this.isLoading = true;
    this.applicationService.getById(this.applicationId).subscribe({
      next: (app) => {
        this.application = app;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load application details');
        this.isLoading = false;
      }
    });
  }
}