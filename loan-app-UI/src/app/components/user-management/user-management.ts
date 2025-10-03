// src/app/components/user-management.ts
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { ToastService } from '../../services/toast-service';
import { Role, User } from '../../models/user';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;

  // CRUD modals
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showViewModal = false;

  // Selected user for operations
  selectedUser: User | null = null;

  // Form data
  userForm = {
    username: '',
    email: '',
    phoneNumber: '',
    role: Role.Customer,
    password: ''
  };

  // Processing states
  isSubmitting = false;
  isDeleting = false;

  // Filters
  searchTerm = '';
  roleFilter = '';
  sortBy = 'username';

  // Role enum for template
  Role = Role;
  roleOptions = [
    { value: Role.Admin, label: 'Admin' },
    { value: Role.LoanOfficer, label: 'Loan Officer' },
    { value: Role.Customer, label: 'Customer' }
  ];

  private userService = inject(UserService);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadUsers();
    setTimeout(() => this.cdr.detectChanges(), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res) => {
          this.users = res.filter(u => !u.isDeleted);
          this.filteredUsers = [...this.users];
          this.filterUsers();
        },
        error: () => {
          this.toast.error('Failed to load users');
        }
      });
  }

  filterUsers(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.username?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        u.phoneNumber?.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (this.roleFilter) {
      filtered = filtered.filter(u => u.role === this.roleFilter);
    }

    this.filteredUsers = filtered;
    this.sortUsers();
  }

  sortUsers(): void {
    this.filteredUsers.sort((a, b) => {
      const aVal = a[this.sortBy as keyof User] as string;
      const bVal = b[this.sortBy as keyof User] as string;
      return aVal?.localeCompare(bVal);
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = '';
    this.sortBy = 'username';
    this.filterUsers();
  }

  // CREATE
  openCreateModal(): void {
    this.showCreateModal = true;
    this.userForm = {
      username: '',
      email: '',
      phoneNumber: '',
      role: Role.Customer,
      password: ''
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.userForm = {
      username: '',
      email: '',
      phoneNumber: '',
      role: Role.Customer,
      password: ''
    };
  }

  createUser(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const userData = {
      ...this.userForm,
      passwordHash: this.userForm.password,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    const payload: any = { ...userData };
    console.log(payload);
    
    if (this.userForm.password) {
      payload.password = this.userForm.password;
    }

    this.userService.createUser(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.toast.success('User created successfully!');
          this.closeCreateModal();
          this.loadUsers();
          setTimeout(() => this.cdr.detectChanges(), 1000);

        },
        error: () => {
          this.toast.error('Failed to create user');
        }
      });
  }

  // READ
  openViewModal(user: User): void {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedUser = null;
  }

  // UPDATE
  openEditModal(user: User): void {
    this.selectedUser = user;
    this.userForm = {
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      password: ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.userForm = {
      username: '',
      email: '',
      phoneNumber: '',
      role: Role.Customer,
      password: ''
    };
  }

  updateUser(): void {
    if (!this.selectedUser || !this.validateForm(true)) {
      return;
    }

    this.isSubmitting = true;

    

    const updateData = {
      username: this.userForm.username,
      email: this.userForm.email,
      phoneNumber: this.userForm.phoneNumber,
      role: this.userForm.role,
      updatedAt: new Date().toISOString()
    };

    const payload: any = { ...updateData };
    if (this.userForm.password) {
      payload.password = this.userForm.password;
    }

    this.userService.updateUser(this.selectedUser.userId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.toast.success('User updated successfully!');
          this.closeEditModal();
          this.loadUsers();
        },
        error: () => {
          this.toast.error('Failed to update user');
        }
      });
  }

  toggleRole(user: User): void {
    const roleRotation = {
      [Role.Customer]: Role.LoanOfficer,
      [Role.LoanOfficer]: Role.Admin,
      [Role.Admin]: Role.Customer
    };

    const newRole = roleRotation[user.role as keyof typeof roleRotation];

    this.userService.updateUserRole(user.userId, newRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          user.role = newRole;
          this.toast.success(`Role updated to ${newRole}`);
        },
        error: () => {
          this.toast.error('Failed to update role');
        }
      });
  }

  // DELETE (Soft Delete)
  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;

    this.isDeleting = true;

   
    this.userService.deleteUser(this.selectedUser.userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDeleting = false)
      )
      .subscribe({
        next: () => {
          this.toast.success('User deleted successfully!');
          this.closeDeleteModal();
          this.loadUsers();
        },
        error: () => {
          this.toast.error('Failed to delete user');
        }
      });
  }

  // Validation
  validateForm(isEdit: boolean = false): boolean {
    if (!this.userForm.username.trim()) {
      this.toast.error('Username is required');
      return false;
    }

    if (!this.userForm.email.trim()) {
      this.toast.error('Email is required');
      return false;
    }

    if (!this.isValidEmail(this.userForm.email)) {
      this.toast.error('Please enter a valid email');
      return false;
    }

    if (!isEdit && !this.userForm.password.trim()) {
      this.toast.error('Password is required');
      return false;
    }

    if (!isEdit && this.userForm.password.length < 6) {
      this.toast.error('Password must be at least 6 characters');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case Role.Admin: return 'danger';
      case Role.LoanOfficer: return 'info';
      case Role.Customer: return 'success';
      default: return 'secondary';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case Role.Admin: return 'bi-shield-fill-check';
      case Role.LoanOfficer: return 'bi-briefcase-fill';
      case Role.Customer: return 'bi-person-fill';
      default: return 'bi-person';
    }
  }

  getActiveUsersCount(): number {
    return this.users.filter(u => !u.isDeleted).length;
  }

  getUsersByRole(role: Role): number {
    return this.users.filter(u => u.role === role && !u.isDeleted).length;
  }
}