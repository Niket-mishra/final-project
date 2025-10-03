import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanScheme } from '../../models/loan-scheme';
import { LoanSchemeService } from '../../services/loan-scheme';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-loan-schemes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './loan-schemes.html',
  styleUrls: ['./loan-schemes.css']
})
export class LoanSchemes implements OnInit {
  schemes: LoanScheme[] = [];
  filteredSchemes: LoanScheme[] = [];
  paginatedSchemes: LoanScheme[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  statusFilter = '';
  sortBy = 'name';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  // Bulk Selection
  selectedSchemes: Set<number> = new Set();
  selectAll = false;

  // Confirmation
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  private schemeService = inject(LoanSchemeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef)

  Math = Math;

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.isLoading = true;
    this.schemeService.getLoanSchemes().subscribe({
      next: data => {
        this.schemes = data;
        this.applyFilters();
        this.isLoading = false;
        setTimeout(()=> this.cdr.markForCheck(), 800)
      },
      error: () => {
        this.toast.error('Failed to load loan schemes');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = this.schemes.filter(s =>
      s.schemeName.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.statusFilter === '' || 
       (this.statusFilter === 'active' && s.isActive) ||
       (this.statusFilter === 'inactive' && !s.isActive))
    );

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.schemeName.localeCompare(b.schemeName);
        case 'rate':
          return a.interestRate - b.interestRate;
        case 'tenure':
          return a.tenureMonths - b.tenureMonths;
        default:
          return 0;
      }
    });

    this.filteredSchemes = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSchemes.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSchemes = this.filteredSchemes.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  // Bulk Selection
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedSchemes.forEach(scheme => 
        this.selectedSchemes.add(scheme.schemeId)
      );
    } else {
      this.selectedSchemes.clear();
    }
  }

  toggleSelectScheme(schemeId: number): void {
    if (this.selectedSchemes.has(schemeId)) {
      this.selectedSchemes.delete(schemeId);
    } else {
      this.selectedSchemes.add(schemeId);
    }
    this.selectAll = this.selectedSchemes.size === this.paginatedSchemes.length;
  }

  isSchemeSelected(schemeId: number): boolean {
    return this.selectedSchemes.has(schemeId);
  }

  bulkActivate(): void {
    if (this.selectedSchemes.size === 0) {
      this.toast.error('Please select at least one scheme');
      return;
    }
    this.confirmMessage = `Activate ${this.selectedSchemes.size} selected schemes?`;
    this.confirmCallback = () => {
      const updates = Array.from(this.selectedSchemes).map(id => {
        const scheme = this.schemes.find(s => s.schemeId === id);
        if (scheme) {
          scheme.isActive = true;
          return this.schemeService.updateLoanScheme(scheme);
        }
        return null;
      }).filter(obs => obs !== null);

      if (updates.length > 0) {
        this.toast.success('Schemes activated successfully');
        this.loadSchemes();
        this.selectedSchemes.clear();
      }
    };
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }

  bulkDeactivate(): void {
    if (this.selectedSchemes.size === 0) {
      this.toast.error('Please select at least one scheme');
      return;
    }
    this.confirmMessage = `Deactivate ${this.selectedSchemes.size} selected schemes?`;
    this.confirmCallback = () => {
      const updates = Array.from(this.selectedSchemes).map(id => {
        const scheme = this.schemes.find(s => s.schemeId === id);
        if (scheme) {
          scheme.isActive = false;
          return this.schemeService.updateLoanScheme(scheme);
        }
        return null;
      }).filter(obs => obs !== null);

      if (updates.length > 0) {
        this.toast.success('Schemes deactivated successfully');
        this.loadSchemes();
        this.selectedSchemes.clear();
      }
    };
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }

  // Statistics
  getActiveCount(): number {
    return this.schemes.filter(s => s.isActive).length;
  }

  getInactiveCount(): number {
    return this.schemes.filter(s => !s.isActive).length;
  }

  getAverageRate(): number {
    if (this.schemes.length === 0) return 0;
    const sum = this.schemes.reduce((acc, s) => acc + s.interestRate, 0);
    return Math.round((sum / this.schemes.length) * 10) / 10;
  }

  // Confirmation actions
  confirmDelete(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this scheme?';
    this.confirmCallback = () => {
      this.schemeService.deleteLoanScheme(id).subscribe({
        next: () => { 
          this.toast.success('Scheme deleted successfully'); 
          this.loadSchemes(); 
        },
        error: () => this.toast.error('Failed to delete scheme')
      });
    };
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }

  confirmToggle(scheme: LoanScheme): void {
    this.confirmMessage = `Change status of "${scheme.schemeName}"?`;
    this.confirmCallback = () => {
      scheme.isActive = !scheme.isActive;
      this.schemeService.updateLoanScheme(scheme).subscribe({
        next: () => {
          this.toast.success('Status updated successfully');
          this.loadSchemes();
        },
        error: () => this.toast.error('Failed to update status')
      });
    };
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }

  confirmAction(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
      bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
    }
  }

  // Export
  exportToCSV(): void {
    const data = this.filteredSchemes.map(scheme => ({
      'Scheme ID': scheme.schemeId,
      'Scheme Name': scheme.schemeName,
      'Interest Rate': scheme.interestRate,
      'Min Amount': scheme.minAmount,
      'Max Amount': scheme.maxAmount,
      'Tenure (Months)': scheme.tenureMonths,
      'Status': scheme.isActive ? 'Active' : 'Inactive',
      'Eligibility': scheme.eligibilityCriteria
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan-schemes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    );
    return [headers, ...rows].join('\n');
  }
}
