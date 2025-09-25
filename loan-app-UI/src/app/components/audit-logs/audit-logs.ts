import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoanApplicationService } from '../../services/loan-application-service';

interface AuditEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
  remarks?: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './audit-logs.html',
  styleUrls: ['./audit-logs.css']
})
export class AuditLogs implements OnInit {
  @Input() applicationId!: number;

  auditEntries: AuditEntry[] = [];
  isLoading = true;

  private applicationService = inject(LoanApplicationService);

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadAuditLogs();
    } else {
      console.warn('AuditLogs: applicationId not provided');
      this.isLoading = false;
    }
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.applicationService.getAuditLog(this.applicationId).subscribe({
      next: (logs) => {
        this.auditEntries = logs;
        this.isLoading = false;
      },
      error: () => {
        console.error('Failed to load audit logs');
        this.isLoading = false;
      }
    });
  }
}