import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { LoanScheme } from '../../models/loan-scheme';
import { LoanSchemeService } from '../../services/loan-scheme';
import { ModalWrapperComponent } from '../modal-wrapper-component/modal-wrapper-component';

@Component({
  selector: 'app-loan-scheme',
  standalone: true,
  imports: [FormsModule, ModalWrapperComponent],
  templateUrl: './loan-scheme-component.html',
  styleUrls: ['./loan-scheme-component.css']
})
export class LoanSchemeComponent implements OnInit {
  loanSchemes: LoanScheme[] = [];

  newScheme: LoanScheme = this.getEmptyScheme();
  editScheme: LoanScheme = this.getEmptyScheme();
  editingSchemeId: number | null = null;
  schemeToDeleteId: number | null = null;

  isLoading = false;
  isCreating = false;
  isEditing = false;
  isDeleting = false;

  showCreateForm = false;
  showEditModal = false;
  showDeleteModal = false;
  showViewModal = false;

  error = '';
  successMessage = '';
  deleteError = '';
  deleteSuccessMessage = '';

  constructor(private loanSchemeService: LoanSchemeService) {}

  ngOnInit(): void {
    this.fetchLoanSchemes();
  }

  getEmptyScheme(): LoanScheme {
    return {
      schemeId: 0,
      schemeName: '',
      interestRate: 0,
      maxAmount: 0,
      minAmount: 0,
      tenureMonths: 0,
      eligibilityCriteria: '',
      isActive: true,
      createdAt: new Date(),
      createdBy: 1
    };
  }

  fetchLoanSchemes(): void {
    this.isLoading = true;
    this.loanSchemeService.getLoanSchemes().subscribe({
      next: (schemes) => {
        this.loanSchemes = schemes;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load loan schemes.';
        this.isLoading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.newScheme = this.getEmptyScheme();
    this.error = '';
    this.successMessage = '';
  }

  createScheme(): void {
    const s = this.newScheme;
    if (!s.schemeName || s.interestRate <= 0 || s.maxAmount <= 0 || s.tenureMonths <= 0) {
      this.error = 'All fields are required and must be valid.';
      return;
    }
    this.isCreating = true;
    this.loanSchemeService.createLoanScheme(s).subscribe({
      next: (scheme) => {
        this.loanSchemes.push(scheme);
        this.successMessage = 'Loan scheme created successfully.';
        this.showCreateForm = false;
        this.isCreating = false;
      },
      error: () => {
        this.error = 'Failed to create loan scheme.';
        this.isCreating = false;
      }
    });
  }

  openEditModal(scheme: LoanScheme): void {
    this.editingSchemeId = scheme.schemeId;
    this.editScheme = { ...scheme };
    this.showEditModal = true;
    this.error = '';
    this.successMessage = '';
  }

  updateScheme(): void {
    const s = this.editScheme;
    if (!s.schemeName || s.interestRate <= 0 || s.maxAmount <= 0 || s.tenureMonths <= 0) {
      this.error = 'All fields are required and must be valid.';
      return;
    }
    if (this.editingSchemeId === null) return;
    this.loanSchemeService.updateLoanScheme(s).subscribe({
      next: (updated) => {
        const index = this.loanSchemes.findIndex(s => s.schemeId === this.editingSchemeId);
        if (index !== -1) this.loanSchemes[index] = updated;
        this.successMessage = 'Loan scheme updated successfully.';
        this.showEditModal = false;
        this.editingSchemeId = null;
      },
      error: () => {
        this.error = 'Failed to update loan scheme.';
      }
    });
  }

  cancelEdit(): void {
    this.showEditModal = false;
    this.editingSchemeId = null;
  }

  openDeleteModal(id: number): void {
    this.schemeToDeleteId = id;
    this.showDeleteModal = true;
    this.deleteError = '';
    this.deleteSuccessMessage = '';
  }

  deleteScheme(): void {
    if (this.schemeToDeleteId === null) return;
    this.isDeleting = true;
    this.loanSchemeService.deleteLoanScheme(this.schemeToDeleteId).subscribe({
      next: () => {
        this.loanSchemes = this.loanSchemes.filter(s => s.schemeId !== this.schemeToDeleteId);
        this.deleteSuccessMessage = 'Loan scheme deleted successfully.';
        this.showDeleteModal = false;
        this.schemeToDeleteId = null;
        this.isDeleting = false;
      },
      error: () => {
        this.deleteError = 'Failed to delete loan scheme.';
        this.isDeleting = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.schemeToDeleteId = null;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  }

  formatInterestRate(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }

  formatTenure(months: number): string {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) result += `${years > 0 ? ' ' : ''}${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    return result || '0 months';
  }
  getAverageInterest(): string {
  if (this.loanSchemes.length === 0) return '0.00';
  const total = this.loanSchemes.reduce((sum, s) => sum + s.interestRate, 0);
  return (total / this.loanSchemes.length).toFixed(2);
}
getActiveCount(): number {
  return this.loanSchemes.filter(s => s.isActive).length;
}
}