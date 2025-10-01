import { Component, OnInit, inject } from '@angular/core';
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
  isLoading = true;

  searchTerm = '';
  statusFilter = '';

  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  private schemeService = inject(LoanSchemeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.isLoading = true;
    this.schemeService.getLoanSchemes().subscribe({
      next: data => {
        this.schemes = data;
        this.filteredSchemes = [...data];
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('❌ Failed to load loan schemes');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredSchemes = this.schemes.filter(s =>
      s.schemeName.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.statusFilter === '' || 
       (this.statusFilter === 'active' && s.isActive) ||
       (this.statusFilter === 'inactive' && !s.isActive))
    );
  }

  confirmDelete(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this scheme?';
    this.confirmCallback = () => {
      this.schemeService.deleteLoanScheme(id).subscribe({
        next: () => { this.toast.success('✅ Deleted'); this.loadSchemes(); },
        error: () => this.toast.error('❌ Failed to delete')
      });
    };
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }

  confirmToggle(scheme: LoanScheme): void {
    this.confirmMessage = `Change status of "${scheme.schemeName}"?`;
    this.confirmCallback = () => {
      scheme.isActive = !scheme.isActive;
      this.schemeService.updateLoanScheme(scheme).subscribe({
        next: () => this.toast.success('✅ Status updated'),
        error: () => this.toast.error('❌ Failed to update')
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
}
