import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanOfficer } from '../../models/loan-officer';
import { UserService } from '../../services/user-service';
import { ToastService } from '../../services/toast-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-officer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="officer-settings">
      <!-- Header -->
      <div class="settings-header">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h3 class="fw-bold mb-1">Settings & Profile</h3>
              <p class="text-muted mb-0">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div class="container py-4">
        @if (isLoading) {
          <div class="loading-state">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3">Loading settings...</p>
          </div>
        } @else if (errorMessage) {
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h5>Failed to Load Settings</h5>
            <p>{{ errorMessage }}</p>
            <button class="btn btn-primary" (click)="loadSettings()">
              Try Again
            </button>
          </div>
        } @else {
          
          <!-- Success/Error Messages -->
          @if (successMessage) {
            <div class="alert alert-success alert-dismissible fade show">
              <strong>Success!</strong> {{ successMessage }}
              <button type="button" class="btn-close" (click)="successMessage = ''"></button>
            </div>
          }

          @if (updateError) {
            <div class="alert alert-danger alert-dismissible fade show">
              <strong>Error!</strong> {{ updateError }}
              <button type="button" class="btn-close" (click)="updateError = ''"></button>
            </div>
          }

          <!-- Tab Navigation -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <a class="nav-link" 
                 [class.active]="activeTab === 'profile'"
                 (click)="activeTab = 'profile'">
                Profile Information
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                 [class.active]="activeTab === 'security'"
                 (click)="activeTab = 'security'">
                Security
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                 [class.active]="activeTab === 'preferences'"
                 (click)="activeTab = 'preferences'">
                Preferences
              </a>
            </li>
          </ul>

          <!-- Profile Tab -->
          @if (activeTab === 'profile' && officer) {
            <div class="settings-card">
              <div class="card-header">
                <h5 class="mb-0">Profile Information</h5>
                <p class="text-muted mb-0 small">Update your personal and contact details</p>
              </div>
              <div class="card-body">
                <form #profileForm="ngForm" (ngSubmit)="updateProfile()">
                  <div class="row g-4">
                    <!-- User Information -->
                    <div class="col-12">
                      <h6 class="section-title">Account Details</h6>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">Username <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="officer.user.username"
                        name="username"
                        required
                        #username="ngModel"
                        [class.is-invalid]="username.invalid && username.touched"
                      />
                      <div class="invalid-feedback" *ngIf="username.invalid && username.touched">
                        Username is required
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Email <span class="text-danger">*</span></label>
                      <input
                        type="email"
                        class="form-control"
                        [(ngModel)]="officer.user.email"
                        name="email"
                        required
                        email
                        #email="ngModel"
                        [class.is-invalid]="email.invalid && email.touched"
                      />
                      <div class="invalid-feedback" *ngIf="email.invalid && email.touched">
                        Valid email is required
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Phone Number</label>
                      <input
                        type="tel"
                        class="form-control"
                        [(ngModel)]="officer.user.phoneNumber"
                        name="phone"
                        pattern="[0-9]{10}"
                        #phone="ngModel"
                        [class.is-invalid]="phone.invalid && phone.touched"
                      />
                      <div class="invalid-feedback" *ngIf="phone.invalid && phone.touched">
                        Please enter a valid 10-digit phone number
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Role</label>
                      <input
                        type="text"
                        class="form-control"
                        [value]="officer.user.role"
                        disabled
                      />
                      <small class="text-muted">Role cannot be changed</small>
                    </div>

                    <!-- Officer Specific Information -->
                    <div class="col-12 mt-4">
                      <h6 class="section-title">Officer Details</h6>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">First Name</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="officer.user.username"
                        name="firstName"
                      />
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Last Name</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="officer.user.username"
                        name="lastName"
                      />
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Department</label>
                      <select
                        class="form-select"
                        [(ngModel)]="officer.designation"
                        name="department"
                      >
                        <option value="Loan Processing">Loan Processing</option>
                        <option value="Document Verification">Document Verification</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Risk Assessment">Risk Assessment</option>
                        <option value="Disbursement">Disbursement</option>
                      </select>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">City/Branch</label>
                      <select
                        class="form-select"
                        [(ngModel)]="officer.city"
                        name="city"
                      >
                        <option value="">Select City</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Pune">Pune</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                      </select>
                    </div>

                    <div class="col-12 mt-4">
                      <button 
                        type="submit" 
                        class="btn btn-primary px-4"
                        [disabled]="profileForm.invalid || isUpdating">
                        <span *ngIf="!isUpdating">Update Profile</span>
                        <span *ngIf="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                        <span *ngIf="isUpdating">Updating...</span>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary ms-2"
                        (click)="resetProfile()">
                        Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          }

          <!-- Security Tab -->
          @if (activeTab === 'security') {
            <div class="settings-card">
              <div class="card-header">
                <h5 class="mb-0">Security Settings</h5>
                <p class="text-muted mb-0 small">Manage your password and security preferences</p>
              </div>
              <div class="card-body">
                <form #passwordForm="ngForm" (ngSubmit)="changePassword()">
                  <div class="row g-4">
                    <div class="col-12">
                      <h6 class="section-title">Change Password</h6>
                      <p class="text-muted small">Password must be at least 8 characters long and contain letters and numbers</p>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Current Password <span class="text-danger">*</span></label>
                      <input
                        type="password"
                        class="form-control"
                        [(ngModel)]="passwordData.currentPassword"
                        name="currentPassword"
                        required
                        #currentPassword="ngModel"
                        [class.is-invalid]="currentPassword.invalid && currentPassword.touched"
                      />
                      <div class="invalid-feedback">
                        Current password is required
                      </div>
                    </div>

                    <div class="col-md-6"></div>

                    <div class="col-md-6">
                      <label class="form-label">New Password <span class="text-danger">*</span></label>
                      <input
                        type="password"
                        class="form-control"
                        [(ngModel)]="passwordData.newPassword"
                        name="newPassword"
                        required
                        minlength="8"
                        #newPassword="ngModel"
                        [class.is-invalid]="newPassword.invalid && newPassword.touched"
                      />
                      <div class="invalid-feedback">
                        Password must be at least 8 characters
                      </div>
                      <div class="password-strength mt-2">
                        <div class="strength-bar">
                          <div class="strength-fill" [style.width.%]="getPasswordStrength()" [class]="getPasswordStrengthClass()"></div>
                        </div>
                        <small class="text-muted">{{ getPasswordStrengthText() }}</small>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Confirm New Password <span class="text-danger">*</span></label>
                      <input
                        type="password"
                        class="form-control"
                        [(ngModel)]="passwordData.confirmPassword"
                        name="confirmPassword"
                        required
                        #confirmPassword="ngModel"
                        [class.is-invalid]="(confirmPassword.touched && passwordData.newPassword !== passwordData.confirmPassword)"
                      />
                      <div class="invalid-feedback" *ngIf="passwordData.newPassword !== passwordData.confirmPassword">
                        Passwords do not match
                      </div>
                    </div>

                    <div class="col-12 mt-4">
                      <button 
                        type="submit" 
                        class="btn btn-primary px-4"
                        [disabled]="passwordForm.invalid || passwordData.newPassword !== passwordData.confirmPassword || isUpdating">
                        <span *ngIf="!isUpdating">Change Password</span>
                        <span *ngIf="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                        <span *ngIf="isUpdating">Updating...</span>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary ms-2"
                        (click)="resetPasswordForm()">
                        Clear
                      </button>
                    </div>
                  </div>
                </form>

                <!-- Account Security Info -->
                <div class="security-info mt-5">
                  <h6 class="section-title">Account Security</h6>
                  <div class="info-card">
                    <div class="info-row">
                      <div>
                        <strong>Last Login</strong>
                        <p class="text-muted mb-0 small">{{ getLastLogin() }}</p>
                      </div>
                      <span class="badge bg-success">Active</span>
                    </div>
                    <div class="info-row">
                      <div>
                        <strong>Account Created</strong>
                        <p class="text-muted mb-0 small">{{ getAccountCreated() }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Preferences Tab -->
          @if (activeTab === 'preferences') {
            <div class="settings-card">
              <div class="card-header">
                <h5 class="mb-0">Preferences</h5>
                <p class="text-muted mb-0 small">Customize your experience</p>
              </div>
              <div class="card-body">
                <form (ngSubmit)="updatePreferences()">
                  <div class="row g-4">
                    <div class="col-12">
                      <h6 class="section-title">Notification Preferences</h6>
                    </div>

                    <div class="col-12">
                      <div class="preference-item">
                        <div>
                          <strong>Email Notifications</strong>
                          <p class="text-muted mb-0 small">Receive email updates for new applications</p>
                        </div>
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            [(ngModel)]="preferences.emailNotifications"
                            name="emailNotifications"
                            id="emailNotif">
                        </div>
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="preference-item">
                        <div>
                          <strong>SMS Notifications</strong>
                          <p class="text-muted mb-0 small">Get SMS alerts for urgent matters</p>
                        </div>
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            [(ngModel)]="preferences.smsNotifications"
                            name="smsNotifications"
                            id="smsNotif">
                        </div>
                      </div>
                    </div>

                    <div class="col-12 mt-4">
                      <h6 class="section-title">Display Preferences</h6>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Items Per Page</label>
                      <select class="form-select" [(ngModel)]="preferences.itemsPerPage" name="itemsPerPage">
                        <option [value]="10">10</option>
                        <option [value]="25">25</option>
                        <option [value]="50">50</option>
                        <option [value]="100">100</option>
                      </select>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Date Format</label>
                      <select class="form-select" [(ngModel)]="preferences.dateFormat" name="dateFormat">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div class="col-12 mt-4">
                      <button 
                        type="submit" 
                        class="btn btn-primary px-4"
                        [disabled]="isUpdating">
                        <span *ngIf="!isUpdating">Save Preferences</span>
                        <span *ngIf="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                        <span *ngIf="isUpdating">Saving...</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .officer-settings {
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .settings-header {
      background: white;
      border-bottom: 1px solid #dee2e6;
      padding: 1.5rem 0;
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .nav-tabs {
      border-bottom: 2px solid #dee2e6;
    }

    .nav-tabs .nav-link {
      color: #6c757d;
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      cursor: pointer;
    }

    .nav-tabs .nav-link:hover {
      color: #0d6efd;
      border: none;
    }

    .nav-tabs .nav-link.active {
      color: #0d6efd;
      border: none;
      border-bottom: 2px solid #0d6efd;
      background: transparent;
    }

    .settings-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .settings-card .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      background: #f8f9fa;
    }

    .settings-card .card-body {
      padding: 2rem;
    }

    .section-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-label {
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .form-control,
    .form-select {
      border-radius: 6px;
      border: 1px solid #ced4da;
      padding: 0.625rem 0.875rem;
    }

    .form-control:focus,
    .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
    }

    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-bar {
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s, background-color 0.3s;
    }

    .strength-fill.weak {
      background-color: #dc3545;
    }

    .strength-fill.medium {
      background-color: #ffc107;
    }

    .strength-fill.strong {
      background-color: #28a745;
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
    }

    .form-check-input {
      width: 3rem;
      height: 1.5rem;
      cursor: pointer;
    }

    .security-info {
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
    }

    .info-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .btn {
      font-weight: 600;
      padding: 0.625rem 1.5rem;
      border-radius: 6px;
    }

    @media (max-width: 768px) {
      .settings-card .card-body {
        padding: 1rem;
      }

      .nav-tabs .nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class OfficerSettings implements OnInit, OnDestroy {
  officer: LoanOfficer | null = null;
  originalOfficer: LoanOfficer | null = null;
  isLoading = true;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';
  updateError = '';
  activeTab = 'profile';

  passwordData: PasswordChange = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  preferences = {
    emailNotifications: true,
    smsNotifications: false,
    itemsPerPage: 25,
    dateFormat: 'DD/MM/YYYY'
  };

  private destroy$ = new Subject<void>();
  private officerService = inject(OfficerService);
  private auth = inject(Auth);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const userId = this.auth.getUserId();

    if (!userId || typeof userId !== 'number') {
      this.handleError('User ID not found. Please log in again.');
      return;
    }

    this.userService.getRoleEntityId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ roleEntityId }) => {
          this.officerService.getOfficerById(roleEntityId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (officer: LoanOfficer) => {
                this.officer = officer;
                this.originalOfficer = JSON.parse(JSON.stringify(officer));
                this.loadPreferences();
                this.isLoading = false;
                this.cdr.markForCheck();
              },
              error: (err) => {
                console.error('Error loading officer:', err);
                this.handleError('Failed to load officer settings. Please try again.');
              }
            });
        },
        error: (err) => {
          console.error('Error getting officer ID:', err);
          this.handleError('Failed to retrieve officer ID. Please try again.');
        }
      });
  }

  loadPreferences(): void {
    const saved = localStorage.getItem('officer_preferences');
    if (saved) {
      try {
        this.preferences = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
  }

  updateProfile(): void {
    if (!this.officer) return;

    this.isUpdating = true;
    this.updateError = '';
    this.successMessage = '';

    this.officerService.updateOfficer(this.officer.officerId, this.officer)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully!';
          this.originalOfficer = JSON.parse(JSON.stringify(this.officer));
          this.toast.success('Profile updated successfully');
          this.isUpdating = false;
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.updateError = 'Failed to update profile. Please try again.';
          this.toast.error('Failed to update profile');
          this.isUpdating = false;
        }
      });
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.updateError = 'Passwords do not match';
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.updateError = 'Password must be at least 8 characters long';
      return;
    }

    this.isUpdating = true;
    this.updateError = '';
    this.successMessage = '';

    this.userService.changePassword(
      this.auth.getUserId() || 0,
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully!';
          this.toast.success('Password changed successfully');
          this.resetPasswordForm();
          this.isUpdating = false;
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          console.error('Error changing password:', err);
          this.updateError = 'Failed to change password. Please check your current password and try again.';
          this.toast.error('Failed to change password');
          this.isUpdating = false;
        }
      });
  }

  updatePreferences(): void {
    this.isUpdating = true;
    localStorage.setItem('officer_preferences', JSON.stringify(this.preferences));
    
    setTimeout(() => {
      this.successMessage = 'Preferences saved successfully!';
      this.toast.success('Preferences saved');
      this.isUpdating = false;
      setTimeout(() => this.successMessage = '', 5000);
    }, 500);
  }

  resetProfile(): void {
    if (this.originalOfficer) {
      this.officer = JSON.parse(JSON.stringify(this.originalOfficer));
    }
  }

  resetPasswordForm(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  getPasswordStrength(): number {
    const password = this.passwordData.newPassword;
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'weak';
    if (strength < 70) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return '';
    if (strength < 40) return 'Weak password';
    if (strength < 70) return 'Medium strength';
    return 'Strong password';
  }

  getLastLogin(): string {
    return new Date().toLocaleString();
  }

  getAccountCreated(): string {
    if (this.officer?.user) {
      return new Date().toLocaleDateString();
    }
    return 'N/A';
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
}