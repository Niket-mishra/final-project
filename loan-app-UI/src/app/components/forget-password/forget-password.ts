import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forget-password.html',
  styleUrls: ['./forget-password.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class ForgotPassword implements AfterViewInit {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private auth: Auth, private cdRef: ChangeDetectorRef) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { email } = this.forgotPasswordForm.value;

    this.auth.requestPasswordReset(email)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
  }

  private handleSuccess(): void {
    this.successMessage = '✅ Reset link sent to your email 📩';
    this.forgotPasswordForm.reset();
  }

  private handleError(err: any): void {
    this.errorMessage = err?.error?.message || 'Failed to send reset link';
  }
}
