import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanOfficer } from '../../models/loan-officer';

@Component({
  selector: 'app-officer-profile-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-profile-component.html',
  styleUrl: './officer-profile-component.css'
})
export class OfficerProfileComponent implements OnInit {
  officer: LoanOfficer | null = null;
  isLoading = true;
  errorMessage = '';

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
      error: () => this.handleError('Failed to load officer profile.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  getStatusBadge(): string {
    return this.officer?.isActive ? 'success' : 'secondary';
  }
}