import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class Login implements AfterViewInit {
  loginForm: FormGroup;

  isSubmitting = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private cdRef: ChangeDetectorRef
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  /** ===========================
   *  FORM FACTORIES
   *  =========================== */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  

  /** ===========================
   *  LOGIN FLOW
   *  =========================== */
  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.loginError = null;
    const { email, password } = this.loginForm.value;

    this.isSubmitting = true;
    this.auth.login(email, password)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdRef.detectChanges();
      }))
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (err) => this.handleLoginError(err),
      });
  }

  private handleLoginSuccess(): void {
    this.auth.updateLoginState();
    // small async delay ensures Angular router navigation is smooth
    setTimeout(() => this.auth.redirectByRole(), 0);
  }

  private handleLoginError(err: any): void {
    this.loginError = err?.error?.message || 'Login failed. Please try again.';
    this.auth.toast(this.loginError ?? 'Login failed. Please try again.', 'error');
  }

  
}
