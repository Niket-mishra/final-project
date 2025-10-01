import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Role } from '../../models/user';
import { Gender } from '../../models/customer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  step = 1;
  isSubmitting = false;
  registerError: string | null = null;

  accountForm: FormGroup;
  detailsForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.accountForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: [''],
      role: ['Customer']
    }, { validators: this.passwordsMatchValidator });

    this.detailsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: [Gender.Other, Validators.required],
      city: [''],
      occupation: [''],
      annualIncome: [null, [Validators.min(0)]]
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get role(): Role {
    return Role.Customer;
  }

  nextStep(): void {
    console.log('Current step:', this.step);
    switch (this.step) {
      case 1:
        console.log('Account form valid:', this.accountForm.valid);
        if (this.accountForm.invalid) return;
        this.step = 2;
        break;
      case 2:
        console.log('Details form valid:', this.detailsForm.valid);
        if (this.role === 'Customer' && this.detailsForm.invalid) return;
        this.step = 3;
        break;
    }
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  onSubmit(): void {
    console.log('Submitting registration...');
    if (this.accountForm.invalid || this.detailsForm.invalid) {
      console.log('Form invalid. Aborting submission.');
      return;
    }

    this.isSubmitting = true;
    this.registerError = null;
    const { confirmPassword, ...accountValues } = this.accountForm.getRawValue();

    const payload = {
      ...accountValues,
      ...(this.role === 'Customer' ? {
    ...this.detailsForm.getRawValue(),
    gender: Gender[this.detailsForm.get('gender')?.value as keyof typeof Gender],
    role: Role[this.accountForm.get('role')?.value as keyof typeof Role]
  } : {})
};


    console.log('Payload:', payload);

    this.auth.register(payload).subscribe({
      next: () => {
        console.log('Registration successful');
        this.isSubmitting = false;
        this.step = 3;
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.isSubmitting = false;
        this.registerError = err?.error?.message ?? 'Registration failed';
      }
    });
  }

  get userName(): string {
    return this.auth.getUserName();
  }

  get dashboardRoute(): string {
    return this.auth.getDashboardRoute();
  }
}