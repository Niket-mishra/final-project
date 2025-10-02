import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer-service';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';
import { Customer, DocumentType, Gender, VerificationStatus } from '../../models/customer';
import { Subject } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { Role } from '../../models/user';

interface CustomerProfile extends Customer {
state: any;
  avatarUrl?: string;
  panMasked?: string;
  aadhaarMasked?: string;
  verificationStatusText?: string;
}

@Component({
  selector: 'app-customer-profile-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profile-component.html',
  styleUrl: './customer-profile-component.css'
})
export class CustomerProfileComponent implements OnInit, OnDestroy {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  activeTab: 'personal' | 'financial' | 'documents' | 'settings' = 'personal';
  isEditing = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  isLoading = true;

  customerProfile: CustomerProfile = {
    customerId: 0,
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    gender: Gender.Male,
    city: '',
    state: '',
    occupation: '',
    annualIncome: 0,
    creditScore: 0,
    panNumber: '',
    aadhaarNumber: '',
    documentType: DocumentType.Pan,
    documentPath: '',
    verificationStatus: VerificationStatus.Pending,
    verifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 0,
    user: {
      userId: 0,
      username: '',
      email: '',
      phoneNumber: '',
      role: Role.Customer,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: '',
      isDeleted: false
    },
    avatarUrl: '',
    panMasked: '',
    aadhaarMasked: '',
    verificationStatusText: '',
    address: ''
  };

  originalProfile: CustomerProfile = { ...this.customerProfile };

  preferences = {
    emailNotifications: true,
    smsNotifications: false,
    theme: 'light',
    marketingEmails: false
  };

  private destroy$ = new Subject<void>();

  // Enum references for template
  Gender = Gender;
  DocumentType = DocumentType;
  VerificationStatus = VerificationStatus;

  constructor(
    private customerService: CustomerService,
    private auth: Auth,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomerProfile();
    setTimeout(() => this.cdr.detectChanges(), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomerProfile(): void {
    const userId = this.auth.getUserId();

    if (typeof userId !== 'number') {
      this.errorMessage = 'User ID not found.';
      this.isLoading = false;
      return;
    }

    this.userService.getRoleEntityId(userId)
      .pipe(
        switchMap(({ roleEntityId }) => this.customerService.getCustomerById(roleEntityId)),
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data: Customer) => {
          this.customerProfile = {
            ...data,
            state: data.verificationStatus,
            panMasked: this.maskPan(data.panNumber),
            aadhaarMasked: this.maskAadhaar(data.aadhaarNumber),
            verificationStatusText: this.getVerificationStatusText(data.verificationStatus)
          };
          this.originalProfile = { ...this.customerProfile };
        },
        error: () => {
          this.errorMessage = 'Failed to load customer profile.';
        }
      });
  }

  maskPan(pan?: string): string {
    if (!pan) return '—';
    return pan.replace(/^(.{3})(.*)(.)$/, (_, a, mid, z) => `${a}${'*'.repeat(mid.length)}${z}`);
  }

  maskAadhaar(aadhaar?: string): string {
    if (!aadhaar) return '—';
    const digits = aadhaar.replace(/\D/g, '');
    return `•••• •••• ${digits.slice(-4)}`;
  }

  getVerificationStatusText(status: VerificationStatus): string {
    switch (status) {
      case VerificationStatus.Verified: return 'Verified';
      case VerificationStatus.Pending: return 'Pending';
      case VerificationStatus.Rejected: return 'Rejected';
      default: return 'Unknown';
    }
  }

  switchTab(tab: 'personal' | 'financial' | 'documents' | 'settings'): void {
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
    const first = this.customerProfile.firstName?.charAt(0) || '';
    const last = this.customerProfile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'CU';
  }

  openAvatarUpload(): void {
    this.avatarInput.nativeElement.click();
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.customerProfile.avatarUrl = e.target?.result as string;
        this.successMessage = 'Avatar updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      };
      reader.readAsDataURL(file);
    }
  }

  enableEditing(): void {
    this.isEditing = true;
    this.originalProfile = { ...this.customerProfile };
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.customerProfile = { ...this.originalProfile };
  }

  updateProfile(): void {
    this.isSaving = true;

    // Simulate API call - replace with actual service
    setTimeout(() => {
      this.successMessage = 'Profile updated successfully!';
      this.isEditing = false;
      this.isSaving = false;
      this.originalProfile = { ...this.customerProfile };
      
      // Update masked values
      this.customerProfile.panMasked = this.maskPan(this.customerProfile.panNumber);
      this.customerProfile.aadhaarMasked = this.maskAadhaar(this.customerProfile.aadhaarNumber);
      
      setTimeout(() => this.successMessage = '', 5000);
    }, 1000);
  }
  getDocumentTypeLabel(type: string): string {
    switch (type) {
      case DocumentType.Pan : return 'PAN Card';
      case DocumentType.Aadhaar: return 'Aadhaar Card';
      case DocumentType.Passport: return 'Passport';
      case DocumentType.DrivingLicense: return 'Driving License';
      default: return 'PAN Card';
    } 
  }

  updatePreferences(): void {
    this.successMessage = 'Preferences updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  getStatusBadge(): string {
    switch (this.customerProfile.verificationStatus) {
      case VerificationStatus.Verified: return 'success';
      case VerificationStatus.Pending: return 'warning';
      case VerificationStatus.Rejected: return 'danger';
      default: return 'secondary';
    }
  }

  getCreditScoreColor(): string {
    const score = this.customerProfile.creditScore || 0;
    if (score >= 750) return 'success';
    if (score >= 650) return 'info';
    if (score >= 550) return 'warning';
    return 'danger';
  }

  getCreditScoreLabel(): string {
    const score = this.customerProfile.creditScore || 0;
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  }

  downloadDocument(): void {
    if (this.customerProfile.documentPath) {
      window.open(this.customerProfile.documentPath, '_blank');
    } else {
      this.errorMessage = 'No document available for download';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.router.navigate(['/auth/login']);
    }
  }
}