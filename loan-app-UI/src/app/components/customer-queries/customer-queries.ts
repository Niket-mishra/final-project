// src/app/components/customer-queries.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerQuery } from '../../models/customer-query';
import { QueryService } from '../../services/query-service';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-customer-queries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-queries.html',
  styleUrls: ['./customer-queries.css']
})
export class CustomerQueries implements OnInit, OnDestroy {
  customerId!: number;
  queries: CustomerQuery[] = [];
  filteredQueries: CustomerQuery[] = [];
  isLoading = true;
  
  // New query form
  showNewQueryForm = false;
  newQuery = {
    subject: '',
    message: '',
    priority: 'Medium'
  };
  isSubmitting = false;

  // Filters
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  sortBy = 'date-desc';

  // Query details modal
  selectedQuery: CustomerQuery | null = null;
  showDetailsModal = false;
  replyMessage = '';
  isReplying = false;

  private queryService = inject(QueryService);
  private auth = inject(Auth);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.customerId = this.auth.getUserId() ?? 0;
    this.loadQueries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadQueries(): void {
    this.isLoading = true;
    this.queryService.getQueriesByCustomer(this.customerId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (qs) => {
          this.queries = qs;
          this.filterQueries();
        setTimeout(()=>this.cdr.markForCheck(),800);
        },
        error: () => {
          this.toast.error('Failed to load queries');
        }
      });
  }

  filterQueries(): void {
    let filtered = [...this.queries];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.querySubject?.toLowerCase().includes(search) ||
        q.queryDescription?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(q => q.queryStatus === this.statusFilter);
    }

    // Priority filter
    if (this.priorityFilter) {
      filtered = filtered.filter(q => q.priority === this.priorityFilter);
    }

    this.filteredQueries = filtered;
    this.sortQueries();
  }

  sortQueries(): void {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredQueries.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'date-asc':
        this.filteredQueries.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'priority':
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        this.filteredQueries.sort((a, b) => 
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
        );
        break;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.sortBy = 'date-desc';
    this.filterQueries();
  }

  openNewQueryForm(): void {
    this.showNewQueryForm = true;
    this.newQuery = {
      subject: '',
      message: '',
      priority: 'Medium'
    };
  }

  closeNewQueryForm(): void {
    this.showNewQueryForm = false;
    this.newQuery = {
      subject: '',
      message: '',
      priority: 'Medium'
    };
  }

  submitNewQuery(): void {
    if (!this.newQuery.subject.trim() || !this.newQuery.message.trim()) {
      this.toast.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const queryData = {
      customerId: this.customerId,
      subject: this.newQuery.subject,
      message: this.newQuery.message,
      priority: this.newQuery.priority,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    this.queryService.createQuery(queryData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.toast.success('Query submitted successfully!');
          this.closeNewQueryForm();
          this.loadQueries();
        },
        error: () => {
          this.toast.error('Failed to submit query');
        }
      });
  }

  viewQueryDetails(query: CustomerQuery): void {
    this.selectedQuery = query;
    this.showDetailsModal = true;
    this.replyMessage = '';
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedQuery = null;
    this.replyMessage = '';
  }

  submitReply(): void {
    if (!this.replyMessage.trim() || !this.selectedQuery) {
      this.toast.error('Please enter a reply message');
      return;
    }

    this.isReplying = true;

    // Add reply logic here
    setTimeout(() => {
      this.toast.success('Reply sent successfully!');
      this.isReplying = false;
      this.closeDetailsModal();
      this.loadQueries();
    }, 1000);
  }

  getStatusColor(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'open': return 'primary';
      case 'in progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  }

  getPriorityColor(priority?: string): string {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'open': return 'bi-inbox';
      case 'in progress': return 'bi-hourglass-split';
      case 'resolved': return 'bi-check-circle';
      case 'closed': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }

  getOpenQueriesCount(): number {
    return this.queries.filter(q => q.queryStatus?.toLowerCase() === 'open').length;
  }

  getInProgressQueriesCount(): number {
    return this.queries.filter(q => q.queryStatus?.toLowerCase() === 'inprogress').length;
  }

  getResolvedQueriesCount(): number {
    return this.queries.filter(q => q.queryStatus?.toLowerCase() === 'resolved').length;
  }
  getClosedQueriesCount(): number {
    return this.queries.filter(q => q.queryStatus?.toLowerCase() === 'closed').length;
  }
}

