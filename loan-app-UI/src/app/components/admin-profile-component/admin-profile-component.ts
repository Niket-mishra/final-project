

// src/app/components/admin-profile-component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  role: string;
  dateOfBirth: string;
  gender: string;
  alternativeEmail: string;
  address: string;
  city: string;
  postalCode: string;
  avatarUrl: string;
  joinedDate: string;
  lastLogin: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
}

interface Session {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface Preferences {
  theme: string;
  colorScheme: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}

@Component({
  selector: 'app-admin-profile-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile-component.html',
  styleUrl: './admin-profile-component.css'
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  activeTab: 'personal' | 'contact' | 'security' | 'preferences' = 'personal';
  isEditing = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  adminProfile: AdminProfile = {
    firstName: 'Niket',
    lastName: 'Mishra',
    email: 'niket.m@loanportal.com',
    phoneNumber: '+91 98765 43210',
    employeeId: 'EMP001',
    department: 'Loan Operations',
    role: 'Senior Administrator',
    dateOfBirth: '2002-10-15',
    gender: 'Male',
    alternativeEmail: 'niket.m@gmail.com',
    address: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    postalCode: '400101',
    avatarUrl: '',
    joinedDate: '2020-01-15',
    lastLogin: new Date().toISOString()
  };

  originalProfile: AdminProfile = { ...this.adminProfile };

  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  securitySettings: SecuritySettings = {
    twoFactorEnabled: false
  };

  activeSessions: Session[] = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Mumbai, India',
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Mumbai, India',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isCurrent: false
    }
  ];

  preferences: Preferences = {
    theme: 'light',
    colorScheme: 'blue',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    language: 'en',
    timezone: 'Asia/Kolkata'
  };

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminProfile(): void {
   
  }

  switchTab(tab: 'personal' | 'contact' | 'security' | 'preferences'): void {
    if (this.isEditing) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        this.cancelEditing();
        this.activeTab = tab;
      }
    } else {
      this.activeTab = tab;
    }
  }

  getInitials(): string {
    return `${this.adminProfile.firstName.charAt(0)}${this.adminProfile.lastName.charAt(0)}`.toUpperCase();
  }

  openAvatarUpload(): void {
    this.avatarInput.nativeElement.click();
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.adminProfile.avatarUrl = e.target?.result as string;
        this.uploadAvatar(file);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(file: File): void {
    // Replace with actual upload service
    // const formData = new FormData();
    // formData.append('avatar', file);
    // this.adminService.uploadAvatar(formData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       this.successMessage = 'Avatar updated successfully!';
    //       setTimeout(() => this.successMessage = '', 3000);
    //     },
    //     error: (error) => {
    //       this.errorMessage = 'Failed to upload avatar';
    //     }
    //   });
    
    this.successMessage = 'Avatar updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  enableEditing(): void {
    this.isEditing = true;
    this.originalProfile = { ...this.adminProfile };
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.adminProfile = { ...this.originalProfile };
  }

  updatePersonalInfo(): void {
    this.isSaving = true;
    
    // Replace with actual service call
    // this.adminService.updateProfile(this.adminProfile)
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     finalize(() => this.isSaving = false)
    //   )
    //   .subscribe({
    //     next: () => {
    //       this.successMessage = 'Personal information updated successfully!';
    //       this.isEditing = false;
    //       this.originalProfile = { ...this.adminProfile };
    //       setTimeout(() => this.successMessage = '', 5000);
    //     },
    //     error: (error) => {
    //       this.errorMessage = 'Failed to update personal information';
    //     }
    //   });

    // Simulate API call
    setTimeout(() => {
      this.successMessage = 'Personal information updated successfully!';
      this.isEditing = false;
      this.isSaving = false;
      this.originalProfile = { ...this.adminProfile };
      setTimeout(() => this.successMessage = '', 5000);
    }, 1000);
  }

  updateContactInfo(): void {
    this.isSaving = true;
    
    setTimeout(() => {
      this.successMessage = 'Contact information updated successfully!';
      this.isEditing = false;
      this.isSaving = false;
      this.originalProfile = { ...this.adminProfile };
      setTimeout(() => this.successMessage = '', 5000);
    }, 1000);
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match';
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.isSaving = true;

    // Replace with actual service call
    setTimeout(() => {
      this.successMessage = 'Password changed successfully!';
      this.isSaving = false;
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      setTimeout(() => this.successMessage = '', 5000);
    }, 1000);
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.passwordData.newPassword;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthPercentage(): number {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return 33;
    if (strength === 'medium') return 66;
    return 100;
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return 'Weak - Add more characters and variety';
    if (strength === 'medium') return 'Medium - Consider adding special characters';
    return 'Strong - Great password!';
  }

  toggleTwoFactor(): void {
    if (this.securitySettings.twoFactorEnabled) {
      this.successMessage = 'Two-factor authentication enabled';
    } else {
      this.successMessage = 'Two-factor authentication disabled';
    }
    setTimeout(() => this.successMessage = '', 3000);
  }

  getDeviceIcon(device: string): string {
    if (device.includes('Chrome') || device.includes('Firefox') || device.includes('Safari')) {
      return 'bi bi-laptop';
    }
    if (device.includes('iPhone') || device.includes('Android')) {
      return 'bi bi-phone';
    }
    return 'bi bi-device-ssd';
  }

  terminateSession(sessionId: number): void {
    if (confirm('Are you sure you want to end this session?')) {
      this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
      this.successMessage = 'Session terminated successfully';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  updatePreferences(): void {
    this.successMessage = 'Preferences updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
    
    // Apply theme changes
    if (this.preferences.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      // Replace with actual logout service
      // this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}