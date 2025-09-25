import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  settingsForm = this.fb.group({
    notifications: [true],
    darkMode: [false],
    autoRefresh: [true]
  });

  isSaving = false;

  saveSettings(): void {
    this.isSaving = true;
    setTimeout(() => {
      this.toast.success('Settings saved successfully');
      this.isSaving = false;
    }, 1000); // Simulate async save
  }
}