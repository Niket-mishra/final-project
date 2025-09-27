import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoanApplicationService } from '../../services/loan-application-service';
import { ApplicationSummary } from '../../models/application-summary';
import { CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-customer-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-summary.html',
  styleUrl: './customer-summary.css'
})
export class CustomerSummary implements OnInit {
  isLoading = true;
  errorMessage = '';
  summary?: ApplicationSummary;
  customerId?: number;
  customerName = ''; 

  constructor(
    private route: ActivatedRoute,
    private loanApplicationService: LoanApplicationService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('customerId'));
      if (id) {
        this.customerId = id;
        this.fetchSummary(id);
      } else {
        this.errorMessage = 'Customer ID not found in route.';
        this.isLoading = false;
      }
    });
  }

  fetchSummary(id: number): void {
    this.loanApplicationService.getApplicationSummary(id).subscribe({
      next: (data: ApplicationSummary) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load customer summary.';
        this.isLoading = false;
      }
    });
    this.customerService.getCustomerById(id).subscribe({
      next: (data) => {
        if (this.summary) {
          this.customerName = `${data.firstName} ${data.lastName}`;
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load customer details.';
        this.isLoading = false;
      }
    });
  }
}