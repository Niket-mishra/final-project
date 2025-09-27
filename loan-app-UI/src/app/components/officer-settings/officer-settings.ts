import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanOfficer } from '../../models/loan-officer';

@Component({
  selector: 'app-officer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-settings.html',
  styleUrl: './officer-settings.css'
})
export class OfficerSettings implements OnInit {
  officer: LoanOfficer | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(private officerService: OfficerService, private auth: Auth) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();

    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.officerService.getOfficerById(officerId).subscribe({
      next: (data: LoanOfficer) => {
        this.officer = data;
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load officer settings.')
    });
  }

  updateSettings(): void {
    if (!this.officer) return;

    this.officerService.updateOfficer(this.officer.officerId, this.officer).subscribe({
      next: () => {
        this.successMessage = 'Settings updated successfully.';
        this.errorMessage = '';
      },
      error: () => this.handleError('Failed to update settings.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.isLoading = false;
  }
}