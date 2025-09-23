import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Customer, VerificationStatus } from '../../models/customer';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  templateUrl: './customer-profile-component.html',
  styleUrls: ['./customer-profile-component.css']
})
export class CustomerProfileComponent {
  @Input() customer!: Customer;
  @Output() close = new EventEmitter<void>();

  getStatusColor(status: VerificationStatus | null): string {
    switch (status) {
      case VerificationStatus.Verified: return 'success';
      case VerificationStatus.Rejected: return 'danger';
      case VerificationStatus.Pending: return 'warning';
      default: return 'secondary';
    }
  }

  closeProfile(): void {
    this.close.emit();
  }
}