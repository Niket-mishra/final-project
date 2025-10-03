// ============================================
// loan-details.component.ts
// ============================================
import { Component, OnInit, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Loan } from '../../models/loan';
import { LoanService } from '../../services/loan-service';
import { ToastService } from '../../services/toast-service';

declare var bootstrap: any;

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loan-details.html',
  styleUrls: ['./loan-details.css']
})
export class LoanDetails implements OnInit {
  @ViewChild('loanModal', { static: true }) modalElement!: ElementRef;
  
  loan?: Loan;
  isLoading = true;
  modalInstance: any;
  
  private loanService = inject(LoanService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.loadLoanDetails(id);
      this.openModal();
    } else {
      this.toast.error('No loan ID provided');
      this.isLoading = false;
      this.navigateBack();
    }
  }

  loadLoanDetails(applicationId: number): void {
    this.isLoading = true;
    this.loanService.getLoanById(applicationId).subscribe({
      next: (loan) => {
        this.loan = loan;
        this.isLoading = false;
       setTimeout(() => {
        this.cdr.markForCheck();
       }, 1000);
      },
      error: () => {
        this.toast.error('Failed to load loan details');
        this.isLoading = false;
      }
    });
  }

  openModal(): void {
    this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalInstance.show();

    // Navigate back when modal is closed
    this.modalElement.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.navigateBack();
    });
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  navigateBack(): void {
    this.router.navigate(['/admin/loan-list'], { relativeTo: this.route });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Active': 'bg-success',
      'Completed': 'bg-warning',
      'Closed': 'bg-secondary',
      'NPA': 'bg-danger',
    };
    return statusMap[status?.toUpperCase()] || 'bg-info';
  }

  getProgressPercentage(): number {
    if (!this.loan) return 0;
    return (this.loan.paidEmiCount / this.loan.totalEmiCount) * 100;
  }
}

