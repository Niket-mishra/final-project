// ============================================
// ENHANCED LOAN APPLICATION FORM
// ============================================

import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoanSchemeService } from '../../services/loan-scheme';
import { LoanApplicationService } from '../../services/loan-application-service';
import { Auth } from '../../services/auth';
import { LoanScheme } from '../../models/loan-scheme';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-loan-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="loan-application-wrapper">
      <div class="container py-4">
        
        <!-- Header Section -->
        <div class="application-header text-center mb-4">
          <h2 class="header-title">
            <span class="header-icon">📋</span>
            Apply for a Loan
          </h2>
          <p class="header-subtitle">Fill out the form below to submit your loan application</p>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps mb-4">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <div class="step-number">1</div>
            <div class="step-label">Loan Details</div>
          </div>
          <div class="step-line" [class.completed]="currentStep > 1"></div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <div class="step-number">2</div>
            <div class="step-label">Purpose</div>
          </div>
          <div class="step-line" [class.completed]="currentStep > 2"></div>
          <div class="step" [class.active]="currentStep >= 3">
            <div class="step-number">3</div>
            <div class="step-label">Additional Info</div>
          </div>
        </div>

        @if (isLoading) {
          <div class="loading-container">
            <div class="spinner-border text-primary"></div>
            <p class="mt-3">Loading loan schemes...</p>
          </div>
        } @else {

          <form [formGroup]="loanForm" (ngSubmit)="submitApplication()" class="application-form">
            
            <!-- Step 1: Loan Details -->
            @if (currentStep === 1) {
              <div class="form-card">
                <h5 class="card-title">
                  <span class="title-icon">💰</span>
                  Loan Details
                </h5>
                
                <!-- Loan Scheme Selection -->
                <div class="form-group">
                  <label class="form-label">
                    Loan Scheme <span class="text-danger">*</span>
                  </label>
                  <select 
                    formControlName="schemeId" 
                    class="form-select"
                    [class.is-invalid]="isFieldInvalid('schemeId')"
                    (change)="onSchemeChange($event)">
                    <option value="" disabled>Select a loan scheme</option>
                    @for (scheme of schemes; track scheme.schemeId) {
                      <option [value]="scheme.schemeId">
                        {{ scheme.schemeName }} (₹{{ scheme.minAmount | number:'1.0-0' }}–₹{{ scheme.maxAmount | number:'1.0-0' }})
                      </option>
                    }
                  </select>
                  @if (isFieldInvalid('schemeId')) {
                    <div class="invalid-feedback">Please select a loan scheme</div>
                  }
                </div>

                <!-- Selected Scheme Info -->
                @if (selectedScheme) {
                  <div class="scheme-info-card">
                    <div class="info-row">
                      <span class="info-label">Interest Rate:</span>
                      <span class="info-value">{{ selectedScheme.interestRate }}% per annum</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Tenure:</span>
                      <span class="info-value">{{ selectedScheme.minTenure }}–{{ selectedScheme.maxTenure }} months</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Description:</span>
                      <span class="info-value">{{ selectedScheme.eligibilityCriteria }}</span>
                    </div>
                  </div>
                }

                <!-- Requested Amount -->
                <div class="form-group">
                  <label class="form-label">
                    Requested Amount <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">₹</span>
                    <input 
                      type="number" 
                      formControlName="requestedAmount" 
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('requestedAmount')"
                      placeholder="Enter amount"
                      (input)="calculateEMI()">
                  </div>
                  @if (isFieldInvalid('requestedAmount')) {
                    <div class="invalid-feedback d-block">
                      @if (loanForm.get('requestedAmount')?.errors?.['required']) {
                        Amount is required
                      }
                      @if (loanForm.get('requestedAmount')?.errors?.['min']) {
                        Minimum amount is ₹1,000
                      }
                      @if (loanForm.get('requestedAmount')?.errors?.['max']) {
                        Maximum amount is ₹{{ selectedScheme?.maxAmount | number:'1.0-0' }}
                      }
                    </div>
                  }
                  @if (loanForm.get('requestedAmount')?.value && selectedScheme) {
                    <small class="form-text text-muted">
                      Range: ₹{{ selectedScheme.minAmount | number:'1.0-0' }} - ₹{{ selectedScheme.maxAmount | number:'1.0-0' }}
                    </small>
                  }
                </div>

                <!-- Tenure -->
                <div class="form-group">
                  <label class="form-label">
                    Loan Tenure (months) <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    formControlName="tenure" 
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('tenure')"
                    placeholder="Enter tenure in months"
                    (input)="calculateEMI()">
                  @if (isFieldInvalid('tenure')) {
                    <div class="invalid-feedback">
                      @if (loanForm.get('tenure')?.errors?.['required']) {
                        Tenure is required
                      }
                      @if (loanForm.get('tenure')?.errors?.['min']) {
                        Minimum tenure is {{ selectedScheme?.minTenure }} months
                      }
                      @if (loanForm.get('tenure')?.errors?.['max']) {
                        Maximum tenure is {{ selectedScheme?.maxTenure }} months
                      }
                    </div>
                  }
                </div>

                <!-- EMI Calculator -->
                @if (calculatedEMI > 0) {
                  <div class="emi-calculator">
                    <div class="emi-header">
                      <span class="emi-icon">📊</span>
                      <strong>Estimated Monthly EMI</strong>
                    </div>
                    <div class="emi-amount">₹{{ calculatedEMI | number:'1.2-2' }}</div>
                    <div class="emi-details">
                      <div class="detail-item">
                        <span>Total Amount:</span>
                        <strong>₹{{ totalAmount | number:'1.2-2' }}</strong>
                      </div>
                      <div class="detail-item">
                        <span>Total Interest:</span>
                        <strong>₹{{ totalInterest | number:'1.2-2' }}</strong>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-primary btn-lg" (click)="nextStep()" [disabled]="!isStepValid(1)">
                  Next: Purpose Details →
                </button>
              </div>
            }

            <!-- Step 2: Purpose -->
            @if (currentStep === 2) {
              <div class="form-card">
                <h5 class="card-title">
                  <span class="title-icon">🎯</span>
                  Purpose of Loan
                </h5>

                <div class="form-group">
                  <label class="form-label">
                    Select Purpose <span class="text-danger">*</span>
                  </label>
                  <select 
                    formControlName="purposeOfLoan" 
                    class="form-select"
                    [class.is-invalid]="isFieldInvalid('purposeOfLoan')"
                    (change)="onPurposeChange($event)">
                    <option value="" disabled>Select purpose</option>
                    @for (purpose of loanPurposes; track purpose) {
                      <option [value]="purpose">{{ purpose }}</option>
                    }
                    <option value="Other">Other (Please Specify)</option>
                  </select>
                  @if (isFieldInvalid('purposeOfLoan')) {
                    <div class="invalid-feedback">Please select a purpose</div>
                  }
                </div>

                @if (showCustomPurpose) {
                  <div class="form-group">
                    <label class="form-label">
                      Specify Other Purpose <span class="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      formControlName="customPurpose" 
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('customPurpose')"
                      placeholder="Please describe your purpose">
                    @if (isFieldInvalid('customPurpose')) {
                      <div class="invalid-feedback">Please specify the purpose</div>
                    }
                  </div>
                }

                <div class="form-group">
                  <label class="form-label">
                    Purpose Description
                  </label>
                  <textarea 
                    formControlName="purposeDescription" 
                    class="form-control"
                    rows="4"
                    placeholder="Provide additional details about how you plan to use the loan"></textarea>
                  <small class="form-text text-muted">Optional: Help us understand your requirements better</small>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline-secondary btn-lg" (click)="previousStep()">
                  ← Back
                </button>
                <button type="button" class="btn btn-primary btn-lg" (click)="nextStep()" [disabled]="!isStepValid(2)">
                  Next: Additional Info →
                </button>
              </div>
            }

            <!-- Step 3: Additional Information -->
            @if (currentStep === 3) {
              <div class="form-card">
                <h5 class="card-title">
                  <span class="title-icon">📝</span>
                  Additional Information
                </h5>

                <div class="form-group">
                  <label class="form-label">
                    Employment Details <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="employmentDetails" 
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('employmentDetails')"
                    placeholder="e.g., Software Engineer at Tech Corp">
                  @if (isFieldInvalid('employmentDetails')) {
                    <div class="invalid-feedback">Employment details are required</div>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Monthly Income <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">₹</span>
                    <input 
                      type="number" 
                      formControlName="monthlyIncome" 
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('monthlyIncome')"
                      placeholder="Enter monthly income">
                  </div>
                  @if (isFieldInvalid('monthlyIncome')) {
                    <div class="invalid-feedback d-block">
                      Monthly income is required (minimum ₹10,000)
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Documents Submitted <span class="text-danger">*</span>
                  </label>
                  <textarea 
                    formControlName="submittedDocuments" 
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('submittedDocuments')"
                    rows="3"
                    placeholder="List the documents you have submitted (e.g., ID Proof, Address Proof, Income Proof)"></textarea>
                  @if (isFieldInvalid('submittedDocuments')) {
                    <div class="invalid-feedback">Please list the submitted documents</div>
                  }
                  <small class="form-text text-muted">
                    Commonly required: ID Proof, Address Proof, Income Proof, Bank Statements
                  </small>
                </div>

                <div class="form-group">
                  <label class="form-label">Additional Notes</label>
                  <textarea 
                    formControlName="additionalNotes" 
                    class="form-control"
                    rows="3"
                    placeholder="Any additional information you'd like to provide"></textarea>
                </div>

                <!-- Terms and Conditions -->
                <div class="form-check terms-check">
                  <input 
                    type="checkbox" 
                    formControlName="acceptTerms" 
                    class="form-check-input"
                    [class.is-invalid]="isFieldInvalid('acceptTerms')"
                    id="acceptTerms">
                  <label class="form-check-label" for="acceptTerms">
                    I accept the <a href="#" target="_blank">terms and conditions</a> and confirm that all information provided is accurate <span class="text-danger">*</span>
                  </label>
                  @if (isFieldInvalid('acceptTerms')) {
                    <div class="invalid-feedback d-block">You must accept the terms and conditions</div>
                  }
                </div>
              </div>

              <!-- Application Summary -->
              <div class="summary-card">
                <h5 class="summary-title">Application Summary</h5>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">Loan Scheme:</span>
                    <span class="summary-value">{{ selectedScheme?.schemeName }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Amount:</span>
                    <span class="summary-value">₹{{ loanForm.get('requestedAmount')?.value | number:'1.0-0' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Tenure:</span>
                    <span class="summary-value">{{ loanForm.get('tenure')?.value }} months</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Monthly EMI:</span>
                    <span class="summary-value">₹{{ calculatedEMI | number:'1.2-2' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Purpose:</span>
                    <span class="summary-value">{{ getPurposeDisplay() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Employment:</span>
                    <span class="summary-value">{{ loanForm.get('employmentDetails')?.value }}</span>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline-secondary btn-lg" (click)="previousStep()">
                  ← Back
                </button>
                <button 
                  type="submit" 
                  class="btn btn-success btn-lg" 
                  [disabled]="loanForm.invalid || isSubmitting">
                  @if (isSubmitting) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  } @else {
                    <span class="submit-icon">✓</span>
                    Submit Application
                  }
                </button>
              </div>
            }

          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .loan-application-wrapper {
      background: #f8fafc;
      min-height: 100vh;
      padding: 2rem 0;
    }

    .application-header {
      margin-bottom: 2rem;
    }

    .header-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .header-icon {
      font-size: 2.5rem;
    }

    .header-subtitle {
      color: #64748b;
      font-size: 1rem;
      margin: 0;
    }

    /* Progress Steps */
    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      padding: 0 2rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
    }

    .step.active .step-label {
      color: #059669;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin: 0 1rem;
      max-width: 100px;
    }

    .step-line.completed {
      background: #10b981;
    }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .title-icon {
      font-size: 1.5rem;
    }

    /* Form Groups */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-control,
    .form-select {
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .form-control:focus,
    .form-select:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-control.is-invalid,
    .form-select.is-invalid {
      border-color: #ef4444;
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .input-group-text {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-right: none;
      color: #64748b;
      font-weight: 600;
    }

    .input-group .form-control {
      border-left: none;
    }

    /* Scheme Info Card */
    .scheme-info-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      border: 2px solid #bbf7d0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
    }

    .info-row:not(:last-child) {
      border-bottom: 1px solid #bbf7d0;
    }

    .info-label {
      font-weight: 600;
      color: #166534;
    }

    .info-value {
      color: #15803d;
      font-weight: 500;
    }

    /* EMI Calculator */
    .emi-calculator {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1.5rem;
      border: 2px solid #93c5fd;
    }

    .emi-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #1e40af;
    }

    .emi-icon {
      font-size: 1.25rem;
    }

    .emi-amount {
      font-size: 2rem;
      font-weight: 700;
      color: #1e40af;
      text-align: center;
      margin-bottom: 1rem;
    }

    .emi-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item span {
      color: #3b82f6;
      font-size: 0.875rem;
    }

    .detail-item strong {
      color: #1e40af;
      font-size: 1.1rem;
    }

    /* Summary Card */
    .summary-card {
      background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 2px solid #fde047;
    }

    .summary-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #854d0e;
      margin-bottom: 1rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #a16207;
      font-weight: 500;
    }

    .summary-value {
      font-weight: 700;
      color: #854d0e;
    }

    /* Terms Check */
    .terms-check {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 10px;
      margin-top: 1.5rem;
    }

    .form-check-input {
      width: 1.25rem;
      height: 1.25rem;
      margin-top: 0.125rem;
    }

    .form-check-label {
      margin-left: 0.5rem;
      color: #334155;
    }

    .form-check-label a {
      color: #10b981;
      text-decoration: none;
      font-weight: 600;
    }

    .form-check-label a:hover {
      text-decoration: underline;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      margin-top: 2rem;
    }

    .btn-lg {
      padding: 0.875rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      border: none;
    }

    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4);
    }

    .btn-outline-secondary {
      border: 2px solid #e2e8f0;
      color: #64748b;
    }

    .btn-outline-secondary:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .submit-icon {
      margin-right: 0.5rem;
    }

    /* Loading */
    .loading-container {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .progress-steps {
        padding: 0 1rem;
      }

      .step-label {
        font-size: 0.75rem;
      }

      .step-line {
        max-width: 50px;
      }

      .form-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }

      .emi-details {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoanApplicationFormComponent implements OnInit {
  loanForm!: FormGroup;
  schemes: LoanScheme[] = [];
  selectedScheme: LoanScheme | null = null;
  isSubmitting = false;
  isLoading = true;
  showCustomPurpose = false;
  currentStep = 1;
  calculatedEMI = 0;
  totalAmount = 0;
  totalInterest = 0;

  loanPurposes = [
    'Home Renovation',
    'Education',
    'Medical Expenses',
    'Business Expansion',
    'Vehicle Purchase',
    'Debt Consolidation',
    'Wedding Expenses',
    'Travel'
  ];

  private fb = inject(FormBuilder);
  private schemeService = inject(LoanSchemeService);
  private applicationService = inject(LoanApplicationService);
  private auth = inject(Auth);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.initForm();
    this.loadSchemes();
    
    this.route.queryParams.subscribe(params => {
      const schemeId = params['schemeId'];
      if (schemeId) {
        setTimeout(() => {
          this.loanForm.patchValue({ schemeId: +schemeId });
          this.updateSelectedScheme(+schemeId);
        }, 500);
      }
    });
  }

  initForm(): void {
  this.loanForm = this.fb.group({
    schemeId: [null, Validators.required],
    requestedAmount: [null, [Validators.required, Validators.min(1000)]],
    tenure: [null, [Validators.required, Validators.min(1)]],
    purposeOfLoan: ['', Validators.required],
    customPurpose: [''],
    purposeDescription: [''],
    employmentDetails: ['', Validators.required],
    monthlyIncome: [null, [Validators.required, Validators.min(10000)]],
    submittedDocuments: ['', Validators.required],
    additionalNotes: [''],
    acceptTerms: [false, Validators.requiredTrue]
  });
}

loadSchemes(): void {
  this.schemeService.getLoanSchemes().subscribe({
    next: (schemes) => {
      this.schemes = schemes;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.isLoading = false;
      this.toast.error('Failed to load loan schemes. Please try again later.');
    }
  });
}

onSchemeChange(event: Event): void {
  const schemeId = +(event.target as HTMLSelectElement).value;
  this.updateSelectedScheme(schemeId);
  this.calculateEMI();
}

updateSelectedScheme(schemeId: number): void {
  this.selectedScheme = this.schemes.find(s => s.schemeId === schemeId) || null;
  if (this.selectedScheme) {
    // Adjust validators for requestedAmount & tenure dynamically
    this.loanForm.get('requestedAmount')?.setValidators([
      Validators.required,
      Validators.min(this.selectedScheme.minAmount),
      Validators.max(this.selectedScheme.maxAmount)
    ]);
    this.loanForm.get('tenure')?.setValidators([
      Validators.required,
      Validators.min(Number(this.selectedScheme.minTenure)),
      Validators.max(this.selectedScheme.maxTenure)
    ]);
    this.loanForm.get('requestedAmount')?.updateValueAndValidity();
    this.loanForm.get('tenure')?.updateValueAndValidity();
  }
}

onPurposeChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  this.showCustomPurpose = value === 'Other';

  if (this.showCustomPurpose) {
    this.loanForm.get('customPurpose')?.setValidators([Validators.required]);
  } else {
    this.loanForm.get('customPurpose')?.clearValidators();
  }
  this.loanForm.get('customPurpose')?.updateValueAndValidity();
}

calculateEMI(): void {
  if (!this.selectedScheme) return;

  const P = this.loanForm.get('requestedAmount')?.value;
  const r = this.selectedScheme.interestRate / 100 / 12;
  const n = this.loanForm.get('tenure')?.value;

  if (P && r && n) {
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    this.calculatedEMI = emi;
    this.totalAmount = emi * n;
    this.totalInterest = this.totalAmount - P;
  } else {
    this.calculatedEMI = 0;
    this.totalAmount = 0;
    this.totalInterest = 0;
  }
}

isFieldInvalid(field: string): boolean {
  const control = this.loanForm.get(field);
  return !!(control && control.invalid && (control.dirty || control.touched));
}

isStepValid(step: number): boolean {
  if (step === 1) {
    return this.loanForm.get('schemeId')?.valid &&
           this.loanForm.get('requestedAmount')?.valid &&
           this.loanForm.get('tenure')?.valid || false;
  }
  if (step === 2) {
    if (this.showCustomPurpose) {
      return this.loanForm.get('purposeOfLoan')?.valid &&
             this.loanForm.get('customPurpose')?.valid || false;
    }
    return this.loanForm.get('purposeOfLoan')?.valid || false;
  }
  if (step === 3) {
    return this.loanForm.get('employmentDetails')?.valid &&
           this.loanForm.get('monthlyIncome')?.valid &&
           this.loanForm.get('submittedDocuments')?.valid &&
           this.loanForm.get('acceptTerms')?.valid || false;
  }
  return false;
}

nextStep(): void {
  if (this.isStepValid(this.currentStep)) {
    this.currentStep++;
  }
}

previousStep(): void {
  if (this.currentStep > 1) {
    this.currentStep--;
  }
}

getPurposeDisplay(): string {
  const purpose = this.loanForm.get('purposeOfLoan')?.value;
  if (purpose === 'Other') {
    return this.loanForm.get('customPurpose')?.value || 'Other';
  }
  return purpose;
}

submitApplication(): void {
  if (this.loanForm.invalid) {
    this.toast.error('Please complete all required fields before submitting.');
    return;
  }

  this.isSubmitting = true;

  const formData = {
    ...this.loanForm.value,
    userId: this.auth.getCurrentUser()?.userId,
    emi: this.calculatedEMI,
    totalAmount: this.totalAmount,
    totalInterest: this.totalInterest
  };

  this.applicationService.submitApplication(formData).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.toast.success('Loan application submitted successfully!');
      this.router.navigate(['/dashboard']);
    },
    error: () => {
      this.isSubmitting = false;
      this.toast.error('Failed to submit application. Please try again.');
    }
  });
}
}
