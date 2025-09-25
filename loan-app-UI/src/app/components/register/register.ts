import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Role } from '../../models/user';
import { Gender, DocumentType } from '../../models/customer';

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
  uploadedFileName: string | null = null;

  accountForm: FormGroup;
  detailsForm: FormGroup;
  kycForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
   this.accountForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', Validators.required],
  phoneNumber: [''],
  role: ['Customer'] // hidden, default value
}, { validators: this.passwordsMatchValidator });
    this.detailsForm = this.fb.group({
      firstName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      lastName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      dateOfBirth: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      gender: this.fb.control<Gender>(Gender.Other, { nonNullable: true, validators: [Validators.required] }),
      city: this.fb.control('', { nonNullable: true }),
      occupation: this.fb.control('', { nonNullable: true }),
      annualIncome: this.fb.control<number | null>(null, [Validators.min(0)])
    });

    this.kycForm = this.fb.group({
      panNumber: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      aadhaarNumber: this.fb.control('', { nonNullable: true }),
      documentType: this.fb.control<DocumentType>(DocumentType.Pan, { nonNullable: true, validators: [Validators.required] }),
      documentPath: this.fb.control<File | null>(null, Validators.required)
    });
  }

  passwordsMatchValidator(form: FormGroup) {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };

  
  get role(): Role {
    return Role.Customer;
  }

  nextStep(): void {
    if (this.step === 1 && this.accountForm.invalid) return;
    if (this.step === 2 && this.role === 'Customer' && this.detailsForm.invalid) return;
    if (this.step === 3 && this.kycForm.invalid) return;
    this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.kycForm.patchValue({ documentPath: file });
      this.uploadedFileName = file.name;
    }
  }

  onSubmit(): void {
    if (
      this.accountForm.invalid ||
      (this.role === 'Customer' && this.detailsForm.invalid) ||
      this.kycForm.invalid
    ) return;

    this.isSubmitting = true;
    this.registerError = null;

    const payload = {
      ...this.accountForm.getRawValue(),
      ...(this.role === 'Customer' ? this.detailsForm.getRawValue() : {}),
      ...this.kycForm.getRawValue()
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.step = 4; // Show success screen
      },
      error: (err) => {
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