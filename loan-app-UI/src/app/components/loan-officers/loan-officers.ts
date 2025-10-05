// ============================================
// loan-officers.ts
// ============================================
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoanOfficer } from '../../models/loan-officer';
import { OfficerService } from '../../services/officer-service';
import { ToastService } from '../../services/toast-service';

declare var bootstrap: any;

@Component({
  selector: 'app-loan-officers',
  templateUrl: './loan-officers.html',
  styleUrls: ['./loan-officers.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoanOfficers implements OnInit {
  
  private officerService = inject(OfficerService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  officers: LoanOfficer[] = [];
  filteredOfficers: LoanOfficer[] = [];
  paginatedOfficers: LoanOfficer[] = [];

  searchTerm = '';
  statusFilter = '';
  cityFilter = '';
  sortBy = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  isLoading = false;

  // Bulk selection
  selectedOfficers: Set<number> = new Set();
  selectAll = false;

  // Confirmation
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  Math = Math;

  ngOnInit() {
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.isLoading = true;
    this.officerService.getAllOfficers().subscribe({
      next: (data) => {
        this.officers = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to load loan officers');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = this.officers.filter(o => {
      const matchesSearch = o.user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           o.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           o.city.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === '' ||
                           (this.statusFilter === 'active' && o.isActive) ||
                           (this.statusFilter === 'inactive' && !o.isActive);
      const matchesCity = this.cityFilter === '' || o.city === this.cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.user.username.localeCompare(b.user.username);
        case 'city':
          return a.city.localeCompare(b.city);
        case 'workload':
          return this.getWorkloadPercentage(b) - this.getWorkloadPercentage(a);
        case 'performance':
          return (b.performanceRating || 0) - (a.performanceRating || 0);
        default:
          return 0;
      }
    });

    this.filteredOfficers = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedOfficers = this.filteredOfficers.slice(start, start + this.itemsPerPage);
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.cityFilter = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    this.changePage(this.currentPage + 1);
  }

  previousPage() {
    this.changePage(this.currentPage - 1);
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

  // Bulk selection
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedOfficers.forEach(o => this.selectedOfficers.add(o.officerId));
    } else {
      this.selectedOfficers.clear();
    }
  }

  toggleSelect(id: number): void {
    if (this.selectedOfficers.has(id)) {
      this.selectedOfficers.delete(id);
    } else {
      this.selectedOfficers.add(id);
    }
    this.selectAll = this.selectedOfficers.size === this.paginatedOfficers.length;
  }

  isSelected(id: number): boolean {
    return this.selectedOfficers.has(id);
  }

  // Utilities
  getWorkloadPercentage(officer: LoanOfficer): number {
    if (officer.maxLoansAssigned === 0) return 0;
    return Math.round((officer.currentWorkload / officer.maxLoansAssigned) * 100);
  }

  getWorkloadColor(officer: LoanOfficer): string {
    const pct = this.getWorkloadPercentage(officer);
    if (pct < 50) return 'success';
    if (pct < 80) return 'warning';
    return 'danger';
  }

  getUniqueCities(): string[] {
    return [...new Set(this.officers.map(o => o.city))];
  }

  getActiveCount(): number {
    return this.officers.filter(o => o.isActive).length;
  }

  getInactiveCount(): number {
    return this.officers.filter(o => !o.isActive).length;
  }

  getAverageWorkload(): number {
    if (this.officers.length === 0) return 0;
    const total = this.officers.reduce((sum, o) => sum + this.getWorkloadPercentage(o), 0);
    return Math.round(total / this.officers.length);
  }

  // Actions
  confirmDelete(officerId: number) {
    this.confirmMessage = 'Are you sure you want to delete this officer?';
    this.confirmCallback = () => {
      this.officerService.deactivateOfficer(officerId).subscribe({
        next: () => { 
          this.toast.success('Officer deleted successfully'); 
          this.loadOfficers(); 
        },
        error: () => this.toast.error('Failed to delete officer')
      });
    };
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }

  confirmAction() {
    if (this.confirmCallback) {
      this.confirmCallback();
      bootstrap.Modal.getInstance(document.getElementById('confirmModal'))?.hide();
    }
  }

  trackByOfficerId(index: number, officer: LoanOfficer) {
    return officer.officerId;
  }

  exportToCSV(): void {
    const data = this.filteredOfficers.map(o => ({
      'Officer ID': o.officerId,
      'Username': o.user.username,
      'Designation': o.designation,
      'City': o.city,
      'Specialization': o.specialization,
      'Current Workload': o.currentWorkload,
      'Max Loans': o.maxLoansAssigned,
      'Performance': o.performanceRating || 'N/A',
      'Status': o.isActive ? 'Active' : 'Inactive'
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `officers-${new Date().toISOString().split('T')[0]}.csv`;
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




