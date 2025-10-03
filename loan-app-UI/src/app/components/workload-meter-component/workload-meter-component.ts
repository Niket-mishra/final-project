// ============================================
// workload-meter-component.ts
// ============================================
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanOfficer } from '../../models/loan-officer';
import { OfficerService } from '../../services/officer-service';

@Component({
  selector: 'app-workload-meter-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workload-meter-component.html',
  styleUrl: './workload-meter-component.css'
})
export class WorkloadMeterComponent implements OnInit {
  officers: LoanOfficer[] = [];
  filteredOfficers: LoanOfficer[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  cityFilter = '';
  workloadFilter = '';
  sortBy = 'workload-desc';

  private officerService = inject(OfficerService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.isLoading = true;
    this.officerService.getAllOfficers().subscribe({
      next: (data) => {
        this.officers = data;
        this.applyFilters();
        this.isLoading = false;
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 800);
      },
      error: (err) => {
        console.error('Failed to load officers', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.officers];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.designation.toLowerCase().includes(search) ||
        o.city.toLowerCase().includes(search)
      );
    }

    // City filter
    if (this.cityFilter) {
      filtered = filtered.filter(o => o.city === this.cityFilter);
    }

    // Workload filter
    if (this.workloadFilter === 'overloaded') {
      filtered = filtered.filter(o => this.getWorkloadPercentage(o) >= 80);
    } else if (this.workloadFilter === 'moderate') {
      filtered = filtered.filter(o => {
        const pct = this.getWorkloadPercentage(o);
        return pct >= 50 && pct < 80;
      });
    } else if (this.workloadFilter === 'available') {
      filtered = filtered.filter(o => this.getWorkloadPercentage(o) < 50);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'workload-desc':
          return this.getWorkloadPercentage(b) - this.getWorkloadPercentage(a);
        case 'workload-asc':
          return this.getWorkloadPercentage(a) - this.getWorkloadPercentage(b);
        case 'name':
          return a.designation.localeCompare(b.designation);
        case 'city':
          return a.city.localeCompare(b.city);
        default:
          return 0;
      }
    });

    this.filteredOfficers = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.cityFilter = '';
    this.workloadFilter = '';
    this.sortBy = 'workload-desc';
    this.applyFilters();
  }

  getWorkloadPercentage(officer: LoanOfficer): number {
    if (!officer || officer.maxLoansAssigned === 0) return 0;
    return Math.round((officer.currentWorkload / officer.maxLoansAssigned) * 100);
  }

  getMeterColor(officer: LoanOfficer): string {
    const pct = this.getWorkloadPercentage(officer);
    if (pct < 50) return 'success';
    if (pct < 80) return 'warning';
    return 'danger';
  }

  // Statistics
  getUniqueCities(): string[] {
    return [...new Set(this.officers.map(o => o.city))];
  }

  getAverageWorkload(): number {
    if (this.officers.length === 0) return 0;
    const total = this.officers.reduce((sum, o) => sum + this.getWorkloadPercentage(o), 0);
    return Math.round(total / this.officers.length);
  }

  getOverloadedCount(): number {
    return this.officers.filter(o => this.getWorkloadPercentage(o) >= 80).length;
  }

  getAvailableCount(): number {
    return this.officers.filter(o => this.getWorkloadPercentage(o) < 50).length;
  }

  getTotalLoansAssigned(): number {
    return this.officers.reduce((sum, o) => sum + o.currentWorkload, 0);
  }
}
