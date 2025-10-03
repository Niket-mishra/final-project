// ============================================
// audit-logs.ts
// ============================================
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanApplicationService } from '../../services/loan-application-service';

interface AuditEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
  remarks?: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrls: ['./audit-logs.css']
})
export class AuditLogs implements OnInit {
  @Input() applicationId!: number;

  auditEntries: AuditEntry[] = [];
  filteredEntries: AuditEntry[] = [];
  paginatedEntries: AuditEntry[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  actionFilter = '';
  dateFilter = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  private applicationService = inject(LoanApplicationService);
  Math = Math;

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadAuditLogs();
    } else {
      console.warn('AuditLogs: applicationId not provided');
      this.isLoading = false;
    }
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.applicationService.getAuditLog(this.applicationId).subscribe({
      next: (logs) => {
        this.auditEntries = logs;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        console.error('Failed to load audit logs');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.auditEntries];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(search) ||
        entry.performedBy.toLowerCase().includes(search) ||
        entry.remarks?.toLowerCase().includes(search)
      );
    }

    // Action filter
    if (this.actionFilter) {
      filtered = filtered.filter(entry => entry.action === this.actionFilter);
    }

    // Date filter
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    this.filteredEntries = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEntries.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.actionFilter = '';
    this.dateFilter = '';
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

  // Utilities
  getUniqueActions(): string[] {
    return [...new Set(this.auditEntries.map(e => e.action))];
  }

  getActionIcon(action: string): string {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create')) return 'bi-plus-circle';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return 'bi-pencil';
    if (lowerAction.includes('delete')) return 'bi-trash';
    if (lowerAction.includes('approve')) return 'bi-check-circle';
    if (lowerAction.includes('reject')) return 'bi-x-circle';
    if (lowerAction.includes('view') || lowerAction.includes('access')) return 'bi-eye';
    if (lowerAction.includes('export')) return 'bi-download';
    return 'bi-activity';
  }

  getActionColor(action: string): string {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create')) return 'success';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return 'primary';
    if (lowerAction.includes('delete')) return 'danger';
    if (lowerAction.includes('approve')) return 'success';
    if (lowerAction.includes('reject')) return 'danger';
    if (lowerAction.includes('view')) return 'info';
    return 'secondary';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Export
  exportToCSV(): void {
    const data = this.filteredEntries.map(entry => ({
      'Timestamp': entry.timestamp,
      'Action': entry.action,
      'Performed By': entry.performedBy,
      'Remarks': entry.remarks || 'N/A'
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-app-${this.applicationId}-${new Date().toISOString().split('T')[0]}.csv`;
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

  get uniquePerformersCount(): number {
  return new Set(this.auditEntries.map(e => e.performedBy)).size;
}
}


