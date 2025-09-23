import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoanSchemeService } from '../../services/loan-scheme';
import { LoanApplicationService } from '../../services/loan-application-service';
import { Auth } from '../../services/auth';
import { LoanScheme } from '../../models/loan-scheme';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-loan-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loan-application-form-component.html',
  styleUrls: ['./loan-application-form-component.css']
})
export class LoanApplicationFormComponent implements OnInit {
  loanForm!: FormGroup;
  schemes: LoanScheme[] = [];
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private schemeService = inject(LoanSchemeService);
  private applicationService = inject(LoanApplicationService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.loadSchemes();
  }

  initForm(): void {
    this.loanForm = this.fb.group({
      schemeId: [null, Validators.required],
      requestedAmount: [null, [Validators.required, Validators.min(1000)]],
      purposeOfLoan: ['', Validators.required],
      employmentDetails: ['', Validators.required],
      submittedDocuments: ['', Validators.required]
    });
  }

  loadSchemes(): void {
    this.schemeService.getLoanSchemes().subscribe({
      next: (res) => this.schemes = res,
      error: () => this.toast.error('Failed to load loan schemes')
    });
  }

  submitApplication(): void {
    if (this.loanForm.invalid) return;

    this.isSubmitting = true;
    const customerId = this.auth.getUserId();
    const payload = {
      ...this.loanForm.value,
      customerId,
      status: 'Pending',
      applicationDate: new Date()
    };

    this.applicationService.submitApplication(payload).subscribe({
      next: () => {
        this.toast.success('Loan application submitted');
        this.loanForm.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.toast.error('Submission failed');
        this.isSubmitting = false;
      }
    });
  }
}