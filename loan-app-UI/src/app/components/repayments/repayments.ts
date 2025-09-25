import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Repayment } from '../../models/repayment';
import { RepaymentService } from '../../services/repayment-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-repayments',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './repayments.html',
  styleUrls: ['./repayments.css']
})
export class Repayments implements OnInit {
  repayments: Repayment[] = [];
  isLoading = true;

  private repaymentService = inject(RepaymentService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadRepayments();
  }

  loadRepayments(): void {
    this.repaymentService.getAllRepayments().subscribe({
      next: (data) => {
        this.repayments = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load repayments');
        this.isLoading = false;
      }
    });
  }
}