import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

 
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.loginError = null;

    setTimeout(() => {
      this.isSubmitting = false;
      // fake login error for demo
      this.loginError = 'Invalid credentials';
    }, 1500);
  }
}
