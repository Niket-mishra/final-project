
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanOfficer } from '../../models/loan-officer';
import { Subject } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { Role, User } from '../../models/user';
import { UserService } from '../../services/user-service';

interface OfficerProfile extends LoanOfficer {
  avatarUrl?: string;
  workloadPercentage?: number;
  performanceLevel?: string;
}

@Component({
  selector: 'app-officer-profile-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-profile-component.html',
  styleUrl: './officer-profile-component.css'
})
export class OfficerProfileComponent implements OnInit, OnDestroy {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  activeTab: 'personal' | 'professional' | 'performance' | 'settings' = 'personal';
  isEditing = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  isLoading = true;

  officerProfile: OfficerProfile = {
    officerId: 0,
    city: '',
    designation: '',
    specialization: '',
    maxLoansAssigned: 0,
    currentWorkload: 0,
    performanceRating: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      userId: 0,
      username: '',
      email: '',
      phoneNumber: '',
      role: Role.LoanOfficer,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: '',
      isDeleted: false
    },
    avatarUrl: '',
    workloadPercentage: 0,
    performanceLevel: '',
    userId: 0
  };

  originalProfile: OfficerProfile = { ...this.officerProfile };

  preferences = {
    emailNotifications: true,
    smsNotifications: false,
    theme: 'light',
    autoAssignLoans: true
  };

  private destroy$ = new Subject<void>();

  constructor(
    private officerService: OfficerService,
    private auth: Auth,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOfficerProfile();
    setTimeout(() => this.cdr.detectChanges(), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOfficerProfile(): void {
    const userId = this.auth.getUserId();

    if (typeof userId !== 'number') {
      this.errorMessage = 'Officer ID not found.';
      this.isLoading = false;
      return;
    }

   this.userService.getRoleEntityId(userId)
         .pipe(
           switchMap(({ roleEntityId }) => this.officerService.getOfficerById(roleEntityId)),
           takeUntil(this.destroy$),
           finalize(() => this.isLoading = false)
         )
      .subscribe({
        next: (data: LoanOfficer) => {
          this.officerProfile = {
            ...data,
            workloadPercentage: this.calculateWorkloadPercentage(data),
            performanceLevel: this.getPerformanceLevel(data.performanceRating)
          };
          this.originalProfile = { ...this.officerProfile };
        },
        error: () => {
          this.errorMessage = 'Failed to load officer profile.';
        }
      });
  }

  calculateWorkloadPercentage(officer: LoanOfficer): number {
    if (officer.maxLoansAssigned === 0) return 0;
    return Math.round((officer.currentWorkload / officer.maxLoansAssigned) * 100);
  }

  getPerformanceLevel(rating?: number): string {
    if (!rating) return 'Not Rated';
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    return 'Needs Improvement';
  }

  switchTab(tab: 'personal' | 'professional' | 'performance' | 'settings'): void {
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
    return this.officerProfile.user?.username?.substring(0, 2).toUpperCase() || 'OF';
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
        this.officerProfile.avatarUrl = e.target?.result as string;
        this.successMessage = 'Avatar updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      };
      reader.readAsDataURL(file);
    }
  }

  enableEditing(): void {
    this.isEditing = true;
    this.originalProfile = { ...this.officerProfile };
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.officerProfile = { ...this.originalProfile };
  }

  updateProfile(): void {
    this.isSaving = true;

    setTimeout(() => {
      this.successMessage = 'Profile updated successfully!';
      this.isEditing = false;
      this.isSaving = false;
      this.originalProfile = { ...this.officerProfile };
      setTimeout(() => this.successMessage = '', 5000);
    }, 1000);
  }

  updatePreferences(): void {
    this.successMessage = 'Preferences updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  getStatusBadge(): string {
    return this.officerProfile.isActive ? 'success' : 'secondary';
  }

  getWorkloadColor(): string {
    const percentage = this.officerProfile.workloadPercentage || 0;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.router.navigate(['/auth/login']);
    }
  }
}

