import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { LoanDocument, DocumentStatus } from '../../models/loan-document';

@Component({
  selector: 'app-officer-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-documents.html',
  styleUrl: './officer-documents.css'
})
export class OfficerDocuments implements OnInit {
  isLoading = true;
  errorMessage = '';
  documents: LoanDocument[] = [];

  constructor(private officerService: OfficerService, private auth: Auth) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();
    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.officerService.getDocumentsForAssignedApplications(officerId).subscribe({
      next: (data: LoanDocument[]) => {
        this.documents = data;
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load documents.')
    });
  }

  updateStatus(doc: LoanDocument, newStatus: DocumentStatus): void {
    const officerId = this.auth.getUserId();
if (officerId == null) {
  this.handleError('Officer ID not found.');
  return;
}

    const payload = {
      verificationStatus: newStatus,
      verificationDate: new Date(),
      verifiedBy: officerId
    };

    this.officerService.updateDocumentStatus(doc.documentId, payload).subscribe({
      next: () => doc.verificationStatus = newStatus,
      error: () => this.handleError(`Failed to update status for ${doc.documentType}`)
    });
  }

  updateRemarks(doc: LoanDocument): void {
    this.officerService.updateDocumentRemarks(doc.documentId, doc.verificationRemarks).subscribe({
      next: () => {}, // optionally show toast
      error: () => this.handleError(`Failed to update remarks for ${doc.documentType}`)
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  getStatusBadge(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.Approved: return 'success';
      case DocumentStatus.Rejected: return 'danger';
      case DocumentStatus.Pending: return 'warning';
      default: return 'secondary';
    }
  }
}