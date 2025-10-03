// ============================================
// npa-monitoring.ts
// ============================================
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NPA } from '../../models/npa';
import { NpaService } from '../../services/npa-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-npa-monitoring',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './npa-monitoring.html',
  styleUrl: './npa-monitoring.css'
})
export class NpaMonitoring implements OnInit {
  npas: NPA[] = [];
  filteredNpas: NPA[] = [];
  paginatedNpas: NPA[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  statusFilter = '';
  sortBy = 'date-desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Bulk Selection
  selectedNpas: Set<number> = new Set();
  selectAll = false;

  private npaService = inject(NpaService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef)

  Math = Math;

  ngOnInit(): void {
    this.loadNPAs();
  }

  loadNPAs(): void {
    this.isLoading = true;
    this.npaService.getAllNPAs().subscribe({
      next: (res) => {
        this.npas = res;
        this.applyFilters();
        this.isLoading = false;
        setTimeout(()=> this.cdr.markForCheck(), 800)
      },
      error: () => {
        this.toast.error('Failed to load NPA data');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.npas];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(npa => 
        npa.loanId.toString().includes(search) ||
        npa.overdueAmount.toString().includes(search)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(npa => npa.npaStatus === this.statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.npaDate).getTime() - new Date(a.npaDate).getTime();
        case 'date-asc':
          return new Date(a.npaDate).getTime() - new Date(b.npaDate).getTime();
        case 'amount-desc':
          return b.overdueAmount - a.overdueAmount;
        case 'amount-asc':
          return a.overdueAmount - b.overdueAmount;
        case 'days-desc':
          return b.daysOverdue - a.daysOverdue;
        case 'days-asc':
          return a.daysOverdue - b.daysOverdue;
        default:
          return 0;
      }
    });

    this.filteredNpas = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNpas.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedNpas = this.filteredNpas.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'date-desc';
    this.applyFilters();
  }

  // Pagination
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
      this.paginatedNpas.forEach(npa => this.selectedNpas.add(npa.npaId));
    } else {
      this.selectedNpas.clear();
    }
  }

  toggleSelectNpa(npaId: number): void {
    if (this.selectedNpas.has(npaId)) {
      this.selectedNpas.delete(npaId);
    } else {
      this.selectedNpas.add(npaId);
    }
    this.selectAll = this.selectedNpas.size === this.paginatedNpas.length;
  }

  isNpaSelected(npaId: number): boolean {
    return this.selectedNpas.has(npaId);
  }

  // Statistics
  getTotalOverdue(): number {
    return this.npas.reduce((sum, npa) => sum + npa.overdueAmount, 0);
  }

  getStatusCount(status: string): number {
    return this.npas.filter(npa => npa.npaStatus === status).length;
  }

  getAverageDaysOverdue(): number {
    if (this.npas.length === 0) return 0;
    const sum = this.npas.reduce((acc, npa) => acc + npa.daysOverdue, 0);
    return Math.round(sum / this.npas.length);
  }

  // Status utilities
  getStatusColor(status: string): string {
    switch (status) {
      case 'Standard': return 'success';
      case 'Substandard': return 'warning';
      case 'Doubtful': return 'danger';
      case 'Loss': return 'dark';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Standard': return 'bi-check-circle-fill';
      case 'Substandard': return 'bi-exclamation-triangle-fill';
      case 'Doubtful': return 'bi-x-octagon-fill';
      case 'Loss': return 'bi-x-circle-fill';
      default: return 'bi-circle-fill';
    }
  }

  getSeverityClass(daysOverdue: number): string {
    if (daysOverdue >= 180) return 'severity-critical';
    if (daysOverdue >= 90) return 'severity-high';
    if (daysOverdue >= 30) return 'severity-medium';
    return 'severity-low';
  }

  // Export
  exportToCSV(): void {
    const data = this.filteredNpas.map(npa => ({
      'NPA ID': npa.npaId,
      'Loan ID': npa.loanId,
      'Days Overdue': npa.daysOverdue,
      'Overdue Amount': npa.overdueAmount,
      'NPA Date': npa.npaDate,
      'Status': npa.npaStatus
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `npa-report-${new Date().toISOString().split('T')[0]}.csv`;
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
