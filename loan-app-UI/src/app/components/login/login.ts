import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { RecaptchaModule, RecaptchaFormsModule, RecaptchaComponent } from 'ng-recaptcha-2';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
})
export class Login implements AfterViewInit {
  readonly recaptchaSiteKey = '6Lfij9QrAAAAAHqw6dlYVRQNPOjRZfD_wWagSCCf';

  @ViewChild('captchaRef') captchaRef?: RecaptchaComponent;

  loginForm: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private cdRef: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      // recaptcha: ['', Validators.required], // optional
    });
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges(); // Prevent ExpressionChangedAfterItHasBeenCheckedError
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.loginError = null;
    const { username, password } = this.loginForm.value;

    setTimeout(() => {
      this.isSubmitting = true;
      this.cdRef.detectChanges();

      this.auth.login(username, password)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.cdRef.detectChanges();
          })
        )
        .subscribe({
          next: () => {
            this.auth.updateLoginState(); // ✅ triggers reactive layout update
            console.log('✅ Login successful');
             setTimeout(() => {
    this.auth.redirectByRole(); // ✅ ensures route change
  }, 0);
          },
          error: (err) => {
            console.error('❌ Login error:', err);
            this.loginError = err?.error?.message || 'Login failed. Please try again.';
            this.auth.toast(this.loginError ?? 'Login failed', 'error');
          },
        });
    });
  }

  // Optional: reCAPTCHA handlers
  // onCaptchaExpired() {
  //   this.loginForm.get('recaptcha')?.reset();
  // }

  // onCaptchaErrored() {
  //   this.loginError = 'reCAPTCHA failed to load. Please refresh and try again.';
  // }
}