import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { Repayment } from '../../models/repayment';
import { RepaymentService } from '../../services/repayment-service';

@Component({
  selector: 'app-officer-repayments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-repayments.html',
  styleUrl: './officer-repayments.css'
})
export class OfficerRepayments implements OnInit {
  isLoading = true;
  errorMessage = '';
  repayments: Repayment[] = [];

  constructor(
    private officerService: RepaymentService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();

    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.officerService.getAllRepayments().subscribe({
      next: (data: Repayment[]) => {
        this.repayments = data;
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load repayments.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  getStatusBadge(status?: string): string {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'danger';
      default: return 'secondary';
    }
  }

  trackRepayment(index: number, item: Repayment): string {
    return item.repaymentId.toString();
  }
}