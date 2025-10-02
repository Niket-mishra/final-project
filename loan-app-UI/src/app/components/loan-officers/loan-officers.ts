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
  viewMode: 'grid' | 'list' = 'grid';
  pageSize = 2;
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  ngOnInit() {
    this.loadOfficers();
    setTimeout(() => this.cdr.detectChanges(), 1000);
  }

  loadOfficers(): void {
    this.isLoading = true;
    this.officerService.getAllOfficers().subscribe({
      next: (data) => {
        this.officers = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load loan officers');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredOfficers = this.officers.filter(o => {
      const matchesSearch = o.user.username.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus =
        this.statusFilter === '' ||
        (this.statusFilter === 'active' && o.isActive) ||
        (this.statusFilter === 'inactive' && !o.isActive);
      return matchesSearch && matchesStatus;
    });
    this.totalPages = Math.ceil(this.filteredOfficers.length / this.pageSize);
    this.changePage(1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    this.paginatedOfficers = this.filteredOfficers.slice(start, start + this.pageSize);
  }

  // Navigation to route-based modal
  openCreateModal() {
    this.router.navigate(['/loan-officers/create']);
  }

  openEditModal(officer: LoanOfficer) {
    this.router.navigate(['/loan-officers', officer.officerId, 'edit']);
  }

  confirmMessage = '';
confirmCallback: (() => void) | null = null;

confirmDelete(officerId: number) {
  this.confirmMessage = 'Are you sure you want to delete this officer?';
  this.confirmCallback = () => {
    this.officerService.deactivateOfficer(officerId).subscribe({
      next: () => { 
        this.toast.success('✅ Officer deleted'); 
        this.loadOfficers(); 
      },
      error: () => this.toast.error('❌ Failed to delete officer')
    });
  };

  // Show Bootstrap modal
  const modalEl = document.getElementById('confirmModal');
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

confirmAction() {
  if (this.confirmCallback) {
    this.confirmCallback();
    const modalEl = document.getElementById('confirmModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();
  }
}


  trackByOfficerId(index: number, officer: LoanOfficer) {
    return officer.officerId;
  }
}
