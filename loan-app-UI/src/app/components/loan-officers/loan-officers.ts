import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanOfficer } from '../../models/loan-officer';
import { OfficerService } from '../../services/officer-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-loan-officers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-officers.html',
  styleUrls: ['./loan-officers.css']
})
export class LoanOfficers implements OnInit {
  officers: LoanOfficer[] = [];
  isLoading = true;

  private officerService = inject(OfficerService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.isLoading = true;
    this.officerService.getAllOfficers().subscribe({
      next: (data) => {
        this.officers = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load loan officers');
        this.isLoading = false;
      }
    });
  }
}