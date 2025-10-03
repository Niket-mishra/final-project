// ============================================
// admin-notifications.ts
// ============================================
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  category: 'loan' | 'application' | 'payment' | 'system' | 'user';
}

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.css'
})
export class AdminNotifications implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  paginatedNotifications: Notification[] = [];
  
    private cdr = inject(ChangeDetectorRef)

  // Filters
  searchTerm = '';
  typeFilter = '';
  categoryFilter = '';
  statusFilter = 'all'; // all, read, unread
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  // Selection
  selectedNotifications: Set<number> = new Set();
  selectAll = false;
  
  isLoading = false;
  Math = Math;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.notifications = [
        {
          id: 1,
          type: 'warning',
          title: 'Loan Approaching NPA',
          message: 'Loan #1234 has been overdue for 85 days and is approaching NPA status',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          category: 'loan',
          actionUrl: '/admin/loans/1234'
        },
        {
          id: 2,
          type: 'success',
          title: 'Application Approved',
          message: 'Loan application #5678 has been successfully approved',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          read: false,
          category: 'application',
          actionUrl: '/admin/applications/5678'
        },
        {
          id: 3,
          type: 'info',
          title: 'Payment Received',
          message: 'EMI payment of ₹15,000 received for Loan #9012',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          read: true,
          category: 'payment'
        },
        {
          id: 4,
          type: 'danger',
          title: 'System Alert',
          message: 'Database backup failed. Immediate attention required',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false,
          category: 'system'
        },
        {
          id: 5,
          type: 'info',
          title: 'New User Registration',
          message: 'New customer registered: John Doe',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          read: true,
          category: 'user'
        }
      ];
      
      this.applyFilters();
      this.isLoading = false;
      this.cdr.markForCheck();
    }, 500);
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    // Search
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (this.typeFilter) {
      filtered = filtered.filter(n => n.type === this.typeFilter);
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(n => n.category === this.categoryFilter);
    }

    // Status filter
    if (this.statusFilter === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (this.statusFilter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    this.filteredNotifications = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedNotifications = this.filteredNotifications.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.categoryFilter = '';
    this.statusFilter = 'all';
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

  // Selection
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedNotifications.forEach(n => this.selectedNotifications.add(n.id));
    } else {
      this.selectedNotifications.clear();
    }
  }

  toggleSelect(id: number): void {
    if (this.selectedNotifications.has(id)) {
      this.selectedNotifications.delete(id);
    } else {
      this.selectedNotifications.add(id);
    }
    this.selectAll = this.selectedNotifications.size === this.paginatedNotifications.length;
  }

  isSelected(id: number): boolean {
    return this.selectedNotifications.has(id);
  }

  // Actions
  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.applyFilters();
    }
  }

  markAsUnread(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = false;
      this.applyFilters();
    }
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.applyFilters();
  }

  bulkMarkAsRead(): void {
    this.selectedNotifications.forEach(id => {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) notification.read = true;
    });
    this.selectedNotifications.clear();
    this.selectAll = false;
    this.applyFilters();
  }

  bulkDelete(): void {
    if (confirm(`Delete ${this.selectedNotifications.size} notifications?`)) {
      this.notifications = this.notifications.filter(n => !this.selectedNotifications.has(n.id));
      this.selectedNotifications.clear();
      this.selectAll = false;
      this.applyFilters();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.applyFilters();
  }

  // Utilities
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getTypeCount(type: string): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'danger': return 'bi-x-circle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'loan': return 'bi-cash-coin';
      case 'application': return 'bi-file-text';
      case 'payment': return 'bi-credit-card';
      case 'system': return 'bi-gear';
      case 'user': return 'bi-person';
      default: return 'bi-bell';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}


