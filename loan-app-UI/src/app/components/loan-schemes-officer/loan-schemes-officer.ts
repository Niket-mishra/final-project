import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanSchemeService } from '../../services/loan-scheme';
import { LoanScheme } from '../../models/loan-scheme';

@Component({
  selector: 'app-loan-schemes-officer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-schemes-officer.html',
  styleUrl: './loan-schemes-officer.css'
})
export class LoanSchemesOfficer implements OnInit {
  isLoading = true;
  errorMessage = '';
  schemes: LoanScheme[] = [];

  constructor(private loanSchemeService: LoanSchemeService) {}

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.loanSchemeService.getLoanSchemes().subscribe({
      next: (data: LoanScheme[]) => {
        this.schemes = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load loan schemes.';
        this.isLoading = false;
      }
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'secondary';
      case 'Archived': return 'dark';
      default: return 'warning';
    }
  }
}