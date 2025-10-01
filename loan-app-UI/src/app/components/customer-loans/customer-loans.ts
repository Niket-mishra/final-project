import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan-service';
import { LoanApplication } from '../../models/loan-application';
import { Loan } from '../../models/loan';
import { Auth } from '../../services/auth';
import { CustomerService } from '../../services/customer-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-customer-loans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-loans.html',
  styleUrl: './customer-loans.css'
})
export class CustomerLoans implements OnInit {
  loans: Loan[] = [];
  isLoading = true;
  errorMessage = '';

  private loanService = inject(LoanService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(Auth);
  private userService = inject(UserService);
  private customerId!: number;
  private customerService = inject(CustomerService);

  ngOnInit(): void {
  const userId = this.auth.getUserId();

  if (userId === null) {
    this.errorMessage = 'User not authenticated.';
    this.isLoading = false;
    return;
  }

  this.userService.getRoleEntityId(userId).subscribe({
    next: ({ roleEntityId }) => {
      console.debug('Resolved customerId:', roleEntityId);
      this.customerId = roleEntityId;

      this.customerService.getCustomerById(this.customerId).subscribe({
        next: (data) => {
          console.debug('Customer data:', data);
          data.loanApplications?.forEach(loanApp => {
            if (loanApp.loan) {
              this.loans.push(loanApp.loan);
            } else {
              console.warn('Loan data missing for application:', loanApp);
            }
          });
          setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
        },
        error: (err) => {
          console.error('Error fetching customer', err);
          this.isLoading = false;
        }
      });
    },
    error: (err) => {
      console.error('Error resolving role entity ID', err);
      this.isLoading = false;
    }
  });
}

  // fetchLoans(): void {
  //   this.loanService.getLoanById().subscribe({
  //     next: (data) => {
  //       this.loans = data;
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       this.errorMessage = 'Unable to load your loan applications.';
  //       this.isLoading = false;
  //     }
  //   });
  // }
}