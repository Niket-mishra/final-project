import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user-service';
import { ToastService } from '../../services/toast-service';
import { Role, User } from '../../models/user';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {
  users: User[] = [];
  isLoading = true;

  private userService = inject(UserService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load users');
        this.isLoading = false;
      }
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === Role.Admin ? Role.LoanOfficer : Role.Customer;
    this.userService.updateUserRole(user.userId, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.toast.success(`Role updated to ${newRole}`);
      },
      error: () => {
        this.toast.error('Failed to update role');
      }
    });
  }
}