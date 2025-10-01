import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ResetPassword implements AfterViewInit {
  resetForm: FormGroup;
  isSubmitting = false;
  resetError: string | null = null;
  resetSuccess: string | null = null;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    // Form initialization with validator
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );

    // Extract token from query params
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  /** Validator to ensure passwords match */
  private passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  /** Submit handler */
  onSubmit(): void {
    if (this.resetForm.invalid || this.isSubmitting) return;
    if (!this.token) {
      this.resetError = 'Invalid reset token. Please check your email link.';
      return;
    }

    this.resetError = null;
    this.resetSuccess = null;
    this.isSubmitting = true;

    const { newPassword } = this.resetForm.value;

    // Call auth service with token
    this.auth.resetPassword(this.token, newPassword)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdRef.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.resetSuccess = '✅ Your password has been reset successfully!';
          this.resetForm.reset();
        },
        error: (err) => {
          this.resetError = err?.error?.message || 'Failed to reset password. Please try again.';
        },
      });
  }
}
