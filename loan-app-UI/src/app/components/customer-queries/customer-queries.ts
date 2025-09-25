import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerQuery } from '../../models/customer-query';
import { QueryService } from '../../services/query-service';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-customer-queries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-queries.html',
  styleUrls: ['./customer-queries.css']
})
export class CustomerQueries implements OnInit {
  customerId!: number;
  queries: CustomerQuery[] = [];
  isLoading = true;

  private queryService = inject(QueryService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.customerId = this.auth.getUserId() ?? 0;
    this.loadQueries();
  }

  loadQueries(): void {
    this.isLoading = true;
    this.queryService.getQueriesByCustomer(this.customerId).subscribe({
      next: (qs) => {
        this.queries = qs;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load queries');
        this.isLoading = false;
      }
    });
  }
}