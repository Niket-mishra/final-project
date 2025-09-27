import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanScheme } from '../../models/loan-scheme';

@Component({
  selector: 'app-loan-scheme-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-scheme-details.html',
  styleUrl: './loan-scheme-details.css'
})
export class LoanSchemeDetails {
  @Input() scheme!: LoanScheme;

  getStatusBadge(): string {
    return this.scheme.isActive ? 'success' : 'secondary';
  }

  getFormattedDate(date?: Date): string {
    return date ? new Date(date).toLocaleDateString('en-IN') : '—';
  }
}