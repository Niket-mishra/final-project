import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanSchemeService } from '../../services/loan-scheme';
import { LoanScheme } from '../../models/loan-scheme';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loan-schemes-customer',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './loan-schemes-customer.html',
  styleUrl: './loan-schemes-customer.css'
})
export class LoanSchemesCustomer implements OnInit {
  isLoading = true;
  errorMessage = '';
  schemes: LoanScheme[] = [];

  constructor(private loanSchemeService: LoanSchemeService, private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSchemes();
  }   

  loadSchemes(): void {
    this.loanSchemeService.getLoanSchemes().subscribe({
    next: (data: LoanScheme[]) => {
      setTimeout(() => {
        this.schemes = data.filter(s => s.isActive); // ✅ assign inside delay
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000); // 1-second delay before reveal
    },
      error: () => {
        this.errorMessage = 'Unable to load loan schemes.';
        this.isLoading = false;
      }
    });
  }
}