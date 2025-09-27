import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanSchemeService } from '../../services/loan-scheme';
import { LoanScheme } from '../../models/loan-scheme';

@Component({
  selector: 'app-loan-schemes-customer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-schemes-customer.html',
  styleUrl: './loan-schemes-customer.css'
})
export class LoanSchemesCustomer implements OnInit {
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
        this.schemes = data.filter(s => s.isActive); // Only show active schemes to customers
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load loan schemes.';
        this.isLoading = false;
      }
    });
  }
}