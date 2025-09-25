import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user?: User;
  isLoading = true;

  private auth = inject(Auth);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (u) => {
          this.user = u;
          this.isLoading = false;
        },
        error: () => {
          this.toast.error('Failed to load profile');
          this.isLoading = false;
        }
      });
    } else {
      this.toast.error('User not authenticated');
      this.isLoading = false;
    }
  }
}