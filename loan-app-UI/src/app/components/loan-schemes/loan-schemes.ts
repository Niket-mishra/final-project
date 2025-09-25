import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanScheme } from '../../models/loan-scheme';
import { SchemeService } from '../../services/scheme-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-loan-schemes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-schemes.html',
  styleUrls: ['./loan-schemes.css']
})
export class LoanSchemes implements OnInit {
  schemes: LoanScheme[] = [];
  isLoading = true;

  private schemeService = inject(SchemeService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.schemeService.getAllSchemes().subscribe({
      next: (data) => {
        this.schemes = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load loan schemes');
        this.isLoading = false;
      }
    });
  }
}